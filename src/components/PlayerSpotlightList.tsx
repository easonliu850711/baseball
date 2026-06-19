'use client'

import { useEffect, useState } from 'react'
import PlayerModal, { type Player, type NewsItem } from '@/components/PlayerModal'
import { extractPlayers } from '@/lib/api-response'

const PRIORITY = ['lee-hao-yu', 'deng-kai-wei', 'cheng-tsung-che', 'lin-yu-min', 'wang-yen-cheng']

export default function PlayerSpotlightList() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedNews, setSelectedNews] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(false)

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

  useEffect(() => {
    if (!selectedPlayer) return
    setSelectedNews([])
    setNewsLoading(true)
    fetch(`/api/news?player_id=${encodeURIComponent(selectedPlayer.player_id)}`)
      .then(r => r.json())
      .then(payload => {
        const data = payload?.data || payload
        setSelectedNews(data?.news || data?.items || data || [])
        setNewsLoading(false)
      })
      .catch(() => setNewsLoading(false))
  }, [selectedPlayer])

  return (
    <>
      <section className="rounded-2xl border border-ocean-light/10 bg-ocean-deep/50 p-5">
        <div className="mb-4">
          <h2 className="text-sm font-bold tracking-wide text-shell-white">旅外球員追蹤</h2>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 rounded-xl bg-ocean-mid/30 animate-pulse" />)}
          </div>
        ) : players.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ocean-light/10 bg-ocean-mid/20 py-8 text-center text-sm text-stone-gray/50">
            球員資料同步中
          </div>
        ) : (
          <div className="divide-y divide-ocean-light/10">
            {players.map(p => (
              <button
                key={p.player_id}
                type="button"
                onClick={() => setSelectedPlayer(p)}
                className="grid w-full grid-cols-[1fr_auto] gap-3 py-3 text-left hover:bg-ocean-mid/20 transition-colors rounded-lg px-2 -mx-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-shell-white">
                    {p.name_zh || p.name_en || p.player_id}
                  </div>
                  <div className="mt-1 truncate text-[12px] text-stone-gray/50">
                    {[p.name_en, p.organization, p.current_level].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <span className="self-center rounded-full bg-ocean-light/15 px-2.5 py-1 text-[11px] font-semibold text-ocean-foam">
                  {p.league || 'INT'}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          news={selectedNews}
          newsLoading={newsLoading}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </>
  )
}
