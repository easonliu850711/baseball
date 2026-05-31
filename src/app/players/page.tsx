'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Globe, Search, Filter, RefreshCw, AlertCircle, ExternalLink, Loader2, X, Newspaper, Clock, Building2, Shield } from 'lucide-react'
import { getTeamDisplayName } from '@/lib/teamNames'

type Player = {
  player_id: string
  name_zh: string
  name_en: string
  country: string
  league: string
  organization: string
  team_name: string
  current_level: string
  roster_status: string
  position: string
  bats_throws: string
  confidence: string
  needs_review?: boolean
}

type NewsItem = {
  id: number
  player_id: string
  title: string
  url: string
  source: string
  published_at: string
  summary: string
}

type LeagueGroup = {
  league: 'MLB' | 'NPB' | 'KBO'
  label: string
  flag: string
  players: Player[]
}

const LEAGUES = ['MLB', 'NPB', 'KBO'] as const
const LEAGUE_META: Record<(typeof LEAGUES)[number], { label: string; flag: string }> = {
  MLB: { label: '美國 MLB / MiLB', flag: '🇺🇸' },
  NPB: { label: '日本 NPB', flag: '🇯🇵' },
  KBO: { label: '韓國 KBO', flag: '🇰🇷' },
}

function getLeagueGroup(player: Player): (typeof LEAGUES)[number] {
  const league = String(player.league || '').toUpperCase()
  if (league.includes('NPB') || player.country === 'JP') return 'NPB'
  if (league.includes('KBO') || player.country === 'KR') return 'KBO'
  return 'MLB'
}

function getLevelGroup(player: Player): 'MAJOR' | 'MINOR' | 'OTHER' {
  const level = String(player.current_level || '').toUpperCase()
  const rawLevel = String(player.current_level || '')
  const status = String(player.roster_status || '')

  if (
    level === 'MLB' ||
    rawLevel === '1軍' ||
    rawLevel === '一軍' ||
    rawLevel.includes('支配下') ||
    status.includes('MLB debut')
  ) {
    return 'MAJOR'
  }

  if (
    level.includes('3A') ||
    level.includes('2A') ||
    level.includes('HIGH-A') ||
    level.includes('LOW-A') ||
    level.includes('ROOKIE') ||
    rawLevel.includes('2軍') ||
    rawLevel.includes('二軍') ||
    rawLevel.includes('育成') ||
    level.includes('MILB') ||
    level.includes('MINOR')
  ) {
    return 'MINOR'
  }

  return 'OTHER'
}

function getLevelColor(level: string): string {
  if (level === 'MLB' || level === '1軍' || level === '一軍') return 'bg-emerald-500/20 text-emerald-400'
  if (level === '3A' || level.includes('2軍') || level.includes('二軍')) return 'bg-blue-500/20 text-blue-400'
  if (level === '2A') return 'bg-violet-500/20 text-violet-400'
  if (level === 'High-A') return 'bg-amber-500/20 text-amber-400'
  if (level === 'Low-A') return 'bg-stone-500/20 text-stone-gray'
  return 'bg-ocean-light/20 text-stone-gray'
}

function getStatusColor(status: string): string {
  if (status.includes('Active') || status.includes('支配下') || status.includes('MLB debut'))
    return 'bg-emerald-500/20 text-emerald-400'
  if (status.includes('40-man')) return 'bg-sky-500/20 text-sky-400'
  if (status.includes('育成')) return 'bg-amber-500/20 text-amber-400'
  if (status.includes('IL') || status.includes('injury')) return 'bg-red-500/20 text-red-400'
  return 'bg-ocean-light/20 text-stone-gray'
}

function getConfidenceIcon(c: string): string {
  return c === 'high' ? '🟢' : c === 'medium' ? '🟡' : '🔴'
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

function PlayerModal({
  player,
  news,
  newsLoading,
  onClose,
}: {
  player: Player
  news: NewsItem[]
  newsLoading: boolean
  onClose: () => void
}) {
  const league = getLeagueGroup(player)
  const leagueMeta = LEAGUE_META[league]
  const organization = getTeamDisplayName(player.organization)
  const teamName = getTeamDisplayName(player.team_name)

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-ocean-light/20 bg-ocean-abyss shadow-2xl shadow-black/40"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-ocean-light/20 bg-ocean-mid/60 p-2 text-stone-gray transition-colors hover:text-shell-white"
          aria-label="關閉球員詳情"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-wave to-emerald-400 text-3xl font-bold text-white shadow-lg shadow-ocean-wave/20">
              {player.name_zh[0]}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-bold text-shell-white">{player.name_zh}</h2>
                <span className="text-sm text-stone-gray/50">{player.name_en}</span>
                <span className="text-xs">{getConfidenceIcon(player.confidence)}</span>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-ocean-light/15 px-3 py-1 text-xs text-ocean-foam">{leagueMeta.flag} {league}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${getLevelColor(player.current_level)}`}>{player.current_level}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${getStatusColor(player.roster_status)}`}>{player.roster_status}</span>
                {player.needs_review && <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-400">需核實</span>}
              </div>

              <p className="flex items-center gap-2 text-sm text-stone-gray/60">
                <Building2 className="h-4 w-4" />
                {organization}{teamName && teamName !== organization ? ` · ${teamName}` : ''}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              { label: '守備位置', value: player.position || '-', icon: '🎯' },
              { label: '投打習慣', value: player.bats_throws || '-', icon: '🔄' },
              { label: '所屬聯盟', value: player.league || league, icon: '🏆' },
              { label: '所屬球隊', value: teamName || organization || '-', icon: '🏟️' },
              { label: '球團組織', value: organization || '-', icon: '🏛️' },
              { label: '旅外區域', value: `${leagueMeta.flag} ${leagueMeta.label}`, icon: '🌍' },
              { label: '當前層級', value: player.current_level || '-', icon: '📊' },
              { label: '狀態', value: player.roster_status || '-', icon: '💡' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-ocean-light/10 bg-ocean-mid/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-stone-gray/40">{item.label}</p>
                    <p className="text-sm font-medium text-shell-white">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-ocean-wave" />
              <h3 className="text-sm font-bold text-shell-white">相關新聞</h3>
              {newsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-gray/40" />}
            </div>

            {!newsLoading && news.length === 0 && (
              <div className="rounded-xl border border-ocean-light/10 bg-ocean-mid/10 p-5 text-center">
                <p className="text-sm text-stone-gray/50">目前尚無相關新聞</p>
                <p className="mt-1 text-[11px] text-stone-gray/40">之後可接指定新聞來源或手動維護連結</p>
              </div>
            )}

            {!newsLoading && news.length > 0 && (
              <div className="space-y-2">
                {news.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-ocean-light/10 bg-ocean-mid/10 p-4 transition-all hover:border-ocean-wave/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm text-shell-white transition-colors hover:text-ocean-wave">{item.title}</p>
                        {item.summary && <p className="mt-1 line-clamp-2 text-xs text-stone-gray/50">{item.summary}</p>}
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[10px] text-stone-gray/40">{item.source}</span>
                          <span className="flex items-center gap-1 text-[10px] text-stone-gray/30">
                            <Clock className="h-3 w-3" />
                            {String(item.published_at || '').slice(0, 10) || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-stone-gray/30" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-ocean-light/10 bg-ocean-deep/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-stone-gray/40" />
              <span className="text-[11px] text-stone-gray/40">系統資訊</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] md:grid-cols-3">
              <div><span className="text-stone-gray/40">player_id</span><p className="font-mono text-stone-gray/60">{player.player_id}</p></div>
              <div><span className="text-stone-gray/40">信賴等級</span><p className="text-stone-gray/60">{player.confidence === 'high' ? '🟢 高' : player.confidence === 'medium' ? '🟡 中' : '🔴 低'}</p></div>
              <div><span className="text-stone-gray/40">需核實</span><p className="text-stone-gray/60">{player.needs_review ? '⚠️ 是' : '—'}</p></div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function OverseasPlayers() {
  const [mounted, setMounted] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [leagueFilter, setLeagueFilter] = useState<'ALL' | 'MLB' | 'NPB' | 'KBO'>('ALL')
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'MAJOR' | 'MINOR'>('ALL')
  const [lastUpdated, setLastUpdated] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedNews, setSelectedNews] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    setLoading(true)
    fetch('/api/players')
      .then(r => r.json())
      .then(data => {
        setPlayers(data.players || [])
        setLastUpdated(data.meta?.last_updated || '')
        setLoading(false)
      })
      .catch(() => {
        setError('無法載入球員資料')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!selectedPlayer) return

    setSelectedNews([])
    setNewsLoading(true)
    fetch(`/api/news?player_id=${encodeURIComponent(selectedPlayer.player_id)}`)
      .then(r => r.json())
      .then(data => {
        setSelectedNews(data.news || [])
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
      getTeamDisplayName(player.team_name).toLowerCase().includes(q) ||
      player.organization.toLowerCase().includes(q) ||
      player.team_name.toLowerCase().includes(q)
    )
  }

  const visiblePlayers = sortPlayers(players).filter((player) => {
    const league = getLeagueGroup(player)
    const level = getLevelGroup(player)

    return (
      matchesSearch(player) &&
      (leagueFilter === 'ALL' || league === leagueFilter) &&
      (levelFilter === 'ALL' || level === levelFilter)
    )
  })

  const groups: LeagueGroup[] = LEAGUES.map((league) => ({
    league,
    ...LEAGUE_META[league],
    players: visiblePlayers.filter((player) => getLeagueGroup(player) === league),
  }))

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-abyss via-ocean-deep to-ocean-abyss py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-gray hover:text-shell-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> 回戰績首頁
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-ocean-wave to-emerald-400 mb-6 shadow-lg shadow-ocean-wave/20">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">旅外球員</span>
          </h1>
          <p className="text-lg text-stone-gray/80 max-w-2xl mx-auto mb-2">台灣囝仔 · 放眼世界</p>
          <p className="text-sm text-stone-gray/50">
            {players.length} 位選手 · 旅外球員資料庫
          </p>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-ocean-wave animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 bg-ocean-mid/10 rounded-xl border border-ocean-light/5">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="text-sm text-rose-400/80">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-gray/50" />
                <input
                  type="text"
                  placeholder="搜尋選手姓名、球隊…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ocean-mid/30 border border-ocean-light/20 text-shell-white text-sm placeholder:text-stone-gray/40 focus:outline-none focus:border-ocean-wave/50 transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <Filter className="w-4 h-4 text-stone-gray/50" />
                {[
                  { value: 'ALL', label: '全部聯盟' },
                  { value: 'MLB', label: 'MLB' },
                  { value: 'NPB', label: 'NPB' },
                  { value: 'KBO', label: 'KBO' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setLeagueFilter(item.value as typeof leagueFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${leagueFilter === item.value ? 'bg-ocean-wave/20 text-ocean-wave' : 'bg-ocean-mid/30 text-stone-gray/60 hover:text-shell-white'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { value: 'ALL', label: '全部層級' },
                  { value: 'MAJOR', label: '一軍' },
                  { value: 'MINOR', label: '二軍' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setLevelFilter(item.value as typeof levelFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${levelFilter === item.value ? 'bg-ocean-wave/20 text-ocean-wave' : 'bg-ocean-mid/30 text-stone-gray/60 hover:text-shell-white'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {groups.map((group, gi) => (
              <motion.section
                key={group.league}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.12 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{group.flag}</span>
                  <h2 className="text-xl font-bold text-gradient">{group.label}</h2>
                  <span className="text-xs text-stone-gray/40 ml-auto">{group.players.length} 位</span>
                </div>

                {group.players.length === 0 ? (
                  <div className="text-center py-12 bg-ocean-mid/10 rounded-xl border border-ocean-light/5">
                    <AlertCircle className="w-8 h-8 text-stone-gray/40 mx-auto mb-2" />
                    <p className="text-sm text-stone-gray/50">無符合條件的選手</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.players.map((player) => {
                      const organization = getTeamDisplayName(player.organization)
                      const teamName = getTeamDisplayName(player.team_name)

                      return (
                        <motion.div
                          key={player.player_id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedPlayer(player)}
                            className="ocean-card group w-full text-left p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 hover:border-ocean-wave/40 transition-all block cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-ocean-wave to-emerald-400 flex items-center justify-center text-white font-bold text-base shrink-0">
                                {player.name_zh[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-bold text-shell-white text-sm">{player.name_zh}</h3>
                                  <span className="text-[10px] text-stone-gray/50">{player.name_en}</span>
                                  <span className="text-xs">{getConfidenceIcon(player.confidence)}</span>
                                </div>
                                <p className="text-[11px] text-stone-gray/60 mb-1.5">{player.position} · {player.bats_throws}</p>
                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-ocean-light/15 text-ocean-foam">{organization}</span>
                                  {teamName && teamName !== organization && <span className="text-[10px] px-2 py-0.5 rounded-full bg-ocean-light/10 text-stone-gray/70">{teamName}</span>}
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getLevelColor(player.current_level)}`}>{player.current_level}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(player.roster_status)}`}>{player.roster_status}</span>
                                  {player.needs_review && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">需核實</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.section>
            ))}

            <div className="mt-12 ocean-card p-5 rounded-xl border border-ocean-light/10 bg-ocean-deep/30">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="w-4 h-4 text-stone-gray/40" />
                <span className="text-xs text-stone-gray/50">系統資訊</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-stone-gray/40">白名單</span>
                  <p className="text-stone-gray/70">{players.length} 位</p>
                </div>
                <div>
                  <span className="text-stone-gray/40">分聯盟</span>
                  <p className="text-stone-gray/70">
                    MLB {players.filter(p => getLeagueGroup(p) === 'MLB').length}
                    {' · '}NPB {players.filter(p => getLeagueGroup(p) === 'NPB').length}
                    {' · '}KBO {players.filter(p => getLeagueGroup(p) === 'KBO').length}
                  </p>
                </div>
                <div>
                  <span className="text-stone-gray/40">資料源</span>
                  <p className="text-stone-gray/70">overseas-players.json</p>
                </div>
                <div>
                  <span className="text-stone-gray/40">更新</span>
                  <p className="text-stone-gray/70">{lastUpdated || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-[11px] text-stone-gray/40">
                V1 — 旅外球員資料庫 · 點擊球員卡片查看詳情
              </p>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedPlayer && (
          <PlayerModal
            player={selectedPlayer}
            news={selectedNews}
            newsLoading={newsLoading}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
