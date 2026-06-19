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
        setPlayers(ordered.slice(0, 6))
      })
      .catch(() => setPlayers([]))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  return (
    <section className="imori-card p-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="imori-section-title">Spotlight</div>
          <h2 className="mt-1 text-lg">旅外球員追蹤</h2>
        </div>
        <Link href="/players" className="text-[12px] font-semibold text-slate-500 hover:text-slate-950">
          全部球員 →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : players.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
          球員資料同步中
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {players.map(p => (
            <Link
              key={p.player_id}
              href={`/players/${p.player_id}`}
              className="grid grid-cols-[1fr_auto] gap-3 py-3 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-950">
                  {p.name_zh || p.name_en || p.player_id}
                </div>
                <div className="mt-1 truncate text-[12px] text-slate-500">
                  {[p.name_en, p.organization, p.current_level].filter(Boolean).join(' · ')}
                </div>
              </div>
              <span className="self-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {p.league || 'INT'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
