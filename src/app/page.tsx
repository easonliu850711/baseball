'use client'

import { useState, useEffect } from 'react'
import { Trophy, ExternalLink, RefreshCw, BookOpen, Users, CalendarDays, MapPin, CheckCircle, Clock, DollarSign, Star, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getTeamDisplayName } from '@/lib/teamNames'
import { unwrapApiData } from '@/lib/api-response'

// ============================================================
// 🏷️ 型別
// ============================================================
interface Team {
  rank: number; name: string; g: number; w: number; l: number; d: number
  pct: string; gb: string; color?: string; stadium?: string
}
interface LeagueBlock {
  league: string; icon: string; teams: Team[]
}
interface MLBBlock {
  meta: { league: string; div: string; icon: string }
  teams: (Team & { abbr?: string; streak?: string; wcRank?: number; wcGb?: string })[]
}

// ============================================================
// 📡 MLB Division ID → 名稱映射
// ============================================================
const MLB_DIVISIONS: Record<number, { league: string; div: string; icon: string }> = {
  200: { league: '美聯', div: '西區', icon: '🌴' },
  201: { league: '美聯', div: '東區', icon: '🏙️' },
  202: { league: '美聯', div: '中區', icon: '🌽' },
  203: { league: '國聯', div: '西區', icon: '🌵' },
  204: { league: '國聯', div: '東區', icon: '🗽' },
  205: { league: '國聯', div: '中區', icon: '🌾' },
}

// ============================================================
// 📡 資料爬取（全部透過 API Route）
// ============================================================

async function fetchNPB(): Promise<LeagueBlock[]> {
  const res = await fetch('/api/standings?league=npb')
  if (!res.ok) throw new Error('NPB fetch failed')
  return unwrapApiData<LeagueBlock[]>(await res.json())
}

async function fetchCPBL(): Promise<LeagueBlock[]> {
  const res = await fetch('/api/standings?league=cpbl')
  if (!res.ok) throw new Error('CPBL fetch failed')
  return unwrapApiData<LeagueBlock[]>(await res.json())
}

async function fetchMLB(): Promise<MLBBlock[]> {
  const res = await fetch('/api/standings?league=mlb')
  if (!res.ok) throw new Error('MLB fetch failed')
  const blocks = unwrapApiData<any[]>(await res.json())
  return (blocks || []).map((block: any, index: number) => ({
    meta: {
      league: block.league || 'MLB',
      div: block.div || `Group ${index + 1}`,
      icon: block.icon || '⚾',
    },
    teams: block.teams || [],
  }))
}

async function fetchKBO(): Promise<LeagueBlock> {
  const res = await fetch('/api/kbo')
  if (!res.ok) throw new Error('KBO fetch failed')
  return unwrapApiData<LeagueBlock>(await res.json())
}

// ============================================================
// 🏟️ 主頁面
// ============================================================

export default function BaseballHome() {
  const [activeTab, setActiveTab] = useState(0)
  const [mounted, setMounted] = useState(false)

  const [npbData, setNpbData] = useState<LeagueBlock[] | null>(null)
  const [cpblData, setCpblData] = useState<LeagueBlock[] | null>(null)
  const [mlbData, setMlbData] = useState<MLBBlock[] | null>(null)
  const [kboData, setKboData] = useState<LeagueBlock | null>(null)

  const [loading, setLoading] = useState<Record<number, boolean>>({})

  const fetchLeague = async (tabIdx: number, force = false) => {
    if (!force && (
      (tabIdx === 0 && npbData) ||
      (tabIdx === 1 && cpblData) ||
      (tabIdx === 2 && mlbData) ||
      (tabIdx === 3 && kboData)
    )) return

    setLoading(l => ({ ...l, [tabIdx]: true }))
    try {
      if (tabIdx === 0) setNpbData(await fetchNPB())
      if (tabIdx === 1) setCpblData(await fetchCPBL())
      if (tabIdx === 2) setMlbData(await fetchMLB())
      if (tabIdx === 3) setKboData(await fetchKBO())
    } catch { /* handled by UI */ }
    setLoading(l => ({ ...l, [tabIdx]: false }))
  }

  useEffect(() => { setMounted(true); fetchLeague(0); fetchLeague(1) }, [])

  const handleTabChange = (idx: number) => {
    setActiveTab(idx)
    fetchLeague(idx)
  }

  const sourceText = () => {
    switch (activeTab) {
      case 0: return 'NPB 官方'
      case 1: return 'CPBL 官網'
      case 2: return 'MLB API'
      case 3: return 'KBO 官方'
      default: return '-'
    }
  }

  // ── 共用戰績表 ──
  const renderTable = (teams: Team[], showWc = false) => (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-ocean-light/20 text-stone-gray text-[11px] uppercase tracking-wider">
          <th className="text-left py-2 pr-2 w-8">#</th>
          <th className="text-left py-2 pr-3">球隊</th>
          <th className="text-center py-2 pr-2 w-10">試</th>
          <th className="text-center py-2 pr-2 w-8">勝</th>
          <th className="text-center py-2 pr-2 w-8">敗</th>
          <th className="text-center py-2 pr-2 w-8">分</th>
          <th className="text-center py-2 pr-2 w-14">勝率</th>
          <th className="text-center py-2 pr-2 w-8">差</th>
          {showWc && <th className="text-center py-2 pr-2 w-8">WC</th>}
        </tr>
      </thead>
      <tbody>
        {teams.map((team) => (
          <tr key={team.name} className={`border-b border-ocean-light/10 hover:bg-white/[0.03] transition-colors ${team.rank === 1 ? 'bg-yellow-400/[0.04]' : ''}`}>
            <td className={`py-2.5 pr-2 font-bold text-sm ${team.rank === 1 ? 'text-yellow-400' : team.rank <= 3 ? 'text-ocean-wave' : 'text-stone-gray/50'}`}>{team.rank}</td>
            <td className="py-2.5 pr-3 text-shell-white font-medium text-[13px]">
              {team.stadium && <span className="text-stone-gray/40 text-[10px] mr-1">🏟️</span>}
              {getTeamDisplayName(team.name)}
            </td>
            <td className="text-center py-2.5 pr-2 text-stone-gray text-[13px]">{team.g}</td>
            <td className="text-center py-2.5 pr-2 text-emerald-400 font-medium text-[13px]">{team.w}</td>
            <td className="text-center py-2.5 pr-2 text-red-400 font-medium text-[13px]">{team.l}</td>
            <td className="text-center py-2.5 pr-2 text-stone-gray/60 text-[13px]">{team.d}</td>
            <td className={`text-center py-2.5 pr-2 font-mono text-[13px] ${parseFloat(team.pct) >= 0.6 ? 'text-emerald-400' : parseFloat(team.pct) >= 0.5 ? 'text-ocean-wave' : 'text-stone-gray'}`}>{team.pct}</td>
            <td className="text-center py-2.5 pr-2 text-stone-gray/50 text-[13px]">{team.gb}</td>
            {showWc && <td className="text-center py-2.5 pr-2 text-[11px] text-stone-gray/40">{'wcRank' in team ? (team as any).wcRank : '-'}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )

  // ── 載入中／錯誤區 ──
  const LoadingOrError = ({ loading, onRetry }: { loading: boolean; onRetry: () => void }) => (
    loading ? (
      <div className="text-center py-12">
        <RefreshCw className="w-6 h-6 text-ocean-wave/60 animate-spin mx-auto mb-3" />
        <p className="text-stone-gray/50 text-sm">資料載入中...</p>
      </div>
    ) : (
      <div className="text-center py-12">
        <p className="text-stone-gray/50 text-sm">資料取得失敗</p>
        <button onClick={onRetry} className="mt-3 text-xs text-ocean-wave/60 hover:text-ocean-wave underline">重新整理</button>
      </div>
    )
  )

  // ── 表格卡片包裝 ──
  const Card = ({ icon, title, subtitle, children }: { icon: string; title: string; subtitle?: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-ocean-light/20 bg-gradient-to-br from-ocean-mid/20 to-ocean-deep/40 backdrop-blur-sm p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h3 className="font-bold text-ocean-foam text-sm">{title}</h3>
        {subtitle && <span className="text-[10px] text-stone-gray/40 ml-auto">{subtitle}</span>}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-abyss via-ocean-deep to-ocean-abyss py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ===== 英雄區 ===== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-ocean-wave to-coral mb-4 shadow-lg shadow-ocean-wave/20">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="text-gradient">⚾ 世界棒球戰績</span>
          </h1>
          <p className="text-stone-gray/70 text-sm max-w-xl mx-auto">NPB · CPBL · MLB · KBO 即時排行榜</p>


        </motion.div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {['⚾', '·', '🌸', '·', '⚾', '·', '🌊', '·', '⚾'].map((s, i) => (
            <span key={i} className={i % 2 === 0 ? 'text-sm' : 'text-stone-gray/30 text-xs'}>{s}</span>
          ))}
        </div>

        {/* ===== 四國標籤 ===== */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {[
            { idx: 0, label: '🇯🇵 日本 NPB' },
            { idx: 1, label: '🇹🇼 台灣 CPBL' },
            { idx: 2, label: '🇺🇸 美國 MLB' },
            { idx: 3, label: '🇰🇷 韓國 KBO' },
          ].map(tab => (
            <button
              key={tab.idx}
              onClick={() => handleTabChange(tab.idx)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab.idx
                  ? 'bg-ocean-wave/15 text-ocean-wave border border-ocean-wave/40 shadow-sm shadow-ocean-wave/10'
                  : 'text-stone-gray/60 border border-ocean-light/10 hover:border-ocean-light/30 hover:text-shell-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== 資料來源 ===== */}
        <div className="text-center mb-6">
          <span className="text-[10px] text-stone-gray/40">
            資料來源: {sourceText()} · {new Date().toLocaleDateString('zh-TW')} 更新
          </span>
        </div>

        {/* ===== 戰績表 ===== */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {/* 🇯🇵 NPB */}
            {activeTab === 0 && (
              !npbData
                ? <LoadingOrError loading={loading[0]} onRetry={() => fetchLeague(0, true)} />
                : npbData.map(lg => (
                    <Card key={lg.league} icon={lg.icon} title={lg.league} subtitle={`${lg.teams.length} 隊 · 2026`}>
                      {renderTable(lg.teams)}
                    </Card>
                  ))
            )}

            {/* 🇹🇼 CPBL */}
            {activeTab === 1 && (
              !cpblData
                ? <LoadingOrError loading={loading[1]} onRetry={() => fetchLeague(1, true)} />
                : cpblData.map(lg => (
                    <Card key={lg.league} icon={lg.icon} title={lg.league} subtitle={`${lg.teams.length} 隊 · 2026`}>
                      {renderTable(lg.teams)}
                    </Card>
                  ))
            )}

            {/* 🇺🇸 MLB */}
            {activeTab === 2 && (
              !mlbData
                ? <LoadingOrError loading={loading[2]} onRetry={() => fetchLeague(2, true)} />
                : mlbData.map((block, i) => (
                    <Card key={i} icon={block.meta.icon} title={`${block.meta.league} · ${block.meta.div}`} subtitle={`${block.teams.length} 隊`}>
                      {renderTable(block.teams, true)}
                    </Card>
                  ))
            )}

            {/* 🇰🇷 KBO */}
            {activeTab === 3 && (
              !kboData
                ? <LoadingOrError loading={loading[3]} onRetry={() => fetchLeague(3, true)} />
                : (
                    <Card icon={kboData.icon} title={kboData.league} subtitle={`${kboData.teams.length} 隊 · 2026`}>
                      {renderTable(kboData.teams)}
                    </Card>
                  )
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-3 my-10">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-ocean-wave/30" />
          <span className="text-ocean-wave/40 text-xs">⚾ · 🌸 · ⚾</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-ocean-wave/30" />
        </div>

        {/* ===== 🔗 子站傳送門 ===== */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-4">
          <Link href="/stadiums" className="rounded-xl border border-ocean-light/20 bg-gradient-to-br from-ocean-mid/20 to-ocean-deep/40 backdrop-blur-sm p-5 group hover:border-ocean-wave/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📖</span>
              <h3 className="font-bold text-shell-white text-sm">棒球觀戰紀錄</h3>
            </div>
            <p className="text-xs text-stone-gray/60">14 場 NPB 巡禮 · 制霸への道</p>
            <div className="mt-3 text-ocean-wave/50 text-xs group-hover:text-ocean-wave transition-colors flex items-center gap-1">
              前往觀戰紀錄 <ExternalLink className="w-3 h-3" />
            </div>
          </Link>

          <Link href="/players" className="rounded-xl border border-ocean-light/20 bg-gradient-to-br from-ocean-mid/20 to-ocean-deep/40 backdrop-blur-sm p-5 group hover:border-ocean-wave/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🧢</span>
              <h3 className="font-bold text-shell-white text-sm">旅外球員</h3>
            </div>
            <p className="text-xs text-stone-gray/60">台灣旅外選手動向</p>
            <div className="mt-3 text-ocean-wave/50 text-xs group-hover:text-ocean-wave transition-colors flex items-center gap-1">
              前往旅外球員 <ExternalLink className="w-3 h-3" />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
