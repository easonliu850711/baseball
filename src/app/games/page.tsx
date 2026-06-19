'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTeamDisplayName } from '@/lib/teamNames'
import { unwrapApiData } from '@/lib/api-response'

const LEAGUES = ['NPB', 'MLB', 'CPBL', 'KBO'] as const
type League = (typeof LEAGUES)[number]

type Game = {
  id: number
  league: string
  game_date: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  stadium: string
  status: string
  game_time: string
  source?: string
  game_pk?: string
}

function todayInTaipei() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const y = parts.find(p => p.type === 'year')?.value || ''
  const m = parts.find(p => p.type === 'month')?.value || ''
  const d = parts.find(p => p.type === 'day')?.value || ''
  return `${y}-${m}-${d}`
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    scheduled: '未開始',
    live: '進行中',
    finished: '已結束',
    postponed: '延賽',
    cancelled: '取消',
    reserved: '保留',
    suspended: '暫停',
  }
  return map[status] || status
}

function statusClass(status: string) {
  if (status === 'finished') return 'bg-stone-gray/20 text-stone-gray'
  if (status === 'live') return 'bg-coral/20 text-coral'
  if (['postponed', 'cancelled', 'reserved', 'suspended'].includes(status)) return 'bg-yellow-500/20 text-yellow-300'
  return 'bg-ocean-wave/20 text-ocean-wave'
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLeague, setActiveLeague] = useState<League>('NPB')
  const [selectedDate, setSelectedDate] = useState(todayInTaipei)

  async function fetchGames(date: string, league: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('date', date)
      if (league !== 'ALL') params.set('league', league)

      const res = await fetch(`/api/games?${params}`)
      if (!res.ok) throw new Error('API error')
      const payload = await res.json()
      const data = unwrapApiData<any>(payload)
      setGames(data.games || [])
    } catch (err) {
      console.error('Failed to fetch games:', err)
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames(selectedDate, activeLeague)
  }, [selectedDate, activeLeague])

  const filteredGames = activeLeague === ('ALL' as League)
    ? games
    : games.filter(g => g.league === activeLeague)

  // 依聯盟分組
  const grouped = LEAGUES.reduce((acc, league) => {
    const lgGames = filteredGames.filter(g => g.league === league)
    if (lgGames.length > 0) acc[league] = lgGames
    return acc
  }, {} as Record<string, Game[]>)

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-abyss to-ocean-deep py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 🔙 回主頁 */}
        <Link href="/" className="inline-flex items-center gap-2 text-stone-gray hover:text-shell-white transition-colors mb-8 text-sm">
          ← 回到戰績首頁
        </Link>

        {/* 英雄區 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-ocean-wave to-coral mb-6 shadow-lg shadow-ocean-wave/20">
            <span className="text-4xl">⚾</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">今日賽程</span>
          </h1>
          <p className="text-stone-gray max-w-xl mx-auto">
            選擇聯盟與日期，即時顯示 NPB · MLB · CPBL · KBO 賽程與賽果
          </p>
        </div>

        {/* 篩選列 */}
        <div className="flex flex-wrap items-center gap-3 mb-8 justify-center">
          {/* 日期選擇 */}
          <div className="flex items-center gap-2 ocean-card px-4 py-2 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
            <span className="text-sm">📅</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-shell-white text-sm border-none outline-none [color-scheme:dark]"
            />
          </div>

          {/* 聯盟切換 — 無全部 */}
          <div className="flex gap-1 ocean-card p-1 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
            {LEAGUES.map(lg => (
              <button
                key={lg}
                onClick={() => setActiveLeague(lg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeLeague === lg ? 'bg-ocean-wave text-white shadow-sm' : 'text-stone-gray hover:text-shell-white'
                }`}
              >
                {lg}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchGames(selectedDate, activeLeague)}
            className="ocean-card p-2 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 text-stone-gray hover:text-shell-white transition-colors"
          >
            <span className={`inline-block text-sm ${loading ? 'animate-spin' : ''}`}>↻</span>
          </button>
        </div>

        {/* 賽程內容 */}
        <div>
          {loading ? (
            <div className="text-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-wave border-t-transparent mx-auto mb-4" />
              <p className="text-stone-gray text-sm">載入賽程中...</p>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-20">
              <span className="text-4xl block mb-4">📅</span>
              <p className="text-stone-gray text-lg mb-2">今日無賽程</p>
              <p className="text-stone-gray/50 text-sm">
                {selectedDate} 沒有 {activeLeague} 比賽
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([league, lgGames]) => (
                <section key={league}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-wave to-ocean-surface flex items-center justify-center">
                      <span className="text-sm">⚾</span>
                    </div>
                    <h2 className="text-xl font-bold text-gradient">{league}</h2>
                    <span className="text-xs text-stone-gray/50">{lgGames.length} 場</span>
                  </div>

                  <div className="space-y-3">
                    {lgGames.map((game) => (
                      <div
                        key={`${game.league}-${game.game_date}-${game.game_pk || game.id}-${game.away_team}-${game.home_team}`}
                        className="ocean-card p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 hover:border-ocean-light/40 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          {/* 客隊 vs 主隊 */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-medium text-shell-white">{getTeamDisplayName(game.away_team)}</span>
                              <span className="text-xs text-stone-gray/40">@</span>
                              <span className="text-sm font-medium text-shell-white">{getTeamDisplayName(game.home_team)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-stone-gray/50">
                              <span className="flex items-center gap-1">
                                <span className="text-xs">📍</span> {game.stadium}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-xs">⏰</span> {game.game_time || '未定'}
                              </span>
                              {game.source && (
                                <span className="hidden sm:inline text-stone-gray/35">{game.source}</span>
                              )}
                            </div>
                          </div>

                          {/* 比數 */}
                          <div className="text-right">
                            {game.home_score !== null && game.away_score !== null ? (
                              <div className="text-xl font-bold text-shell-white">
                                {game.away_score} - {game.home_score}
                              </div>
                            ) : (
                              <div className={`text-xs px-3 py-1 rounded-full ${statusClass(game.status)}`}>
                                {statusLabel(game.status)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
