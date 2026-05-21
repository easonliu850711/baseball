'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Globe, ExternalLink } from 'lucide-react'

const PLAYERS = [
  {
    name: '張育成',
    enName: 'Yu Chang',
    team: '坦帕灣光芒',
    league: 'MLB',
    level: '3A',
    pos: '內野手',
    status: '春訓競爭中',
    note: '2026 年尋求重返大聯盟',
    color: 'from-sky-500 to-blue-700',
  },
  {
    name: '鄧愷威',
    enName: 'Kai-Wei Teng',
    team: '舊金山巨人',
    league: 'MLB',
    level: '2A',
    pos: '投手 (右投)',
    status: '小聯盟開季',
    note: '2025 年曾升上大聯盟',
    color: 'from-orange-500 to-red-600',
  },
  {
    name: '鄭宗哲',
    enName: 'Tsung-Che Cheng',
    team: '匹茲堡海盜',
    league: 'MLB',
    level: '2A',
    pos: '內野手',
    status: '小聯盟開季',
    note: '2025 年底進入 40 人名單',
    color: 'from-yellow-500 to-amber-700',
  },
  {
    name: '李灝宇',
    enName: 'Hao-Yu Lee',
    team: '底特律老虎',
    league: 'MLB',
    level: '2A',
    pos: '內野手',
    status: '小聯盟開季',
    note: '2025 年在 2A 繳出 .820 OPS',
    color: 'from-blue-500 to-indigo-700',
  },
  {
    name: '林振瑋',
    enName: 'Chen-Wei Lin',
    team: '聖路易紅雀',
    league: 'MLB',
    level: '1A',
    pos: '投手 (右投)',
    status: '小聯盟開季',
    note: '2024 年簽約，火球男',
    color: 'from-red-500 to-rose-700',
  },
]

const JAPAN_PLAYERS = [
  {
    name: '王彥程',
    enName: 'Yen-Cheng Wang',
    team: '東北樂天金鷲',
    league: 'NPB',
    level: '二軍',
    pos: '投手 (左投)',
    status: '二軍調整中',
    note: '從育成轉支配下',
    color: 'from-red-400 to-rose-600',
  },
  {
    name: '孫易磊',
    enName: 'Yi-Lei Sun',
    team: '日本火腿',
    league: 'NPB',
    level: '二軍',
    pos: '投手 (右投)',
    status: '二軍開季',
    note: '2024 年加入火腿',
    color: 'from-sky-400 to-blue-600',
  },
]

export default function OverseasPlayers() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-abyss via-ocean-deep to-ocean-abyss py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ===== 🔙 回主頁 ===== */}
        <Link href="/" className="inline-flex items-center gap-2 text-stone-gray hover:text-shell-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> 回到戰績首頁
        </Link>

        {/* ===== 英雄區 ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-ocean-wave to-emerald-400 mb-6 shadow-lg shadow-ocean-wave/20">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">旅外球員</span>
          </h1>
          <p className="text-xl text-stone-gray max-w-2xl mx-auto mb-2">
            台灣囝仔 放眼世界
          </p>
          <p className="text-sm text-stone-gray/60">
            追蹤台灣旅外棒球選手的最新動態
          </p>
        </motion.div>

        {/* ===== 🇺🇸 MLB 體系 ===== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🇺🇸</span>
            <h2 className="text-xl font-bold text-gradient">美國 MLB 體系</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLAYERS.map((player) => (
              <div
                key={player.name}
                className="ocean-card group p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 hover:border-ocean-wave/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${player.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {player.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-shell-white text-base">{player.name}</h3>
                    <p className="text-xs text-stone-gray/60 mb-2">{player.enName} · {player.pos}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-ocean-light/20 text-ocean-foam">{player.team}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-ocean-mid/30 text-stone-gray">{player.level}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        player.status.includes('大聯盟') || player.status.includes('支配')
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>{player.status}</span>
                    </div>
                    <p className="text-xs text-stone-gray/50">{player.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ===== 🇯🇵 NPB 體系 ===== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🇯🇵</span>
            <h2 className="text-xl font-bold text-gradient">日本 NPB 體系</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {JAPAN_PLAYERS.map((player) => (
              <div
                key={player.name}
                className="ocean-card group p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 hover:border-ocean-wave/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${player.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {player.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-shell-white text-base">{player.name}</h3>
                    <p className="text-xs text-stone-gray/60 mb-2">{player.enName} · {player.pos}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-ocean-light/20 text-ocean-foam">{player.team}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-ocean-mid/30 text-stone-gray">{player.level}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{player.status}</span>
                    </div>
                    <p className="text-xs text-stone-gray/50">{player.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 ocean-card p-6 rounded-xl border border-ocean-light/10 bg-ocean-deep/30 text-center">
            <p className="text-stone-gray/60 text-sm mb-1">更多旅外球員資訊陸續更新中</p>
            <p className="text-stone-gray/40 text-xs">包含：獨立聯盟、墨西哥聯盟等</p>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
