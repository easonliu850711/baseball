'use client'

import { useState } from 'react'
import { Trophy, Globe, ChevronDown, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ============================================================
// 📊 各國戰績數據
// ============================================================

// NPB 2026 太平洋聯盟（5/21 更新）
const NPB_PACIFIC = [
  { rank: 1, name: '日本ハム', g: 49, w: 28, l: 20, d: 1, pct: '.583', gb: '-', color: 'text-sky-400' },
  { rank: 2, name: 'ロッテ', g: 48, w: 27, l: 19, d: 2, pct: '.587', gb: '0.0', color: 'text-black' },
  { rank: 3, name: 'ソフトバンク', g: 49, w: 26, l: 22, d: 1, pct: '.542', gb: '2.0', color: 'text-yellow-400' },
  { rank: 4, name: '西武', g: 47, w: 23, l: 24, d: 0, pct: '.489', gb: '4.5', color: 'text-emerald-400' },
  { rank: 5, name: '楽天', g: 49, w: 20, l: 28, d: 1, pct: '.417', gb: '8.0', color: 'text-red-400' },
  { rank: 6, name: 'オリックス', g: 48, w: 16, l: 31, d: 1, pct: '.340', gb: '11.5', color: 'text-amber-500' },
]

const NPB_CENTRAL = [
  { rank: 1, name: '阪神', g: 48, w: 30, l: 16, d: 2, pct: '.652', gb: '-', color: 'text-yellow-400' },
  { rank: 2, name: '巨人', g: 48, w: 28, l: 18, d: 2, pct: '.609', gb: '2.0', color: 'text-orange-500' },
  { rank: 3, name: 'DeNA', g: 48, w: 26, l: 21, d: 1, pct: '.553', gb: '4.5', color: 'text-blue-400' },
  { rank: 4, name: '広島', g: 48, w: 23, l: 24, d: 1, pct: '.479', gb: '7.5', color: 'text-red-500' },
  { rank: 5, name: '中日', g: 49, w: 19, l: 29, d: 1, pct: '.396', gb: '12.0', color: 'text-blue-600' },
  { rank: 6, name: 'ヤクルト', g: 48, w: 15, l: 32, d: 1, pct: '.319', gb: '15.5', color: 'text-green-400' },
]

// NPB Standings for tab (merged)
const NPB_STANDINGS = [
  { league: 'パ・リーグ', teams: NPB_PACIFIC, icon: '🌊' },
  { league: 'セ・リーグ', teams: NPB_CENTRAL, icon: '🏔️' },
]

// CPBL 2026
const CPBL = [
  { rank: 1, name: '味全龍', g: 40, w: 24, l: 16, d: 0, pct: '.600', gb: '-', color: 'text-red-500' },
  { rank: 2, name: '中信兄弟', g: 40, w: 22, l: 18, d: 0, pct: '.550', gb: '2.0', color: 'text-yellow-400' },
  { rank: 3, name: '統一獅', g: 40, w: 20, l: 20, d: 0, pct: '.500', gb: '4.0', color: 'text-orange-500' },
  { rank: 4, name: '樂天桃猿', g: 40, w: 19, l: 21, d: 0, pct: '.452', gb: '5.0', color: 'text-red-400' },
  { rank: 5, name: '富邦悍將', g: 40, w: 17, l: 22, d: 1, pct: '.436', gb: '6.5', color: 'text-blue-500' },
  { rank: 6, name: '台鋼雄鷹', g: 40, w: 15, l: 25, d: 0, pct: '.375', gb: '9.0', color: 'text-emerald-400' },
]

// MLB 2026 (standings example)
const MLB_EAST = [
  { rank: 1, name: 'NYY', g: 48, w: 32, l: 16, d: 0, pct: '.667', gb: '-', color: 'text-blue-600' },
  { rank: 2, name: 'BAL', g: 48, w: 28, l: 20, d: 0, pct: '.583', gb: '4.0', color: 'text-orange-500' },
  { rank: 3, name: 'BOS', g: 49, w: 26, l: 23, d: 0, pct: '.531', gb: '6.5', color: 'text-red-600' },
  { rank: 4, name: 'TB', g: 48, w: 24, l: 24, d: 0, pct: '.500', gb: '8.0', color: 'text-sky-500' },
  { rank: 5, name: 'TOR', g: 49, w: 22, l: 27, d: 0, pct: '.449', gb: '10.5', color: 'text-blue-400' },
]

const MLB_CENTRAL = [
  { rank: 1, name: 'CLE', g: 48, w: 29, l: 19, d: 0, pct: '.604', gb: '-', color: 'text-red-500' },
  { rank: 2, name: 'MIN', g: 48, w: 27, l: 21, d: 0, pct: '.563', gb: '2.0', color: 'text-blue-600' },
  { rank: 3, name: 'KCR', g: 49, w: 26, l: 23, d: 0, pct: '.531', gb: '3.5', color: 'text-sky-500' },
  { rank: 4, name: 'DET', g: 48, w: 23, l: 25, d: 0, pct: '.479', gb: '6.0', color: 'text-blue-400' },
  { rank: 5, name: 'CWS', g: 49, w: 17, l: 32, d: 0, pct: '.347', gb: '12.5', color: 'text-gray-400' },
]

const MLB_WEST = [
  { rank: 1, name: 'HOU', g: 48, w: 28, l: 20, d: 0, pct: '.583', gb: '-', color: 'text-orange-600' },
  { rank: 2, name: 'TEX', g: 49, w: 27, l: 22, d: 0, pct: '.551', gb: '1.5', color: 'text-blue-400' },
  { rank: 3, name: 'SEA', g: 48, w: 25, l: 23, d: 0, pct: '.521', gb: '3.0', color: 'text-teal-500' },
  { rank: 4, name: 'LAA', g: 49, w: 22, l: 27, d: 0, pct: '.449', gb: '6.5', color: 'text-red-500' },
  { rank: 5, name: 'OAK', g: 48, w: 20, l: 28, d: 0, pct: '.417', gb: '8.0', color: 'text-green-400' },
]

// MLB NL
const MLB_NL_EAST = [
  { rank: 1, name: 'PHI', g: 48, w: 30, l: 18, d: 0, pct: '.625', gb: '-', color: 'text-red-500' },
  { rank: 2, name: 'ATL', g: 49, w: 28, l: 21, d: 0, pct: '.571', gb: '2.5', color: 'text-blue-500' },
  { rank: 3, name: 'NYM', g: 48, w: 26, l: 22, d: 0, pct: '.542', gb: '4.0', color: 'text-blue-600' },
  { rank: 4, name: 'WSH', g: 48, w: 21, l: 27, d: 0, pct: '.438', gb: '9.0', color: 'text-red-400' },
  { rank: 5, name: 'MIA', g: 49, w: 18, l: 31, d: 0, pct: '.367', gb: '12.5', color: 'text-teal-400' },
]

// KBO 2026
const KBO = [
  { rank: 1, name: 'KIA', g: 48, w: 30, l: 18, d: 0, pct: '.625', gb: '-', color: 'text-red-500' },
  { rank: 2, name: 'LG', g: 48, w: 28, l: 20, d: 0, pct: '.583', gb: '2.0', color: 'text-red-600' },
  { rank: 3, name: 'SSG', g: 49, w: 27, l: 22, d: 0, pct: '.551', gb: '3.5', color: 'text-yellow-400' },
  { rank: 4, name: 'KT', g: 48, w: 25, l: 23, d: 0, pct: '.521', gb: '5.0', color: 'text-black' },
  { rank: 5, name: '두산', g: 49, w: 24, l: 25, d: 0, pct: '.490', gb: '6.5', color: 'text-blue-500' },
  { rank: 6, name: 'NC', g: 48, w: 22, l: 26, d: 0, pct: '.458', gb: '8.0', color: 'text-teal-500' },
  { rank: 7, name: '삼성', g: 49, w: 21, l: 28, d: 0, pct: '.429', gb: '9.5', color: 'text-blue-400' },
  { rank: 8, name: '롯데', g: 48, w: 19, l: 29, d: 0, pct: '.396', gb: '11.0', color: 'text-red-500' },
  { rank: 9, name: '한화', g: 49, w: 18, l: 31, d: 0, pct: '.367', gb: '12.5', color: 'text-orange-500' },
  { rank: 10, name: '키움', g: 48, w: 17, l: 31, d: 0, pct: '.354', gb: '13.0', color: 'text-red-400' },
]

// ============================================================
// 🏷️ 國家標籤配置
// ============================================================

const COUNTRIES = [
  {
    id: 'japan',
    label: '🇯🇵 日本 NPB',
    leagues: NPB_STANDINGS,
    type: 'split',
  },
  {
    id: 'china',
    label: '🇹🇼 台灣 CPBL',
    leagues: [{ league: '中華職棒', teams: CPBL, icon: '🐉' }],
    type: 'single',
  },
  {
    id: 'usa',
    label: '🇺🇸 美國 MLB',
    leagues: [
      { league: 'AL 東區', teams: MLB_EAST, icon: '⚾' },
      { league: 'AL 中區', teams: MLB_CENTRAL, icon: '⚾' },
      { league: 'AL 西區', teams: MLB_WEST, icon: '⚾' },
      { league: 'NL 東區', teams: MLB_NL_EAST, icon: '⚾' },
    ],
    type: 'split',
  },
  {
    id: 'korea',
    label: '🇰🇷 韓國 KBO',
    leagues: [{ league: 'KBO 리그', teams: KBO, icon: '🇰🇷' }],
    type: 'single',
  },
]

// ============================================================
// 🏟️ 主頁面
// ============================================================

export default function BaseballHome() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-abyss via-ocean-deep to-ocean-abyss py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ===== 英雄區 ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-ocean-wave to-coral mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-gradient">⚾ 世界野球戦績</span>
          </h1>
          <p className="text-stone-gray max-w-xl mx-auto text-sm">
            日本 NPB · 台灣 CPBL · 美國 MLB · 韓國 KBO
          </p>
        </motion.div>

        {/* ===== 🇯🇵🇹🇼🇺🇸🇰🇷 四國標籤 ===== */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {COUNTRIES.map((country, idx) => (
            <button
              key={country.id}
              onClick={() => setActiveTab(idx)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === idx
                  ? 'bg-ocean-wave/20 text-ocean-wave border border-ocean-wave/40 shadow-sm shadow-ocean-wave/10'
                  : 'text-stone-gray border border-ocean-light/10 hover:border-ocean-light/30 hover:text-shell-white'
              }`}
            >
              {country.label}
            </button>
          ))}
        </div>

        {/* ===== 戰績表 ===== */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {COUNTRIES[activeTab].leagues.map((league) => (
              <div
                key={league.league}
                className="ocean-card rounded-xl border border-ocean-light/20 bg-ocean-mid/20 p-5 mb-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span>{league.icon}</span>
                  <h3 className="font-bold text-ocean-foam text-sm">{league.league}</h3>
                  <span className="text-[10px] text-stone-gray/50 ml-auto">2026 賽季</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ocean-light/20 text-stone-gray text-[11px] uppercase tracking-wider">
                        <th className="text-left py-2 pr-2 w-10">#</th>
                        <th className="text-left py-2 pr-2">球隊</th>
                        <th className="text-center py-2 pr-2">試合</th>
                        <th className="text-center py-2 pr-2">勝</th>
                        <th className="text-center py-2 pr-2">敗</th>
                        <th className="text-center py-2 pr-2">分</th>
                        <th className="text-center py-2 pr-2">勝率</th>
                        <th className="text-center py-2 pr-2">差</th>
                      </tr>
                    </thead>
                    <tbody>
                      {league.teams.map((team) => (
                        <tr
                          key={team.name}
                          className={`border-b border-ocean-light/10 hover:bg-white/5 transition-colors ${
                            team.rank === 1 ? 'bg-yellow-400/5' : ''
                          }`}
                        >
                          <td className={`py-2.5 pr-2 font-bold text-sm ${
                            team.rank === 1 ? 'text-yellow-400' : team.rank <= 3 ? 'text-ocean-wave' : 'text-stone-gray'
                          }`}>{team.rank}</td>
                          <td className="py-2.5 pr-2 text-shell-white font-medium">
                            <span className={`${team.color} inline-block w-2 h-2 rounded-full mr-2`} />
                            {team.name}
                          </td>
                          <td className="text-center py-2.5 pr-2 text-stone-gray">{team.g}</td>
                          <td className="text-center py-2.5 pr-2 text-emerald-400 font-medium">{team.w}</td>
                          <td className="text-center py-2.5 pr-2 text-red-400 font-medium">{team.l}</td>
                          <td className="text-center py-2.5 pr-2 text-stone-gray">{team.d}</td>
                          <td className="text-center py-2.5 pr-2 text-shell-white font-mono">{team.pct}</td>
                          <td className="text-center py-2.5 pr-2 text-stone-gray">{team.gb}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ===== 🔗 前往各分頁 ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4 mt-8"
        >
          <Link href="/觀賽紀錄" className="ocean-card group p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 hover:border-ocean-wave/40 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📖</span>
              <h3 className="font-bold text-shell-white text-sm">棒球觀戰紀錄</h3>
            </div>
            <p className="text-xs text-stone-gray/70">14 場 NPB 巡禮・看球紀錄簿</p>
            <div className="mt-3 text-ocean-wave/60 text-xs group-hover:text-ocean-wave transition-colors flex items-center gap-1">
              前往 <ExternalLink className="w-3 h-3" />
            </div>
          </Link>

          <Link href="/旅外球員" className="ocean-card group p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 hover:border-ocean-wave/40 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🧢</span>
              <h3 className="font-bold text-shell-white text-sm">旅外球員</h3>
            </div>
            <p className="text-xs text-stone-gray/70">台灣旅外球員動向</p>
            <div className="mt-3 text-ocean-wave/60 text-xs group-hover:text-ocean-wave transition-colors flex items-center gap-1">
              前往 <ExternalLink className="w-3 h-3" />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
