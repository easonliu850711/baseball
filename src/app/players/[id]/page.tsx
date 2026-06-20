'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Globe, Loader2, AlertCircle, User, Shield, Building2, Flame, ExternalLink, Newspaper, Clock } from 'lucide-react'
import { getTeamDisplayName } from '@/lib/teamNames'
import { unwrapApiData } from '@/lib/api-response'

type NewsItem = {
  id: number
  player_id: string
  title: string
  url: string
  source: string
  published_at: string
  summary: string
}

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

const COUNTRY_META: Record<string, { label: string; flag: string }> = {
  US: { label: '美國', flag: '🇺🇸' },
  JP: { label: '日本', flag: '🇯🇵' },
  KR: { label: '韓國', flag: '🇰🇷' },
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
  if (status.includes('40-man')) return 'bg-sky-500/20 text-sky-400'
  if (status.includes('育成')) return 'bg-amber-500/20 text-amber-400'
  if (status.includes('IL') || status.includes('injury')) return 'bg-red-500/20 text-red-400'
  return 'bg-ocean-light/20 text-stone-gray'
}

const POSITION_ICON: Record<string, string> = {
  'P': '⚾',
  'C': '🎯',
  '1B': '🥇', '2B': '🥈', '3B': '🥉',
  'SS': '🛡️',
  'OF': '🧢',
  'IF': '🔄',
  'DH': '🔥',
}

export default function PlayerProfile() {
  const params = useParams()
  const id = params.id as string
  const [player, setPlayer] = useState<Player | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/players/${encodeURIComponent(id)}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(data => {
        const body = unwrapApiData<any>(data)
        setPlayer(body?.data?.player || body?.player || null)
        setLoading(false)
      })
      .catch(() => {
        setError('找不到該選手')
        setLoading(false)
      })

    // 載入新聞
    fetch(`/api/news?player_id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(data => {
        const body = unwrapApiData<any>(data)
        setNews(body.news || [])
        setNewsLoading(false)
      })
      .catch(() => setNewsLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-abyss via-ocean-deep to-ocean-abyss flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-ocean-wave animate-spin" />
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-abyss via-ocean-deep to-ocean-abyss flex flex-col items-center justify-center gap-4 py-8 px-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <p className="text-rose-400/80">{error || '選手不存在'}</p>
        <Link href="/players" className="text-ocean-wave hover:text-ocean-foam transition-colors text-sm">
          ← 回旅外球員列表
        </Link>
      </div>
    )
  }

  const country = COUNTRY_META[player.country] || { label: player.country, flag: '🌍' }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-abyss via-ocean-deep to-ocean-abyss py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 🔙 返回 */}
        <Link href="/players" className="inline-flex items-center gap-2 text-stone-gray hover:text-shell-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> 回旅外球員列表
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* ===== 頭像 + 基本資訊 ===== */}
          <div className="ocean-card p-6 md:p-8 rounded-2xl border border-ocean-light/20 bg-ocean-mid/20 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* 頭像 */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-ocean-wave to-emerald-400 flex items-center justify-center text-white font-bold text-4xl shrink-0 shadow-lg shadow-ocean-wave/20">
                {player.name_zh[0]}
              </div>

              {/* 名字 + 隊伍 */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-shell-white">{player.name_zh}</h1>
                  <span className="text-lg text-stone-gray/50">{player.name_en}</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                  <span className="px-3 py-1 rounded-full text-xs bg-ocean-light/15 text-ocean-foam">{country.flag} {country.label}</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${getLevelColor(player.current_level)}`}>{player.current_level}</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(player.roster_status)}`}>{player.roster_status}</span>
                </div>
                <p className="text-stone-gray/60 text-sm flex items-center gap-2 justify-center md:justify-start">
                  <Building2 className="w-4 h-4" />
                  {getTeamDisplayName(player.organization)}{player.team_name !== player.organization ? ` · ${getTeamDisplayName(player.team_name)}` : ''}
                </p>
              </div>

              {/* 位置快顯 */}
              <div className="hidden md:flex flex-col items-center gap-2 px-6 py-4 rounded-xl bg-ocean-deep/40 border border-ocean-light/10">
                <span className="text-3xl">{POSITION_ICON[player.position] || '⚾'}</span>
                <span className="text-sm font-bold text-shell-white">{player.position}</span>
                <span className="text-[10px] text-stone-gray/50">{player.bats_throws}</span>
              </div>
            </div>
          </div>

          {/* ===== 相關新聞 ===== */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-ocean-wave" />
              <h2 className="text-lg font-bold text-shell-white">最新消息</h2>
              {newsLoading && <Loader2 className="w-3.5 h-3.5 text-stone-gray/40 animate-spin" />}
            </div>

            {!newsLoading && news.length === 0 && (
              <div className="ocean-card p-6 rounded-xl border border-ocean-light/10 bg-ocean-mid/10 text-center">
                <p className="text-sm text-stone-gray/50">目前尚無相關新聞</p>
                <p className="text-[11px] text-stone-gray/40 mt-1">每日 23:30 自動更新</p>
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
                    className="ocean-card p-4 rounded-xl border border-ocean-light/10 bg-ocean-mid/10 hover:border-ocean-wave/30 transition-all block group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-shell-white group-hover:text-ocean-wave transition-colors line-clamp-2">
                          {item.title}
                        </p>
                        {item.summary && (
                          <p className="text-xs text-stone-gray/50 mt-1 line-clamp-2">{item.summary}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-stone-gray/40">{item.source}</span>
                          <span className="text-[10px] text-stone-gray/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.published_at.slice(0, 10)}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-stone-gray/30 group-hover:text-ocean-wave shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ===== 詳細資訊 ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { label: '守備位置', value: player.position, icon: '🎯' },
              { label: '投打習慣', value: player.bats_throws, icon: '🔄' },
              { label: '所屬聯盟', value: player.league, icon: '🏆' },
              { label: '所屬球隊', value: getTeamDisplayName(player.organization || player.team_name), icon: '🏟️' },
              { label: '球團組織', value: getTeamDisplayName(player.organization), icon: '🏛️' },
              { label: '國籍', value: `${country.flag} ${country.label}`, icon: '🌍' },
              { label: '當前層級', value: player.current_level, icon: '📊' },
              { label: '狀態', value: player.roster_status, icon: '💡' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="ocean-card p-4 rounded-xl border border-ocean-light/10 bg-ocean-mid/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-[11px] text-stone-gray/40 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm text-shell-white font-medium">{item.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ===== 系統資訊 ===== */}
          <div className="ocean-card p-4 rounded-xl border border-ocean-light/10 bg-ocean-deep/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-3.5 h-3.5 text-stone-gray/40" />
              <span className="text-[11px] text-stone-gray/40">系統資訊</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
              <div><span className="text-stone-gray/40">player_id</span><p className="text-stone-gray/60 font-mono">{player.player_id}</p></div>
              <div><span className="text-stone-gray/40">信賴等級</span><p className="text-stone-gray/60">{player.confidence === 'high' ? '🟢 高' : player.confidence === 'medium' ? '🟡 中' : '🔴 低'}</p></div>
              <div><span className="text-stone-gray/40">需核實</span><p className="text-stone-gray/60">{player.needs_review ? '⚠️ 是' : '—'}</p></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
