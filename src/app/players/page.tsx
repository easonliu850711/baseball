'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTeamDisplayName } from '@/lib/teamNames'
import { unwrapApiData, extractPlayers, extractNews } from '@/lib/api-response'
import PlayerModal, { type Player, type NewsItem } from '@/components/PlayerModal'

const LEAGUES = ['MLB', 'NPB', 'KBO'] as const
const LEAGUE_META: Record<(typeof LEAGUES)[number], { label: string; flag: string }> = {
  MLB: { label: '美國 MLB / MiLB', flag: '🇺🇸' },
  NPB: { label: '日本 NPB', flag: '🇯🇵' },
  KBO: { label: '韓國 KBO', flag: '🇰🇷' },
}

type LeagueGroup = {
  league: (typeof LEAGUES)[number]
  label: string
  flag: string
  players: Player[]
}

function getLeagueGroup(player: Player): (typeof LEAGUES)[number] {
  const league = String(player.league || '').toUpperCase()
  if (league.includes('NPB') || player.organization === 'JP') return 'NPB'
  if (league.includes('KBO') || player.organization === 'KR') return 'KBO'
  return 'MLB'
}

const LEVEL_ORDER: Record<string, number> = {
  'MLB': 0, '1軍': 1, '一軍': 1, '支配下': 1,
  '3A': 2, '2A': 3, 'High-A': 4, 'Low-A': 5, '2軍': 6, '二軍': 6, 'Rookie': 7, '育成': 8,
}

function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const leagueDiff = LEAGUES.indexOf(getLeagueGroup(a)) - LEAGUES.indexOf(getLeagueGroup(b))
    if (leagueDiff !== 0) return leagueDiff
    const la = LEVEL_ORDER[a.current_level] ?? 99
    const lb = LEVEL_ORDER[b.current_level] ?? 99
    if (la !== lb) return la - lb
    return a.name_zh.localeCompare(b.name_zh, 'zh')
  })
}

function getLevelColor(level: string): string {
  if (level === 'MLB' || level === '1軍' || level === '一軍') return 'bg-emerald-500/20 text-emerald-400'
  if (level === '3A' || level.includes('2軍') || level.includes('二軍')) return 'bg-blue-500/20 text-blue-400'
  if (level === '2A') return 'bg-violet-500/20 text-violet-400'
  if (level === 'High-A') return 'bg-amber-500/20 text-amber-400'
  if (level === 'Low-A') return 'bg-stone-500/20 text-stone-gray'
  return 'bg-ocean-light/20 text-stone-gray'
}

export default function OverseasPlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedNews, setSelectedNews] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/players')
      .then(r => r.json())
      .then(data => {
        const players = extractPlayers(data)
        setPlayers(players)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedPlayer) return
    setSelectedNews([])
    setNewsLoading(true)
    fetch(`/api/news?player_id=${encodeURIComponent(selectedPlayer.player_id)}`)
      .then(r => r.json())
      .then(data => {
        const news = extractNews(data)
        setSelectedNews(news)
        setNewsLoading(false)
      })
      .catch(() => setNewsLoading(false))
  }, [selectedPlayer])

  const matchesSearch = (player: Player) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      player.name_zh.includes(search.trim()) ||
      player.name_en.toLowerCase().includes(q) ||
      getTeamDisplayName(player.organization).toLowerCase().includes(q) ||
      getTeamDisplayName(player.team_name).toLowerCase().includes(q)
    )
  }

  const visiblePlayers = sortPlayers(players).filter(matchesSearch)

  const groups: LeagueGroup[] = LEAGUES.map((league) => ({
    league,
    ...LEAGUE_META[league],
    players: visiblePlayers.filter((player) => getLeagueGroup(player) === league),
  }))

  return (
    <div className="min-h-screen bg-ocean-abyss py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-gray hover:text-shell-white transition-colors mb-8 text-sm">
          ← 回首頁
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-shell-white sm:text-4xl">旅外球員</h1>
          <p className="mt-2 text-sm text-stone-gray/50">{players.length} 位選手</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-wave border-t-transparent" />
          </div>
        )}

        {!loading && (
          <>
            <div className="flex flex-col items-center gap-4 mb-8">
              <input
                type="text"
                placeholder="搜尋選手姓名、球隊…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full max-w-md rounded-xl bg-ocean-mid/30 border border-ocean-light/20 px-4 py-2.5 text-sm text-shell-white placeholder:text-stone-gray/40 focus:outline-none focus:border-ocean-wave/50 transition-colors"
              />
            </div>

            {groups.map((group, gi) => (
              <section key={group.league} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">{group.flag}</span>
                  <h2 className="text-base font-bold text-shell-white">{group.label}</h2>
                  <span className="text-xs text-stone-gray/40 ml-auto">{group.players.length} 位</span>
                </div>

                {group.players.length === 0 ? (
                  <div className="rounded-xl border border-ocean-light/10 bg-ocean-mid/20 py-10 text-center">
                    <p className="text-sm text-stone-gray/50">無符合條件的選手</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.players.map((player) => (
                      <button
                        key={player.player_id}
                        type="button"
                        onClick={() => setSelectedPlayer(player)}
                        className="w-full text-left rounded-xl border border-ocean-light/20 bg-ocean-mid/20 p-4 hover:border-ocean-wave/40 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-ocean-wave to-emerald-400 flex items-center justify-center text-white font-bold text-base">
                            {player.name_zh[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-shell-white text-sm">{player.name_zh}</h3>
                              <span className="text-[10px] text-stone-gray/50">{player.name_en}</span>
                            </div>
                            <p className="text-[11px] text-stone-gray/60 mb-1.5">{player.position} · {player.bats_throws}</p>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-ocean-light/15 text-ocean-foam">{getTeamDisplayName(player.team_name)}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${getLevelColor(player.current_level)}`}>{player.current_level}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </>
        )}
      </div>

      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          news={selectedNews}
          newsLoading={newsLoading}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  )
}
