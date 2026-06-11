'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, Globe, Search, Filter, RefreshCw, AlertCircle,
  ExternalLink, Loader2, X, Newspaper, Clock, Building2, Shield,
  User, MapPin, Flag, Activity
} from 'lucide-react'
import { getTeamDisplayName } from '@/lib/teamNames'
import { unwrapApiData, extractPlayers, extractTotal, extractMeta } from '@/lib/api-response'

/* ============================================================
   Types
   ============================================================ */

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

/* ============================================================
   Constants
   ============================================================ */

const LEAGUES = ['MLB', 'NPB', 'KBO'] as const

const LEAGUE_META: Record<(typeof LEAGUES)[number], { label: string; flag: string }> = {
  MLB: { label: '美國 MLB / MiLB', flag: '🇺🇸' },
  NPB: { label: '日本 NPB', flag: '🇯🇵' },
  KBO: { label: '韓國 KBO', flag: '🇰🇷' },
}

const LEVEL_TAG_CONFIG: Record<string, { label: string; variant: string }> = {
  'MLB':       { label: 'MLB',         variant: 'emerald' },
  '1軍':       { label: '1軍',         variant: 'emerald' },
  '一軍':      { label: '一軍',        variant: 'emerald' },
  '支配下':    { label: '支配下',      variant: 'teal' },
  '3A':        { label: '3A',          variant: 'blue' },
  '2A':        { label: '2A',          variant: 'violet' },
  'High-A':    { label: 'High-A',      variant: 'amber' },
  'Low-A':     { label: 'Low-A',       variant: 'stone' },
  'Rookie':    { label: 'Rookie',      variant: 'stone' },
  '2軍':       { label: '2軍',         variant: 'blue' },
  '二軍':      { label: '二軍',        variant: 'blue' },
  '育成':      { label: '育成',        variant: 'rose' },
}

const STATUS_TAG_CONFIG: Record<string, { label: string; variant: string }> = {
  'Active':      { label: 'Active',    variant: 'emerald' },
  '支配下':     { label: '支配下',    variant: 'teal' },
  'MLB debut':   { label: 'MLB debut', variant: 'emerald' },
  '40-man':      { label: '40-man',    variant: 'sky' },
  '育成':       { label: '育成',      variant: 'amber' },
  'IL':          { label: 'IL',        variant: 'red' },
}

const VARIANT_CLASSES: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  teal:    'bg-teal-500/15 text-teal-300 border-teal-500/20',
  blue:    'bg-blue-500/15 text-blue-300 border-blue-500/20',
  violet:  'bg-violet-500/15 text-violet-300 border-violet-500/20',
  amber:   'bg-amber-500/15 text-amber-300 border-amber-500/20',
  sky:     'bg-sky-500/15 text-sky-300 border-sky-500/20',
  rose:    'bg-rose-500/15 text-rose-300 border-rose-500/20',
  red:     'bg-red-500/15 text-red-300 border-red-500/20',
  stone:   'bg-stone-500/15 text-stone-400 border-stone-500/15',
}

/* ============================================================
   Helpers
   ============================================================ */

function getLeagueGroup(player: Player): (typeof LEAGUES)[number] {
  const league = (player.league || '').toUpperCase()
  if (league.includes('KBO') || player.country === 'KR') return 'KBO'
  if (league.includes('NPB') || player.country === 'JP') return 'NPB'
  return 'MLB'
}

function getLevelGroup(player: Player): 'MAJOR' | 'MINOR' | 'OTHER' {
  const rawLevel = player.current_level || ''
  const level = rawLevel.toUpperCase()
  const status = (player.roster_status || '').toUpperCase()

  if (
    level === 'MLB' ||
    rawLevel === '1軍' || rawLevel === '一軍' ||
    rawLevel.includes('支配下') ||
    status.includes('MLB DEBUT')
  ) return 'MAJOR'

  if (
    level.includes('3A') || level.includes('2A') ||
    level.includes('HIGH-A') || level.includes('LOW-A') ||
    level.includes('ROOKIE') || level.includes('MILB') || level.includes('MINOR') ||
    rawLevel.includes('2軍') || rawLevel.includes('二軍') ||
    rawLevel.includes('育成')
  ) return 'MINOR'

  return 'OTHER'
}

function tagVariant(value: string, configMap: Record<string, { variant: string }>): string {
  for (const [key, cfg] of Object.entries(configMap)) {
    if (value.includes(key)) return VARIANT_CLASSES[cfg.variant] || VARIANT_CLASSES.stone
  }
  return VARIANT_CLASSES.stone
}

function levelVariant(level: string): string {
  return tagVariant(level, LEVEL_TAG_CONFIG)
}

function statusVariant(status: string): string {
  return tagVariant(status, STATUS_TAG_CONFIG)
}

function confidenceIcon(c: string): string {
  return c === 'high' ? '🟢' : c === 'medium' ? '🟡' : '🔴'
}

function confidenceLabel(c: string): string {
  return c === 'high' ? '高' : c === 'medium' ? '中' : '低'
}

function formatTime(iso: string): string {
  if (!iso) return 'N/A'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo'
    })
  } catch {
    return iso.slice(0, 10)
  }
}

const LEVEL_ORDER: Record<string, number> = {
  'MLB': 0, '1軍': 1, '一軍': 1, '支配下': 1,
  '3A': 2, '2A': 3, 'High-A': 4, 'Low-A': 5,
  '2軍': 6, '二軍': 6, 'Rookie': 7, '育成': 8,
}

function sortPlayers(all: Player[]): Player[] {
  return [...all].sort((a, b) => {
    const leagueDiff = LEAGUES.indexOf(getLeagueGroup(a)) - LEAGUES.indexOf(getLeagueGroup(b))
    if (leagueDiff !== 0) return leagueDiff
    const la = LEVEL_ORDER[a.current_level] ?? 99
    const lb = LEVEL_ORDER[b.current_level] ?? 99
    if (la !== lb) return la - lb
    return a.name_zh.localeCompare(b.name_zh, 'zh')
  })
}

/* ============================================================
   Info Field
   ============================================================ */

function InfoField({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ocean-light/10 bg-ocean-mid/10 p-4">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-stone-gray/40">{label}</p>
          <p className="text-sm font-medium text-shell-white">{value || '-'}</p>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Player Modal
   ============================================================ */

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
        onClick={(e) => e.stopPropagation()}
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
          {/* Header */}
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-wave to-emerald-400 text-3xl font-bold text-white shadow-lg shadow-ocean-wave/20">
              {player.name_zh[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-bold text-shell-white">{player.name_zh}</h2>
                <span className="text-sm text-stone-gray/50">{player.name_en}</span>
                <span className="text-xs" title={`信心度: ${confidenceLabel(player.confidence)}`}>{confidenceIcon(player.confidence)}</span>
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-ocean-light/15 px-3 py-1 text-xs text-ocean-foam border border-ocean-light/10">
                  {leagueMeta.flag} {player.league || league}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs border ${levelVariant(player.current_level)}`}>
                  {player.current_level}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs border ${statusVariant(player.roster_status)}`}>
                  {player.roster_status}
                </span>
                {player.needs_review && (
                  <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-400 border border-rose-500/20">需核實</span>
                )}
              </div>
              <p className="flex items-center gap-2 text-sm text-stone-gray/60">
                <Building2 className="h-4 w-4" />
                {organization}{teamName && teamName !== organization ? ` · ${teamName}` : ''}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoField icon="🎯" label="守備位置" value={player.position} />
            <InfoField icon="🔄" label="投打習慣" value={player.bats_throws} />
            <InfoField icon="🏆" label="所屬聯盟" value={player.league || league} />
            <InfoField icon="🏟️" label="所屬球隊" value={teamName || organization || '-'} />
            <InfoField icon="🏛️" label="球團組織" value={organization || '-'} />
            <InfoField icon="🌍" label="旅外區域" value={`${leagueMeta.flag} ${leagueMeta.label}`} />
            <InfoField icon="📊" label="當前層級" value={player.current_level} />
            <InfoField icon="💡" label="狀態" value={player.roster_status} />
          </div>

          {/* Player Details Row */}
          <div className="mt-4 rounded-xl border border-ocean-light/10 bg-ocean-mid/10 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="flex items-center gap-1 text-stone-gray/40"><User className="w-3 h-3" /> ID</span>
                <p className="font-mono text-stone-gray/60 mt-0.5">{player.player_id}</p>
              </div>
              <div>
                <span className="flex items-center gap-1 text-stone-gray/40"><Flag className="w-3 h-3" /> 國家</span>
                <p className="text-stone-gray/60 mt-0.5">{player.country || '-'}</p>
              </div>
              <div>
                <span className="flex items-center gap-1 text-stone-gray/40"><Activity className="w-3 h-3" /> 信賴度</span>
                <p className="text-stone-gray/60 mt-0.5">{confidenceIcon(player.confidence)} {confidenceLabel(player.confidence)}</p>
              </div>
              <div>
                <span className="flex items-center gap-1 text-stone-gray/40"><MapPin className="w-3 h-3" /> 需核實</span>
                <p className="text-stone-gray/60 mt-0.5">{player.needs_review ? '⚠️ 是' : '—'}</p>
              </div>
            </div>
          </div>

          {/* News */}
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
                        <p className="line-clamp-2 text-sm text-shell-white transition-colors hover:text-ocean-wave">
                          {item.title}
                        </p>
                        {item.summary && (
                          <p className="mt-1 line-clamp-2 text-xs text-stone-gray/50">{item.summary}</p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[10px] text-stone-gray/40">{item.source}</span>
                          <span className="flex items-center gap-1 text-[10px] text-stone-gray/30">
                            <Clock className="h-3 w-3" />
                            {(item.published_at || '').slice(0, 10) || 'N/A'}
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
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ============================================================
   Player Card (inline, no modal state needed)
   ============================================================ */

function PlayerCard({ player, onClick }: { player: Player; onClick: () => void }) {
  const organization = getTeamDisplayName(player.organization)
  const teamName = getTeamDisplayName(player.team_name)

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button
        type="button"
        onClick={onClick}
        className="ocean-card group w-full text-left p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 hover:border-ocean-wave/40 transition-all cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-ocean-wave to-emerald-400 flex items-center justify-center text-white font-bold text-base shrink-0">
            {player.name_zh[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-shell-white text-sm">{player.name_zh}</h3>
              <span className="text-[10px] text-stone-gray/50">{player.name_en}</span>
              <span className="text-xs" title={`信心度: ${confidenceLabel(player.confidence)}`}>{confidenceIcon(player.confidence)}</span>
            </div>

            <p className="text-[11px] text-stone-gray/60 mb-1.5">
              {player.position}
              {player.bats_throws ? ` · ${player.bats_throws}` : ''}
            </p>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full border bg-ocean-light/15 text-ocean-foam border-ocean-light/10">
                {organization}
              </span>
              {teamName && teamName !== organization && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-ocean-light/10 text-stone-gray/70 border-ocean-light/5">
                  {teamName}
                </span>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${levelVariant(player.current_level)}`}>
                {player.current_level}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusVariant(player.roster_status)}`}>
                {player.roster_status}
              </span>
              {player.needs_review && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-rose-500/20 text-rose-400 border-rose-500/20">
                  需核實
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  )
}

/* ============================================================
   Main Page
   ============================================================ */

export default function OverseasPlayers() {
  const [mounted, setMounted] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [leagueFilter, setLeagueFilter] = useState<'ALL' | 'MLB' | 'NPB' | 'KBO'>('ALL')
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'MAJOR' | 'MINOR'>('ALL')
  const [metaInfo, setMetaInfo] = useState<Record<string, any> | null>(null)
  const [lastUpdated, setLastUpdated] = useState('')
  const [playerTotal, setPlayerTotal] = useState<number | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedNews, setSelectedNews] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(false)

  const fetchPlayers = () => {
    setLoading(true)
    setError('')
    fetch('/api/players')
      .then(r => r.json())
      .then(data => {
        const allPlayers = extractPlayers(data)
        setPlayers(allPlayers)

        const total = extractTotal(data)
        if (total !== null) setPlayerTotal(total)

        const meta = extractMeta(data)
        if (meta) {
          setMetaInfo(meta)
          setLastUpdated(meta.last_updated || '')
        }

        setLoading(false)
      })
      .catch(() => {
        setError('無法載入球員資料，請稍後再試')
        setLoading(false)
      })
  }

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { fetchPlayers() }, [])

  // Fetch news when modal opens
  useEffect(() => {
    if (!selectedPlayer) return
    setSelectedNews([])
    setNewsLoading(true)
    fetch(`/api/news?player_id=${encodeURIComponent(selectedPlayer.player_id)}`)
      .then(r => r.json())
      .then(data => {
        const body = unwrapApiData<any>(data)
        setSelectedNews(body.news || [])
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

  const visiblePlayers = useMemo(() =>
    sortPlayers(players).filter((player) => {
      const league = getLeagueGroup(player)
      const level = getLevelGroup(player)
      return (
        matchesSearch(player) &&
        (leagueFilter === 'ALL' || league === leagueFilter) &&
        (levelFilter === 'ALL' || level === levelFilter)
      )
    }),
    [players, search, leagueFilter, levelFilter])

  const groups: LeagueGroup[] = LEAGUES.map((league) => ({
    league,
    ...LEAGUE_META[league],
    players: visiblePlayers.filter((p) => getLeagueGroup(p) === league),
  }))

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-abyss via-ocean-deep to-ocean-abyss py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-gray hover:text-shell-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> 回戰績首頁
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-ocean-wave to-emerald-400 mb-6 shadow-lg shadow-ocean-wave/20">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">旅外球員</span>
          </h1>
          <p className="text-lg text-stone-gray/80 max-w-2xl mx-auto mb-2">台灣囝仔 · 放眼世界</p>
          <p className="text-sm text-stone-gray/50">
            {playerTotal !== null ? playerTotal : players.length} 位選手 · 旅外球員資料庫
          </p>
          {lastUpdated && (
            <p className="text-xs text-stone-gray/40 mt-1">更新時間：{formatTime(lastUpdated)}</p>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-ocean-wave animate-spin" />
            <p className="text-sm text-stone-gray/50 mt-3">載入球員名單中…</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-16 bg-ocean-mid/10 rounded-xl border border-ocean-light/5">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <p className="text-sm text-rose-400/80 mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchPlayers}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ocean-mid/30 text-shell-white text-sm hover:bg-ocean-mid/50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> 重新載入
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && players.length === 0 && (
          <div className="text-center py-16 bg-ocean-mid/10 rounded-xl border border-ocean-light/5">
            <AlertCircle className="w-10 h-10 text-stone-gray/40 mx-auto mb-3" />
            <p className="text-sm text-stone-gray/50">目前無球員資料</p>
            <p className="text-[11px] text-stone-gray/40 mt-1">資料庫中尚未登錄旅外球員</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && players.length > 0 && (
          <>
            {/* Search & Filters */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-gray/50" />
                <input
                  type="text"
                  placeholder="搜尋選手姓名、球隊…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ocean-mid/30 border border-ocean-light/20 text-shell-white text-sm placeholder:text-stone-gray/40 focus:outline-none focus:border-ocean-wave/50 transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <Filter className="w-4 h-4 text-stone-gray/50" />
                {[
                  { value: 'ALL', label: '全部聯盟' },
                  { value: 'MLB', label: '🇺🇸 MLB' },
                  { value: 'NPB', label: '🇯🇵 NPB' },
                  { value: 'KBO', label: '🇰🇷 KBO' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setLeagueFilter(item.value as typeof leagueFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      leagueFilter === item.value
                        ? 'bg-ocean-wave/20 text-ocean-wave border border-ocean-wave/30'
                        : 'bg-ocean-mid/30 text-stone-gray/60 hover:text-shell-white border border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { value: 'ALL', label: '全部層級' },
                  { value: 'MAJOR', label: '一軍 / MLB' },
                  { value: 'MINOR', label: '二軍 / 小聯盟' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setLevelFilter(item.value as typeof levelFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      levelFilter === item.value
                        ? 'bg-ocean-wave/20 text-ocean-wave border border-ocean-wave/30'
                        : 'bg-ocean-mid/30 text-stone-gray/60 hover:text-shell-white border border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grouped Sections */}
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
                  <div className="text-center py-10 bg-ocean-mid/10 rounded-xl border border-ocean-light/5">
                    <AlertCircle className="w-8 h-8 text-stone-gray/40 mx-auto mb-2" />
                    <p className="text-sm text-stone-gray/50">無符合條件的選手</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.players.map((player) => (
                      <PlayerCard
                        key={player.player_id}
                        player={player}
                        onClick={() => setSelectedPlayer(player)}
                      />
                    ))}
                  </div>
                )}
              </motion.section>
            ))}

            {/* System Footer */}
            <div className="mt-12 ocean-card p-5 rounded-xl border border-ocean-light/10 bg-ocean-deep/30">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="w-4 h-4 text-stone-gray/40" />
                <span className="text-xs text-stone-gray/50">系統資訊</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-stone-gray/40">白名單</span>
                  <p className="text-stone-gray/70">
                    {playerTotal !== null ? playerTotal : players.length} 位
                    {playerTotal !== null && playerTotal !== players.length
                      ? ` (顯示 ${players.length})`
                      : ''}
                  </p>
                </div>
                <div>
                  <span className="text-stone-gray/40">分聯盟</span>
                  <p className="text-stone-gray/70">
                    MLB {players.filter((p) => getLeagueGroup(p) === 'MLB').length}
                    {' · '}NPB {players.filter((p) => getLeagueGroup(p) === 'NPB').length}
                    {' · '}KBO {players.filter((p) => getLeagueGroup(p) === 'KBO').length}
                  </p>
                </div>
                <div>
                  <span className="text-stone-gray/40">資料源</span>
                  <p className="text-stone-gray/70">
                    {metaInfo?.source || 'api-core proxy'}
                  </p>
                </div>
                <div>
                  <span className="text-stone-gray/40">更新時間</span>
                  <p className="text-stone-gray/70">{formatTime(lastUpdated)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-[11px] text-stone-gray/40">
                V2 — 旅外球員資料庫 · 點擊球員卡片查看詳情
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
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
