'use client'

import { Trophy, ArrowRight, ExternalLink, MapPin, Calendar, CheckCircle, Clock, BookOpen, Star, DollarSign, Train, Zap, Shield } from 'lucide-react'
import CosmicButton from '@/components/CosmicButton'
import Link from 'next/link'
import { motion } from 'framer-motion'
import StadiumCard from './components/StadiumCard'

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
  { name: 'バンテリンドーム', team: '中日龍', date: '2026-08-11', bought: false, price: 0, note: '6/3(水) 11:00 搶票 📌 下個目標', color: 'from-blue-400 to-indigo-600' },
  { name: 'MAZDA Zoom-Zoom', team: '廣島鯉魚', date: '2026-09-05', bought: true, price: 3520, note: '廣島名物・牡蠣と野球！🦪', color: 'from-red-400 to-rose-600' },
  { name: 'PayPay巨蛋', team: '軟銀鷹', date: '2026-09-06', bought: false, price: 0, note: '6/7〜 搶票', color: 'from-yellow-400 to-amber-600' },
  { name: '甲子園球場', team: '阪神虎 vs 広島', date: '2026-09-09', bought: true, price: 9986, note: '聖地再臨！阪神×広島 伝統の一戦 🐯', color: 'from-yellow-500 to-amber-700' },
  { name: 'ほっと神戸', team: '歐力士猛牛 vs 西武', date: '2026-09-10', bought: false, price: 0, note: '7/22(水) 京セラD一起搶', color: 'from-amber-500 to-orange-700' },
  { name: '京セラドーム大阪', team: '歐力士猛牛 vs 樂天', date: '2026-09-12', bought: false, price: 0, note: '7/22(水) 一起搶！關西收尾戰', color: 'from-amber-500 to-orange-700' },
]

const BOUGHT = STADIUM_TOUR.filter(s => s.bought)
const NOT_BOUGHT = STADIUM_TOUR.filter(s => !s.bought)
const TOTAL_COST = BOUGHT.reduce((sum, s) => sum + s.price, 0)
const BUDGET_REMAINING = 142325 // 剩餘預算

export default function BaseballPage() {
  const totalGames = STADIUM_TOUR.length
  const totalBought = BOUGHT.length
  const progressPercent = Math.round((totalBought / totalGames) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-abyss to-ocean-deep py-20 px-4">
      <div className="max-w-7xl mx-auto">
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
            <span className="text-gradient">棒球會</span>
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
              <p className="text-3xl font-bold text-coral">{NOT_BOUGHT.length}</p>
              <p className="text-xs text-stone-gray mt-1">待購 ⏳</p>
            </div>
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 text-center">
              <p className="text-xl font-bold text-sunray">¥{TOTAL_COST.toLocaleString()}</p>
              <p className="text-xs text-stone-gray mt-1">已花球票</p>
            </div>
          </div>
        </motion.section>

        {/* ===== 🏟️ 14場巡禮全清單 ===== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="ocean-card p-6 md:p-8 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <MapPin className="w-6 h-6 text-ocean-wave mr-3" />
                2026 巡禮全行程
              </h2>
              <span className="text-xs text-stone-gray bg-ocean-mid/30 px-3 py-1 rounded-full">{totalGames} 場</span>
            </div>

            {/* 進度條 */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-stone-gray mb-2">
                <span>制霸進度</span>
                <span>{totalBought} / {totalGames} 已購 ({progressPercent}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-ocean-mid/30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-ocean-wave via-emerald-400 to-coral"
                />
              </div>
              <div className="flex justify-between text-xs text-stone-gray/60 mt-1">
                <span>6月北海道</span>
                <span>7月横浜</span>
                <span>8月名古屋</span>
                <span>9月關西</span>
              </div>
            </div>

            {/* 經費小計 */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-ocean-mid/20 border border-ocean-light/10">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-stone-gray">已購球票 <strong className="text-emerald-400">¥{TOTAL_COST.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-coral" />
                <span className="text-stone-gray">預算剩餘 <strong className="text-coral">¥{BUDGET_REMAINING.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-ocean-wave" />
                <span className="text-stone-gray">搶票日 <strong className="text-ocean-wave">6/3 · 6/19 · 6/20 · 7/22</strong></span>
              </div>
            </div>

            {/* 球場清單 */}
            <div className="space-y-2">
              {STADIUM_TOUR.map((game, index) => (
                <motion.div
                  key={game.name + game.date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.04 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                    game.bought
                      ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
                      : 'border-ocean-light/10 bg-ocean-mid/10 hover:bg-ocean-mid/20'
                  }`}
                >
                  {/* 日期 */}
                  <div className="w-14 shrink-0 text-center">
                    <div className="text-xs text-stone-gray">{game.date.slice(5)}</div>
                    <div className="text-[10px] text-stone-gray/60">{['木','金','土','日','月','火','水','木','金','土','日','月','火','水','木','金','土','日','月','火','水','木','金','土','日','月','火','水','木','金','土'][new Date(game.date).getDay()]}曜</div>
                  </div>

                  {/* 狀態圖示 */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${game.color}`}>
                    {game.bought
                      ? <CheckCircle className="w-4 h-4 text-white" />
                      : <Clock className="w-4 h-4 text-white/70" />
                    }
                  </div>

                  {/* 球場資訊 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-shell-white truncate">{game.name}</h3>
                      {game.bought && <span className="text-[10px] text-emerald-400 shrink-0">¥{game.price.toLocaleString()}</span>}
                    </div>
                    <p className="text-xs text-stone-gray truncate">{game.team}</p>
                  </div>

                  {/* 備註 */}
                  <div className="hidden md:block text-xs text-stone-gray/60 max-w-[160px] truncate text-right">
                    {game.note}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 搶票行事曆 */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-ocean-wave/10 to-coral/5 border border-ocean-wave/20">
              <p className="text-sm text-stone-gray flex items-center gap-2">
                <Calendar className="w-4 h-4 text-coral" />
                📌 下次搶票：<strong className="text-coral">6/3(水) 11:00 中日龍 @ バンテリンD</strong>
                <span className="text-stone-gray/60">｜6/19 養樂多｜6/20 巨人｜7/22 關西二連戰</span>
              </p>
            </div>
          </div>
        </motion.section>

        {/* ===== 📖 看球紀錄簿 ===== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="ocean-card p-6 md:p-8 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <BookOpen className="w-6 h-6 text-ocean-wave mr-3" />
              看球紀錄簿
            </h2>

            <p className="text-sm text-stone-gray mb-8 max-w-2xl">
              每一場比賽都是一段旅程的節點。從北海道的雪景到甲子園的泥土——
              這些是屬於這趟旅程的棒球記憶。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 已購場次 + 已造訪 */}
              <StadiumCard
                name="京セラドーム大阪"
                team="歐力士猛牛"
                date="2025 ⭐ 已造訪"
                note="大阪巨蛋初體驗！歐力士球迷的熱情令人印象深刻 ⚾"
                index={0}
              />
              <StadiumCard
                name="甲子園球場"
                team="阪神虎"
                date="2024 ⭐ 已造訪"
                note="聖地甲子園！泥土的觸感、阪神迷的狂熱——野球的原點 🌱"
                index={1}
              />
              <StadiumCard
                name="ES CON FIELD 北海道"
                team="日本火腿 vs 軟銀"
                date="2026-06-12 ✅"
                note="Peach ¥7,313 · 北海道遠征開幕！新球場初踏上 🔥"
                index={2}
              />
              <StadiumCard
                name="楽天モバイルパーク"
                team="樂天金鷹 vs 西武"
                date="2026-06-14 ✅"
                note="夜巴從札幌殺到仙台！東北巡禮大移動 🚌"
                index={3}
              />
              <StadiumCard
                name="横浜スタジアム"
                team="DeNA 海星 vs 中日"
                date="2026-07-07 ✅"
                note="七夕の横浜スタジアム！地元横浜で観戦 🌟"
                index={4}
              />
              <StadiumCard
                name="甲子園球場"
                team="阪神虎 vs 広島 🐯"
                date="2026-09-09 ✅"
                note="聖地再臨！伝統の一戦 ¥9,986 🐯🔥"
                index={5}
              />
            </div>
          </div>
        </motion.section>

        {/* ===== 📊 NPB 戰績表 ===== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gradient">2026 NPB 戰績表</h2>
            <span className="text-[10px] text-stone-gray/60 bg-ocean-mid/20 px-2 py-1 rounded-full ml-auto">數據來源：NPB</span>
          </div>

          {/* 中央聯盟 */}
          <div className="ocean-card rounded-xl border border-ocean-light/20 bg-ocean-mid/20 p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-ocean-foam">セ・リーグ（中央聯盟）</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ocean-light/20 text-stone-gray text-xs uppercase tracking-wider">
                    <th className="text-left py-2 pr-2">順位</th>
                    <th className="text-left py-2 pr-2">球隊</th>
                    <th className="text-center py-2 pr-2">試合</th>
                    <th className="text-center py-2 pr-2">勝</th>
                    <th className="text-center py-2 pr-2">敗</th>
                    <th className="text-center py-2 pr-2">引分</th>
                    <th className="text-center py-2 pr-2">勝率</th>
                    <th className="text-center py-2 pr-2">差</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { rank: 1, name: '阪神', g: 48, w: 30, l: 16, d: 2, pct: '.652', gb: '-' },
                    { rank: 2, name: '巨人', g: 48, w: 28, l: 18, d: 2, pct: '.609', gb: '2.0' },
                    { rank: 3, name: 'DeNA', g: 48, w: 26, l: 21, d: 1, pct: '.553', gb: '4.5' },
                    { rank: 4, name: '広島', g: 48, w: 23, l: 24, d: 1, pct: '.479', gb: '7.5' },
                    { rank: 5, name: '中日', g: 49, w: 19, l: 29, d: 1, pct: '.396', gb: '12.0' },
                    { rank: 6, name: 'ヤクルト', g: 48, w: 15, l: 32, d: 1, pct: '.319', gb: '15.5' },
                  ].map((team) => (
                    <tr key={team.name} className={`border-b border-ocean-light/10 hover:bg-white/5 transition-colors ${team.rank === 1 ? 'bg-yellow-400/5' : ''}`}>
                      <td className={`py-2.5 pr-2 font-bold ${team.rank === 1 ? 'text-yellow-400' : team.rank <= 3 ? 'text-ocean-wave' : 'text-stone-gray'}`}>{team.rank}</td>
                      <td className="py-2.5 pr-2 text-shell-white font-medium">{team.name}</td>
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

          {/* 太平洋聯盟 */}
          <div className="ocean-card rounded-xl border border-ocean-light/20 bg-ocean-mid/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-ocean-foam">パ・リーグ（太平洋聯盟）</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ocean-light/20 text-stone-gray text-xs uppercase tracking-wider">
                    <th className="text-left py-2 pr-2">順位</th>
                    <th className="text-left py-2 pr-2">球隊</th>
                    <th className="text-center py-2 pr-2">試合</th>
                    <th className="text-center py-2 pr-2">勝</th>
                    <th className="text-center py-2 pr-2">敗</th>
                    <th className="text-center py-2 pr-2">引分</th>
                    <th className="text-center py-2 pr-2">勝率</th>
                    <th className="text-center py-2 pr-2">差</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { rank: 1, name: '日本ハム', g: 49, w: 28, l: 20, d: 1, pct: '.583', gb: '-' },
                    { rank: 2, name: 'ロッテ', g: 48, w: 27, l: 19, d: 2, pct: '.587', gb: '0.0' },
                    { rank: 3, name: 'ソフトバンク', g: 49, w: 26, l: 22, d: 1, pct: '.542', gb: '2.0' },
                    { rank: 4, name: '西武', g: 47, w: 23, l: 24, d: 0, pct: '.489', gb: '4.5' },
                    { rank: 5, name: '楽天', g: 49, w: 20, l: 28, d: 1, pct: '.417', gb: '8.0' },
                    { rank: 6, name: 'オリックス', g: 48, w: 16, l: 31, d: 1, pct: '.340', gb: '11.5' },
                  ].map((team) => (
                    <tr key={team.name} className={`border-b border-ocean-light/10 hover:bg-white/5 transition-colors ${team.rank === 1 ? 'bg-emerald-400/5' : ''}`}>
                      <td className={`py-2.5 pr-2 font-bold ${team.rank === 1 ? 'text-emerald-400' : team.rank <= 3 ? 'text-ocean-wave' : 'text-stone-gray'}`}>{team.rank}</td>
                      <td className="py-2.5 pr-2 text-shell-white font-medium">{team.name}</td>
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
            <p className="text-[10px] text-stone-gray/40 mt-3 text-right">數據為參考範例，實際戰績請參考 NPB 官方</p>
          </div>
        </motion.section>

        {/* ===== 🚀 子站傳送門 ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="ocean-card group relative overflow-hidden p-10 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 hover:border-ocean-wave/50 transition-all duration-500">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-ocean-surface via-ocean-mid to-coral opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500" />
            
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-6"
            >
              <Star className="w-12 h-12 mx-auto text-ocean-wave/60" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-4">前往技術情報站</h2>
            <p className="text-stone-gray mb-8">
              專業戰報 · CPBL 每日數據 · 選手動態
            </p>

            <Link href="https://baseball.studio-imori.com" target="_blank">
              <CosmicButton size="lg" icon={<ExternalLink className="w-5 h-5" />}>
                前往技術情報站 →
              </CosmicButton>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
