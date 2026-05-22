'use client'

import { useState, useEffect } from 'react'
import { Trophy, ExternalLink, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ============================================================
// 📊 2026 賽季真實戰績數據（2026-05-22 更新）
// ============================================================

// 🏔️ 央聯 セ・リーグ（Yahoo Sports 5/22）
const NPB_CENTRAL = [
  { rank: 1, name: '養樂多', g: 44, w: 27, l: 17, d: 0, pct: '.614', gb: '-', color: 'text-green-400', stadium: '神宮球場' },
  { rank: 2, name: '阪神',    g: 43, w: 25, l: 17, d: 1, pct: '.595', gb: '1.0', color: 'text-yellow-400', stadium: '甲子園' },
  { rank: 3, name: '巨人',    g: 43, w: 24, l: 19, d: 0, pct: '.558', gb: '2.5', color: 'text-orange-500', stadium: '東京巨蛋' },
  { rank: 4, name: 'DeNA',    g: 44, w: 20, l: 22, d: 2, pct: '.476', gb: '6.0', color: 'text-blue-400', stadium: '橫濱球場' },
  { rank: 5, name: '廣島',    g: 41, w: 16, l: 23, d: 2, pct: '.410', gb: '8.5', color: 'text-red-500', stadium: '馬自達球場' },
  { rank: 6, name: '中日',    g: 43, w: 14, l: 28, d: 1, pct: '.333', gb: '12.0', color: 'text-blue-600', stadium: '名古屋巨蛋' },
]

// 🌊 洋聯 パ・リーグ
const NPB_PACIFIC = [
  { rank: 1, name: '歐力士', g: 43, w: 25, l: 18, d: 0, pct: '.581', gb: '-', color: 'text-amber-500', stadium: '京瓷巨蛋' },
  { rank: 2, name: '西武',      g: 45, w: 25, l: 19, d: 1, pct: '.568', gb: '0.5', color: 'text-emerald-400', stadium: '西武巨蛋' },
  { rank: 3, name: '火腿',   g: 46, w: 23, l: 23, d: 0, pct: '.500', gb: '3.5', color: 'text-sky-400', stadium: 'ES CON FIELD' },
  { rank: 4, name: '軟銀', g: 42, w: 20, l: 22, d: 0, pct: '.476', gb: '4.5', color: 'text-yellow-400', stadium: 'PayPay巨蛋' },
  { rank: 5, name: '羅德',     g: 43, w: 19, l: 24, d: 0, pct: '.442', gb: '6.0', color: 'text-black', stadium: 'ZOZO海洋球場' },
  { rank: 6, name: '樂天',      g: 43, w: 18, l: 24, d: 1, pct: '.429', gb: '6.5', color: 'text-red-400', stadium: '樂天移動通信球場' },
]

// 🐉 中華職棒 CPBL（CPBL 官網 5/22）
const CPBL = [
  { rank: 1, name: '味全龍',    g: 36, w: 23, l: 13, d: 0, pct: '.639', gb: '-', color: 'text-red-500' },
  { rank: 2, name: '富邦悍將',   g: 33, w: 19, l: 14, d: 0, pct: '.576', gb: '2.5', color: 'text-blue-500' },
  { rank: 3, name: '統一獅',    g: 35, w: 18, l: 16, d: 1, pct: '.529', gb: '4.0', color: 'text-orange-500' },
  { rank: 4, name: '台鋼雄鷹',   g: 37, w: 18, l: 18, d: 1, pct: '.500', gb: '5.0', color: 'text-emerald-400' },
  { rank: 5, name: '樂天桃猿',   g: 34, w: 14, l: 19, d: 1, pct: '.424', gb: '7.5', color: 'text-red-400' },
  { rank: 6, name: '中信兄弟',   g: 35, w: 11, l: 23, d: 1, pct: '.324', gb: '11.0', color: 'text-yellow-400' },
]

// ============================================================
// 📡 MLB Division ID → 名稱映射
// ============================================================
const MLB_DIVISIONS: Record<number, { league: string; div: string; icon: string }> = {
  200: { league: '美聯', div: '西區', icon: '🌴' },
  201: { league: '美聯', div: '東區', icon: '🏙️' },
  202: { league: '美聯', div: '中區', icon: '🌽' },
  203: { league: '國聯', div: '西區', icon: '🌵' },
  204: { league: '國聯', div: '東區', icon: '🗽' },
  205: { league: '國聯', div: '中區', icon: '🌾',}
}

// 🇰🇷 KBO 10 隊顏色（依 eng.koreabaseball.com 排序）
const KBO_COLORS: Record<string, string> = {
  'SAMSUNG': 'text-blue-400', 'LG': 'text-red-600', 'KT': 'text-black',
  'SSG': 'text-yellow-400', 'KIA': 'text-red-500', 'DOOSAN': 'text-blue-500',
  'HANWHA': 'text-orange-500', 'LOTTE': 'text-red-500', 'KIWOOM': 'text-red-400', 'NC': 'text-teal-500',
}

// ============================================================
// 📡 MLB / KBO 即時數據爬取
// ============================================================

async function fetchMLB(): Promise<LeagueBlock[]> {
  const res = await fetch('https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2026&standingsTypes=regularSeason')
  const data = await res.json()
  const records: any[] = data.records || []

  return records.map((r: any) => {
    const divId: number = r.division?.id || 200
    const meta = MLB_DIVISIONS[divId] || { league: 'MLB', div: `Div ${divId}`, icon: '⚾' }
    const teams = (r.teamRecords || []).map((t: any) => {
      const w = t.wins || 0, l = t.losses || 0
      return {
        rank: parseInt(t.divisionRank) || 0,
        name: t.team?.name || '?',
        abbr: t.team?.abbreviation || '?',
        g: (w + l),
        w,
        l,
        d: 0,
        pct: (w + l) > 0 ? `.${String(Math.round(w / (w + l) * 1000)).padStart(3, '0')}` : '.000',
        gb: t.gamesBack === '-' || t.gamesBack === 0 ? '-' : (t.gamesBack || '-'),
        color: '#',
        streak: t.streak?.streakCode || '',
        wcRank: t.wildCardRank || 0,
        wcGb: t.wildCardGamesBack === '-' || t.wildCardGamesBack === 0 ? '-' : t.wildCardGamesBack,
      }
    })
    return { meta, teams }
  })
}

async function fetchKBO(): Promise<{ league: string; icon: string; teams: any[] }> {
  const res = await fetch('https://eng.koreabaseball.com/Standings/TeamStandings.aspx', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = await res.text()

  // Extract team standings rows
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []
  const teams: any[] = []

  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g)
    if (!cells || cells.length < 9) continue

    const clean = cells.map((c: string) => c.replace(/<[^>]+>/g, '').trim())
    const rank = parseInt(clean[0])
    if (isNaN(rank) || rank < 1 || rank > 10) continue

    const name = clean[1]
    const g = parseInt(clean[2]) || 0
    const w = parseInt(clean[3]) || 0
    const l = parseInt(clean[4]) || 0
    const d = parseInt(clean[5]) || 0
    const pct = clean[6]
    const gb = clean[7] === '0.0' ? '-' : clean[7]

    teams.push({ rank, name, g, w, l, d, pct, gb: gb, color: KBO_COLORS[name?.toUpperCase()] || 'text-gray-400' })
  }

  return { league: 'KBO 聯賽', icon: '🇰🇷', teams }
}

// ============================================================
// 🏷️ Type
// ============================================================
interface LeagueBlock {
  meta: { league: string; div: string; icon: string }
  teams: any[]
}

// ============================================================
// 🏟️ 主頁面
// ============================================================

export default function BaseballHome() {
  const [activeTab, setActiveTab] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [mlbData, setMlbData] = useState<LeagueBlock[] | null>(null)
  const [kboData, setKboData] = useState<{ league: string; icon: string; teams: any[] } | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchLiveData = async (tabIdx: number) => {
    if (tabIdx === 2) { // MLB
      setLoading(true)
      try {
        const data = await fetchMLB()
        setMlbData(data)
      } catch { setMlbData(null) }
      setLoading(false)
    }
    if (tabIdx === 3) { // KBO
      setLoading(true)
      try {
        const data = await fetchKBO()
        setKboData(data)
      } catch { setKboData(null) }
      setLoading(false)
    }
  }

  useEffect(() => { setMounted(true); fetchLiveData(0) }, [])

  const handleTabChange = (idx: number) => {
    setActiveTab(idx)
    if (idx === 2 || idx === 3) fetchLiveData(idx)
  }

  const renderStandingsTable = (teams: any[], showWcRank = false) => (
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
          {showWcRank && <th className="text-center py-2 pr-2 w-8">WC</th>}
        </tr>
      </thead>
      <tbody>
        {teams.map((team: any) => (
          <tr key={team.name} className={`border-b border-ocean-light/10 hover:bg-white/[0.03] transition-colors ${team.rank === 1 ? 'bg-yellow-400/[0.04]' : ''}`}>
            <td className={`py-2.5 pr-2 font-bold text-sm ${team.rank === 1 ? 'text-yellow-400' : team.rank <= 3 ? 'text-ocean-wave' : 'text-stone-gray/50'}`}>{team.rank}</td>
            <td className="py-2.5 pr-3 text-shell-white font-medium text-[13px]">
              {team.color && team.color !== '#' && <span className={`${team.color} inline-block w-2 h-2 rounded-full mr-1.5 align-middle`} />}
              {team.color === '#' && <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle bg-ocean-wave/30" />}
              {team.name}
            </td>
            <td className="text-center py-2.5 pr-2 text-stone-gray text-[13px]">{team.g}</td>
            <td className="text-center py-2.5 pr-2 text-emerald-400 font-medium text-[13px]">{team.w}</td>
            <td className="text-center py-2.5 pr-2 text-red-400 font-medium text-[13px]">{team.l}</td>
            <td className="text-center py-2.5 pr-2 text-stone-gray/60 text-[13px]">{team.d}</td>
            <td className={`text-center py-2.5 pr-2 font-mono text-[13px] ${parseFloat(team.pct) >= .600 ? 'text-emerald-400' : parseFloat(team.pct) >= .500 ? 'text-ocean-wave' : 'text-stone-gray'}`}>{team.pct}</td>
            <td className="text-center py-2.5 pr-2 text-stone-gray/50 text-[13px]">{team.gb}</td>
            {showWcRank && <td className="text-center py-2.5 pr-2 text-[11px] text-stone-gray/40">{team.wcRank}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-abyss via-ocean-deep to-ocean-abyss py-16 px-4">
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
          <button onClick={() => handleTabChange(0)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 0 ? 'bg-ocean-wave/15 text-ocean-wave border border-ocean-wave/40 shadow-sm shadow-ocean-wave/10' : 'text-stone-gray/60 border border-ocean-light/10 hover:border-ocean-light/30 hover:text-shell-white'}`}>🇯🇵 日本 NPB</button>
          <button onClick={() => handleTabChange(1)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 1 ? 'bg-ocean-wave/15 text-ocean-wave border border-ocean-wave/40 shadow-sm shadow-ocean-wave/10' : 'text-stone-gray/60 border border-ocean-light/10 hover:border-ocean-light/30 hover:text-shell-white'}`}>🇹🇼 台灣 CPBL</button>
          <button onClick={() => handleTabChange(2)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 2 ? 'bg-ocean-wave/15 text-ocean-wave border border-ocean-wave/40 shadow-sm shadow-ocean-wave/10' : 'text-stone-gray/60 border border-ocean-light/10 hover:border-ocean-light/30 hover:text-shell-white'}`}>🇺🇸 美國 MLB</button>
          <button onClick={() => handleTabChange(3)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 3 ? 'bg-ocean-wave/15 text-ocean-wave border border-ocean-wave/40 shadow-sm shadow-ocean-wave/10' : 'text-stone-gray/60 border border-ocean-light/10 hover:border-ocean-light/30 hover:text-shell-white'}`}>🇰🇷 韓國 KBO</button>
        </div>

        {/* ===== 資料來源 ===== */}
        <div className="text-center mb-6">
          <span className="text-[10px] text-stone-gray/40">
            資料來源: {activeTab === 0 ? 'Yahoo Sports' : activeTab === 1 ? 'CPBL 官網' : activeTab === 2 ? 'MLB API' : activeTab === 3 ? 'KBO 官方' : '-'} · {new Date().toLocaleDateString('zh-TW')} 更新
          </span>
        </div>

        {/* ===== 戰績表 ===== */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {/* 🇯🇵 NPB */}
            {activeTab === 0 && [{
              league: '央聯 セ・リーグ', icon: '🏔️', teams: NPB_CENTRAL
            }, {
              league: '洋聯 パ・リーグ', icon: '🌊', teams: NPB_PACIFIC
            }].map(lg => (
              <div key={lg.league} className="ocean-card rounded-xl border border-ocean-light/20 bg-ocean-mid/20 p-5 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{lg.icon}</span>
                  <h3 className="font-bold text-ocean-foam text-sm">{lg.league}</h3>
                  <span className="text-[10px] text-stone-gray/40 ml-auto">{lg.teams.length} 隊 · 2026</span>
                </div>
                <div className="overflow-x-auto">{renderStandingsTable(lg.teams)}</div>
              </div>
            ))}

            {/* 🇹🇼 CPBL */}
            {activeTab === 1 && (
              <div className="ocean-card rounded-xl border border-ocean-light/20 bg-ocean-mid/20 p-5 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🐉</span>
                  <h3 className="font-bold text-ocean-foam text-sm">中華職棒</h3>
                  <span className="text-[10px] text-stone-gray/40 ml-auto">{CPBL.length} 隊 · 2026</span>
                </div>
                <div className="overflow-x-auto">{renderStandingsTable(CPBL)}</div>
              </div>
            )}

            {/* 🇺🇸 MLB */}
            {activeTab === 2 && (
              loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-6 h-6 text-ocean-wave/60 animate-spin mx-auto mb-3" />
                  <p className="text-stone-gray/50 text-sm">MLB 資料載入中...</p>
                </div>
              ) : mlbData ? (
                mlbData.map((block, i) => (
                  <div key={i} className="ocean-card rounded-xl border border-ocean-light/20 bg-ocean-mid/20 p-5 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">{block.meta.icon}</span>
                      <h3 className="font-bold text-ocean-foam text-sm">{block.meta.league} · {block.meta.div}</h3>
                      <span className="text-[10px] text-stone-gray/40 ml-auto">{block.teams.length} 隊</span>
                    </div>
                    <div className="overflow-x-auto">{renderStandingsTable(block.teams, true)}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-stone-gray/50 text-sm">資料取得失敗，請重新整理。</p>
                  <button onClick={() => fetchLiveData(2)} className="mt-3 text-xs text-ocean-wave/60 hover:text-ocean-wave underline">重新整理</button>
                </div>
              )
            )}

            {/* 🇰🇷 KBO */}
            {activeTab === 3 && (
              loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-6 h-6 text-ocean-wave/60 animate-spin mx-auto mb-3" />
                  <p className="text-stone-gray/50 text-sm">KBO 資料載入中...</p>
                </div>
              ) : kboData ? (
                <div className="ocean-card rounded-xl border border-ocean-light/20 bg-ocean-mid/20 p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{kboData.icon}</span>
                    <h3 className="font-bold text-ocean-foam text-sm">{kboData.league}</h3>
                    <span className="text-[10px] text-stone-gray/40 ml-auto">{kboData.teams.length} 隊 · 2026</span>
                  </div>
                  <div className="overflow-x-auto">{renderStandingsTable(kboData.teams)}</div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-stone-gray/50 text-sm">KBO 資料取得失敗，請重新整理。</p>
                  <button onClick={() => fetchLiveData(3)} className="mt-3 text-xs text-ocean-wave/60 hover:text-ocean-wave underline">重新整理</button>
                </div>
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
          <Link href="/games" className="ocean-card group p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 hover:border-ocean-wave/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📖</span>
              <h3 className="font-bold text-shell-white text-sm">棒球觀戰紀錄</h3>
            </div>
            <p className="text-xs text-stone-gray/60">14 場 NPB 巡禮 · 制霸への道</p>
            <div className="mt-3 text-ocean-wave/50 text-xs group-hover:text-ocean-wave transition-colors flex items-center gap-1">
              前往觀戰紀錄 <ExternalLink className="w-3 h-3" />
            </div>
          </Link>

          <Link href="/players" className="ocean-card group p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 hover:border-ocean-wave/40 transition-all duration-300">
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
