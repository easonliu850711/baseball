'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Globe, Search, Filter, RefreshCw, AlertCircle, ExternalLink, ChevronDown } from 'lucide-react'

// ============================================================
// 🌍 旅外選手白名單（全量快取）
// ============================================================
import allPlayers from '@/data/overseas-players.json'
import overrides from '@/data/player-overrides.json'

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

type CountryGroup = {
  country: string
  label: string
  flag: string
  players: Player[]
}

function getCountryMeta(c: string): { label: string; flag: string } {
  const map: Record<string, { label: string; flag: string }> = {
    US: { label: '美國 MLB/MiLB', flag: '🇺🇸' },
    JP: { label: '日本 NPB', flag: '🇯🇵' },
    KR: { label: '韓國 KBO', flag: '🇰🇷' },
  }
  return map[c] || { label: c, flag: '🌍' }
}

function getLevelColor(level: string): string {
  if (level === 'MLB' || level === '1軍') return 'bg-emerald-500/20 text-emerald-400'
  if (level === '3A' || level.includes('2軍')) return 'bg-blue-500/20 text-blue-400'
  if (level === '2A') return 'bg-violet-500/20 text-violet-400'
  if (level === 'High-A') return 'bg-amber-500/20 text-amber-400'
  if (level === 'Low-A') return 'bg-stone-500/20 text-stone-400'
  return 'bg-ocean-light/20 text-stone-gray'
}

function getStatusColor(status: string): string {
  if (status.includes('Active') || status.includes('支配下') || status.includes('MLB debut'))
    return 'bg-emerald-500/20 text-emerald-400'
  if (status.includes('40-man'))
    return 'bg-sky-500/20 text-sky-400'
  if (status.includes('育成'))
    return 'bg-amber-500/20 text-amber-400'
  if (status.includes('IL') || status.includes('injury'))
    return 'bg-red-500/20 text-red-400'
  return 'bg-ocean-light/20 text-stone-gray'
}

function getConfidenceIcon(c: string): string {
  return c === 'high' ? '🟢' : c === 'medium' ? '🟡' : '🔴'
}

const LEVEL_ORDER: Record<string, number> = {
  'MLB': 0, '1軍': 1, '3A': 2, '2A': 3, 'High-A': 4, 'Low-A': 5, 'Rookie': 6,
  '支配下': 1, '2軍': 5, '育成': 7,
}

function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const la = LEVEL_ORDER[a.current_level] ?? 99
    const lb = LEVEL_ORDER[b.current_level] ?? 99
    if (la !== lb) return la - lb
    return a.name_zh.localeCompare(b.name_zh, 'zh')
  })
}

export default function OverseasPlayers() {
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [showDiff, setShowDiff] = useState(false)
  const [lastCheck, setLastCheck] = useState<string>('')

  useEffect(() => { setMounted(true); }, [])

  // 分國家
  const groups: CountryGroup[] = ['US', 'JP', 'KR'].map(country => ({
    country,
    ...getCountryMeta(country),
    players: sortPlayers((allPlayers as Player[]).filter(p => p.country === country)),
  }))

  // 搜尋 + 篩選
  const filtered = groups.map(g => ({
    ...g,
    players: g.players.filter(p =>
      (search === '' || p.name_zh.includes(search) || p.name_en.toLowerCase().includes(search.toLowerCase()) || p.organization.toLowerCase().includes(search.toLowerCase())) &&
      (levelFilter === 'all' || p.current_level === levelFilter || (levelFilter === '1軍' && p.current_level.includes('1軍')))
    ),
  }))

  const allLevels = Array.from(new Set((allPlayers as Player[]).map(p => p.current_level))).sort((a, b) => {
    return (LEVEL_ORDER[a] ?? 99) - (LEVEL_ORDER[b] ?? 99)
  })

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-abyss via-ocean-deep to-ocean-abyss py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ===== 🔙 回主頁 ===== */}
        <Link href="/" className="inline-flex items-center gap-2 text-stone-gray hover:text-shell-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> 回戰績首頁
        </Link>

        {/* ===== 英雄區 ===== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-ocean-wave to-emerald-400 mb-6 shadow-lg shadow-ocean-wave/20">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">旅外球員</span>
          </h1>
          <p className="text-lg text-stone-gray/80 max-w-2xl mx-auto mb-2">台灣囝仔 · 放眼世界</p>
          <p className="text-sm text-stone-gray/50">
            {(allPlayers as Player[]).length} 位選手 · 追蹤最新動向
          </p>
        </motion.div>

        {/* ===== 搜尋/篩選工具列 ===== */}
        <div className="flex flex-col md:flex-row items-center gap-3 mb-8">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-gray/50" />
            <input
              type="text"
              placeholder="搜尋選手姓名、球隊…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ocean-mid/30 border border-ocean-light/20 text-shell-white text-sm placeholder:text-stone-gray/40 focus:outline-none focus:border-ocean-wave/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-stone-gray/50" />
            <button onClick={() => setLevelFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${levelFilter === 'all' ? 'bg-ocean-wave/20 text-ocean-wave' : 'bg-ocean-mid/30 text-stone-gray/60 hover:text-shell-white'}`}>
              全部
            </button>
            {allLevels.map(l => (
              <button key={l} onClick={() => setLevelFilter(l)} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${levelFilter === l ? 'bg-ocean-wave/20 text-ocean-wave' : 'bg-ocean-mid/30 text-stone-gray/60 hover:text-shell-white'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ===== 各國列表 ===== */}
        {filtered.map((group, gi) => (
          <motion.section
            key={group.country}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.15 }}
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
                {group.players.map((player) => (
                  <motion.div
                    key={player.player_id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ocean-card group p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 hover:border-ocean-wave/40 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* 頭像 */}
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
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-ocean-light/15 text-ocean-foam">{player.organization}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${getLevelColor(player.current_level)}`}>{player.current_level}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(player.roster_status)}`}>{player.roster_status}</span>
                          {player.needs_review && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">需核實</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        ))}

        {/* ===== 系統資訊 ===== */}
        <div className="mt-12 ocean-card p-5 rounded-xl border border-ocean-light/10 bg-ocean-deep/30">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-4 h-4 text-stone-gray/40" />
            <span className="text-xs text-stone-gray/50">系統資訊</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-stone-gray/40">白名單</span>
              <p className="text-stone-gray/70">{(allPlayers as Player[]).length} 位</p>
            </div>
            <div>
              <span className="text-stone-gray/40">分國家</span>
              <p className="text-stone-gray/70">
                🇺🇸{(allPlayers as Player[]).filter(p => p.country === 'US').length}
                 · 🇯🇵{(allPlayers as Player[]).filter(p => p.country === 'JP').length}
                 · 🇰🇷{(allPlayers as Player[]).filter(p => p.country === 'KR').length}
              </p>
            </div>
            <div>
              <span className="text-stone-gray/40">Override</span>
              <p className="text-stone-gray/70">{Object.keys((overrides as any)?.overrides || {}).length} 筆</p>
            </div>
            <div>
              <span className="text-stone-gray/40">更新</span>
              <p className="text-stone-gray/70">2026-05-22</p>
            </div>
          </div>
        </div>

        {/* ===== 待辦備註 ===== */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-stone-gray/40">
            V1 — 基礎白名單顯示 · 下一步：自動爬取成績 · 新聞搜尋
          </p>
        </div>
      </div>
    </div>
  )
}
