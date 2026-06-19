'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { extractPlayers } from '@/lib/api-response'

interface Player {
  player_id: string
  name_zh: string
  name_en?: string
  league?: string
  organization?: string
  current_level?: string
  roster_status?: string
}

const PRIORITY = ['lee-hao-yu', 'deng-kai-wei', 'cheng-tsung-che', 'lin-yu-min', 'wang-yen-cheng']

export default function PlayerSpotlightList() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch('/api/players', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(payload => {
        if (!alive) return
        const list = extractPlayers(payload) as Player[]
        const ordered = [...list].sort((a, b) => {
          const ia = PRIORITY.indexOf(a.player_id)
          const ib = PRIORITY.indexOf(b.player_id)
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
        })
        setPlayers(ordered.slice(0, 5))
      })
      .catch(() => setPlayers([]))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  if (loading) {
    return (
      <section>
        <div className="text-[11px] uppercase tracking-wider text-stone-gray/45 mb-3">Spotlight</div>
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-7 bg-ocean-mid/20 rounded animate-pulse" />)}</div>
      </section>
    )
  }

  return (
    <section>
      <div className="text-[11px] uppercase tracking-wider text-stone-gray/45 mb-3">Spotlight</div>
      {players.length === 0 ? (
        <div className="border-y border-white/[0.06] py-6 text-center text-[12px] text-stone-gray/50">球員資料同步中</div>
      ) : (
        <div className="space-y-0.5">
          {players.map(p => (
            <Link
              key={p.player_id}
              href={`/players/${p.player_id}`}
              className="flex items-center gap-2 py-1.5 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group"
            >
              <span className="text-[13px] text-shell-white group-hover:text-ocean-wave transition-colors shrink-0">
                {p.name_zh || p.name_en || p.player_id}
              </span>
              <span className="text-[11px] text-stone-gray/55 truncate">
                {[p.league, p.organization, p.current_level, p.roster_status && p.roster_status !== 'Unknown' ? p.roster_status : null]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
