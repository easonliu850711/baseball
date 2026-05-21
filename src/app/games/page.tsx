'use client'

import { Trophy, MapPin, Calendar, CheckCircle, Clock, DollarSign, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import StadiumCard from '../components/StadiumCard'

// 🎯 2026 NPB 14場巡禮完整清單
const STADIUM_TOUR = [
  { name: 'ES CON FIELD 北海道', team: '日本火腿', date: '2026-06-12', bought: true, price: 7313, note: 'Peach航空 北海道遠征開幕 🔥', color: 'from-sky-400 to-blue-600' },
  { name: '楽天モバイルパーク', team: '樂天金鷹', date: '2026-06-14', bought: true, price: 7165, note: '夜巴從札幌殺到仙台！東西縱走', color: 'from-red-500 to-rose-700' },
  { name: 'ZOZOマリンスタジアム', team: '羅德海洋', date: '2026-06-21', bought: true, price: 7020, note: '千葉海邊的棒球 × 炸雞啤酒 🍗🍺', color: 'from-black to-gray-800' },
  { name: 'ベルーナドーム', team: '西武獅', date: '2026-06-28', bought: true, price: 6040, note: '黃金週場勘後的正式巡禮 ✅', color: 'from-emerald-500 to-green-700' },
  { name: '横浜スタジアム', team: 'DeNA 海星 vs 中日', date: '2026-07-07', bought: true, price: 3960, note: '七夕在横浜！中日戦 🌟', color: 'from-blue-500 to-cyan-600' },
  { name: '富山 オールスター', team: '明星賽 ⭐', date: '2026-07-29', bought: false, price: 0, note: 'オールスター！夢の競演', color: 'from-yellow-400 to-amber-600' },
  { name: '神宮球場', team: '養樂多燕子', date: '2026-08-02', bought: false, price: 0, note: '6/19(金) 11:00 搶票', color: 'from-green-400 to-emerald-600' },
  { name: '東京ドーム', team: '讀賣巨人', date: '2026-08-02', bought: false, price: 0, note: '6/20(土) 11:00 搶票', color: 'from-orange-400 to-red-600' },
  { name: 'バンテリンドーム', team: '中日龍', date: '2026-08-11', bought: false, price: 0, note: '6/3(水) 11:00 搶票 📌', color: 'from-blue-400 to-indigo-600' },
  { name: 'MAZDA Zoom-Zoom', team: '廣島鯉魚', date: '2026-09-05', bought: true, price: 3520, note: '廣島名物・牡蠣と野球！🦪', color: 'from-red-400 to-rose-600' },
  { name: 'PayPay巨蛋', team: '軟銀鷹', date: '2026-09-06', bought: false, price: 0, note: '6/7〜 搶票', color: 'from-yellow-400 to-amber-600' },
  { name: '甲子園球場', team: '阪神虎 vs 広島', date: '2026-09-09', bought: true, price: 9986, note: '聖地再臨！阪神×広島 🐯', color: 'from-yellow-500 to-amber-700' },
  { name: 'ほっと神戸', team: '歐力士猛牛 vs 西武', date: '2026-09-10', bought: false, price: 0, note: '7/22(水) 京セラD一起搶', color: 'from-amber-500 to-orange-700' },
  { name: '京セラドーム大阪', team: '歐力士猛牛 vs 樂天', date: '2026-09-12', bought: false, price: 0, note: '7/22(水) 一起搶！關西收尾戰', color: 'from-amber-500 to-orange-700' },
]

const BOUGHT = STADIUM_TOUR.filter(s => s.bought)
const NOT_BOUGHT = STADIUM_TOUR.filter(s => !s.bought)
const TOTAL_COST = BOUGHT.reduce((sum, s) => sum + s.price, 0)

// 📖 看球紀錄簿
const WATCH_LOG = [
  { date: '2026-04-26', opponent: '楽天 vs 西武', stadium: '楽天モバイルパーク', highlight: '則本昂大の力投！', mood: '🎉', hasRecord: true },
  { date: '2026-04-28', opponent: 'ロッテ vs 日本ハム', stadium: 'ZOZOマリン', highlight: '佐佐木朗希の圧巻', mood: '🔥', hasRecord: true },
  { date: '2026-05-04', opponent: '西武 vs 楽天', stadium: 'ベルーナドーム', highlight: '渡邊勇太朗好投', mood: '👍', hasRecord: true },
  { date: '2026-06-12', opponent: '日本ハム vs ○○', stadium: 'ES CON FIELD', highlight: '北海道遠征開幕！', mood: '🌟', hasRecord: false },
  { date: '2026-06-14', opponent: '楽天 vs ○○', stadium: '楽天モバイルパーク', highlight: '東西縱走第二戰', mood: '🚌', hasRecord: false },
  { date: '2026-06-21', opponent: 'ロッテ vs ○○', stadium: 'ZOZOマリン', highlight: '千葉海邊啤酒之夜', mood: '🍺', hasRecord: false },
]

export default function WatchRecords() {
  const totalGames = STADIUM_TOUR.length
  const totalBought = BOUGHT.length
  const progressPercent = Math.round((totalBought / totalGames) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-abyss to-ocean-deep py-16 px-4">
      <div className="max-w-7xl mx-auto">
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-ocean-wave to-coral mb-6 shadow-lg shadow-ocean-wave/20">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">棒球觀賽紀錄</span>
          </h1>
          <p className="text-xl text-stone-gray max-w-2xl mx-auto mb-2">
            2026 NPB 球場巡禮 · 14 場制霸への道
          </p>
          <p className="text-sm text-stone-gray/60">
            從北海道到福岡，從巨蛋到甲子園——這趟旅程的棒球足跡
          </p>
        </motion.div>

        {/* ===== 📊 制霸儀表板 ===== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 text-center">
              <p className="text-3xl font-bold text-ocean-wave">{totalGames}</p>
              <p className="text-xs text-stone-gray mt-1">總場次</p>
            </div>
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 text-center">
              <p className="text-3xl font-bold text-emerald-400">{totalBought}</p>
              <p className="text-xs text-stone-gray mt-1">已購 ✅</p>
            </div>
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 text-center">
              <p className="text-3xl font-bold text-coral-light">{14 - totalBought}</p>
              <p className="text-xs text-stone-gray mt-1">待購 ⏳</p>
            </div>
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 text-center">
              <p className="text-3xl font-bold text-sunray">¥{TOTAL_COST.toLocaleString()}</p>
              <p className="text-xs text-stone-gray mt-1">已花費</p>
            </div>
          </div>

          {/* 進度條 */}
          <div className="mt-6 ocean-card p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-gray">制霸進度</span>
              <span className="text-ocean-wave font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-ocean-deep rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-ocean-wave to-coral rounded-full relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ===== 🗺️ 制霸路線 ===== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-wave to-ocean-surface flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gradient">制霸路線</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STADIUM_TOUR.map((stadium, idx) => (
              <StadiumCard key={stadium.name} name={stadium.name} team={stadium.team} date={stadium.date} note={stadium.note} index={idx} />
            ))}
          </div>
        </motion.section>

        {/* ===== 📖 看球紀錄簿 ===== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gradient">看球紀錄簿</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WATCH_LOG.map((log, idx) => (
              <div
                key={log.date}
                className={`ocean-card group relative p-5 rounded-xl border transition-all duration-300 ${
                  log.hasRecord
                    ? 'border-ocean-wave/30 bg-ocean-mid/20 hover:border-ocean-wave/60'
                    : 'border-ocean-light/10 bg-ocean-deep/30 hover:border-ocean-light/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-ocean-wave/60" />
                    <span className="text-sm text-stone-gray">{log.date}</span>
                  </div>
                  <span className="text-lg">{log.mood}</span>
                </div>
                <h3 className="font-bold text-shell-white text-sm mb-1">{log.opponent}</h3>
                <p className="text-xs text-stone-gray/70 mb-2">{log.stadium}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-ocean-wave/40" />
                  <span className="text-xs text-ocean-foam/60">{log.highlight}</span>
                </div>
                {log.hasRecord && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400/60">
                    <CheckCircle className="w-3 h-3" /> 已記錄
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
