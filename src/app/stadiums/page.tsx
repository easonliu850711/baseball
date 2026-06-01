'use client'

import { Trophy, MapPin, Calendar, Clock, DollarSign, Star, Bus, Plane, Train, Bed } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import StadiumCard from '../components/StadiumCard'

// 🎯 2026 NPB 14場巡禮完整清單
const STADIUM_TOUR = [
  { id: 1, name: 'ES CON FIELD 北海道', team: '日本火腿', date: '2026-06-12', week: '金', watched: false, bought: true, price: 7313, transport: '✈️ Peach ¥10,250（台北→札幌）已購', hotel: '🏨 レンブラントスタイル札幌 ¥11,400 已訂', note: 'Peach航空 北海道遠征開幕 🔥', color: 'from-sky-400 to-blue-600' },
  { id: 2, name: '楽天モバイルパーク', team: '樂天金鷹', date: '2026-06-14', week: '日', watched: false, bought: true, price: 7165, transport: '✈️ Peach ¥7,390（札幌→仙台）已購 + 🚌 夜巴 ¥5,340（仙台→横浜）已購', hotel: '🏨 バリュー・ザ・ホテル仙台名取 ¥7,200 已訂（6/13住宿）', note: '東西縱走！北海道→東北→關東', color: 'from-red-500 to-rose-700' },
  { id: 3, name: 'ZOZOマリンスタジアム', team: '羅德海洋', date: '2026-06-21', week: '日', watched: false, bought: true, price: 7020, transport: '—', hotel: '—', note: '千葉海邊的棒球 × 炸雞啤酒 🍗🍺', color: 'from-black to-gray-800' },
  { id: 4, name: 'ベルーナドーム', team: '西武獅', date: '2026-06-28', week: '日', watched: false, bought: true, price: 6040, transport: '—', hotel: '—', note: '黃金週場勘後的正式巡禮 ✅', color: 'from-emerald-500 to-green-700' },
  { id: 5, name: '横浜スタジアム', team: 'DeNA 海星 vs 中日', date: '2026-07-07', week: '火', watched: false, bought: true, price: 3960, transport: '—', hotel: '—', note: '七夕在横浜！中日戦 🌟', color: 'from-blue-500 to-cyan-600' },
  { id: 6, name: '富山 オールスター', team: '明星賽 ⭐', date: '2026-07-29', week: '水', watched: false, bought: false, price: 0, transport: '🚌 夜巴來回 ¥7,000 已購（横浜⇄富山）', hotel: '🚌 夜巴車上', note: 'オールスター！夢の競演', color: 'from-yellow-400 to-amber-600' },
  { id: 7, name: '神宮球場', team: '養樂多燕子', date: '2026-08-02', week: '日', watched: false, bought: false, price: 0, transport: '—', hotel: '—', note: '6/19(金) 11:00 搶票', color: 'from-green-400 to-emerald-600' },
  { id: 8, name: '東京ドーム', team: '讀賣巨人', date: '2026-08-02', week: '日', watched: false, bought: false, price: 0, transport: '—', hotel: '—', note: '6/20(土) 11:00 搶票', color: 'from-orange-400 to-red-600' },
  { id: 9, name: 'バンテリンドーム', team: '中日龍', date: '2026-08-11', week: '火', watched: false, bought: false, price: 0, transport: '🚌 夜巴來回 ¥8,000 已購（横浜⇄名古屋）', hotel: '🚌 夜巴車上', note: '6/3(水) 11:00 搶票 📌 後天！', color: 'from-blue-400 to-indigo-600' },
  { id: 10, name: 'MAZDA Zoom-Zoom', team: '廣島鯉魚', date: '2026-09-05', week: '土', watched: false, bought: true, price: 3520, transport: '✈️ 東京→廣島 ¥9,500 待購', hotel: '🏨 アパホテル広島駅前 ¥8,900 已訂', note: '廣島名物・牡蠣と野球！🦪', color: 'from-red-400 to-rose-600' },
  { id: 11, name: 'PayPay巨蛋', team: '軟銀鷹', date: '2026-09-06', week: '日', watched: false, bought: false, price: 0, transport: '🚄 新幹線 ¥5,400（広島→福岡）待購 + ✈️ Peach ¥10,890（福岡→成田）已購', hotel: '—', note: '6/7〜 搶票', color: 'from-yellow-400 to-amber-600' },
  { id: 12, name: '甲子園球場', team: '阪神虎 vs 広島', date: '2026-09-09', week: '水', watched: false, bought: true, price: 9986, transport: '—', hotel: '—', note: '聖地再臨！阪神×広島 🐯', color: 'from-yellow-500 to-amber-700' },
  { id: 13, name: 'ほっと神戸', team: '歐力士猛牛 vs 西武', date: '2026-09-10', week: '木', watched: false, bought: false, price: 0, transport: '—', hotel: '—', note: '7/22(水) 京セラD一起搶', color: 'from-amber-500 to-orange-700' },
  { id: 14, name: '京セラドーム大阪', team: '歐力士猛牛 vs 樂天', date: '2026-09-12', week: '土', watched: false, bought: false, price: 0, transport: '—', hotel: '—', note: '7/22(水) 一起搶！關西收尾戰', color: 'from-amber-500 to-orange-700' },
]

const BOUGHT = STADIUM_TOUR.filter(s => s.bought)
const NOT_BOUGHT = STADIUM_TOUR.filter(s => !s.bought)
const TOTAL_TICKET_COST = BOUGHT.reduce((sum, s) => sum + s.price, 0)

// 交通已購合計
const TRANSPORT_BOUGHT = [
  { name: '台北→札幌 ✈️', price: 10250 },
  { name: '札幌→仙台 ✈️', price: 7390 },
  { name: '仙台→横浜 🚌', price: 5340 },
  { name: '富山夜巴來回 🚌', price: 7000 },
  { name: '名古屋夜巴來回 🚌', price: 8000 },
  { name: '福岡→成田 ✈️', price: 10890 },
]
const TRANSPORT_PENDING = [
  { name: '東京→廣島 ✈️', price: 9500 },
  { name: '広島→福岡 🚄', price: 5400 },
]

// 住宿已訂
const HOTEL_BOOKED = [
  { name: '6/12 レンブラントスタイル札幌', price: 11400 },
  { name: '6/13 バリュー・ザ・ホテル仙台名取', price: 7200 },
  { name: '9/5 アパホテル広島駅前スタジアム', price: 6520 },
]

const TOTAL_TRANSPORT_BOUGHT = TRANSPORT_BOUGHT.reduce((s, t) => s + t.price, 0)
const TOTAL_TRANSPORT_PENDING = TRANSPORT_PENDING.reduce((s, t) => s + t.price, 0)
const TOTAL_HOTEL = HOTEL_BOOKED.reduce((s, h) => s + h.price, 0)
const GRAND_TOTAL = TOTAL_TICKET_COST + TOTAL_TRANSPORT_BOUGHT + TOTAL_HOTEL

// 📖 看球紀錄簿
const WATCH_LOG = [
  { date: '2026-04-01', opponent: '東北楽天 vs 福岡軟銀', stadium: '楽天モバイルパーク', highlight: '單日來回仙台，若熙日本初先發，6局無失分好投', mood: '🔥' },
  { date: '2026-05-03', opponent: '千葉羅德 vs 西武獅', stadium: 'ZOZOマリン', highlight: '換來看溫安可，代打上陣（雖然沒敲安）', mood: '🎉' },
  { date: '2025-09-13', opponent: '台鋼 vs 富邦', stadium: '澄清湖棒球場', highlight: '終於見到超美一粒', mood: '💖' },
  { date: '2024-11-24', opponent: '台灣 vs 日本 4:0', stadium: '東京ドーム', highlight: '炸裂東蛋，史上最屌比賽之一，賽後哭爆 Taiwan No.1', mood: '🏆' },
]

export default function WatchRecords() {
  const totalGames = STADIUM_TOUR.length
  const totalBought = BOUGHT.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-abyss to-ocean-deep py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 回主頁 */}
        <Link href="/" className="inline-flex items-center gap-2 text-stone-gray hover:text-shell-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> 回到戰績首頁
        </Link>

        {/* Hero */}
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

        {/* 儀表板 */}
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
              <p className="text-xs text-stone-gray mt-1">已購票 🎫</p>
            </div>
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 text-center">
              <p className="text-3xl font-bold text-sunray">{14 - totalBought}</p>
              <p className="text-xs text-stone-gray mt-1">待購 ⏳</p>
            </div>
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 text-center">
              <p className="text-3xl font-bold text-coral-light">¥{GRAND_TOTAL.toLocaleString()}</p>
              <p className="text-xs text-stone-gray mt-1">已花費</p>
            </div>
          </div>
        </motion.section>

        {/* === 💰 費用明細 === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sunray to-amber-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gradient">花費明細</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 球票 */}
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <h3 className="text-sm font-bold text-shell-white mb-4 flex items-center gap-2">
                🎫 球票 <span className="text-ocean-wave">{TOTAL_TICKET_COST.toLocaleString()} 已花</span>
              </h3>
              <div className="space-y-2">
                {BOUGHT.map(s => (
                  <div key={s.id} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                    <span className="text-stone-gray">{s.date.slice(5)} {s.team}</span>
                    <span className="text-shell-white">¥{s.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-stone-gray/60">待購：明星賽・巨人・養樂多・中日・軟銀・歐力士×2（7場）</div>
            </div>

            {/* 交通 */}
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <h3 className="text-sm font-bold text-shell-white mb-4 flex items-center gap-2">
                🚌✈️ 交通 <span className="text-ocean-wave">{TOTAL_TRANSPORT_BOUGHT.toLocaleString()} 已花</span>
              </h3>
              <div className="space-y-1">
                {TRANSPORT_BOUGHT.map(t => (
                  <div key={t.name} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                    <span className="text-stone-gray">✅ {t.name}</span>
                    <span className="text-shell-white">¥{t.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-white/10 pt-3 space-y-1">
                {TRANSPORT_PENDING.map(t => (
                  <div key={t.name} className="flex justify-between text-xs">
                    <span className="text-amber-400/70">⏳ {t.name}</span>
                    <span className="text-amber-400/70">¥{t.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 住宿 */}
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <h3 className="text-sm font-bold text-shell-white mb-4 flex items-center gap-2">
                🏨 住宿 <span className="text-ocean-wave">{TOTAL_HOTEL.toLocaleString()} 已花</span>
              </h3>
              <div className="space-y-2">
                {HOTEL_BOOKED.map(h => (
                  <div key={h.name} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                    <span className="text-stone-gray">✅ {h.name}</span>
                    <span className="text-shell-white">¥{h.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-stone-gray/60">🛏️ 夜巴車上過夜：6/14・7/28-29・8/10-11 計4晚</div>
            </div>
          </div>

          {/* 總計卡 */}
          <div className="mt-6 ocean-card p-5 rounded-xl border border-ocean-wave/30 bg-gradient-to-r from-ocean-mid/30 to-ocean-deep/50 text-center">
            <p className="text-sm text-stone-gray mb-1">已花總計（球票+交通+住宿）</p>
            <p className="text-4xl font-bold text-gradient">¥{GRAND_TOTAL.toLocaleString()}</p>
            <p className="text-xs text-stone-gray/60 mt-2">+ 待購球票7張 + 待購交通 ¥14,900</p>
          </div>
        </motion.section>

        {/* 制霸路線各場 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
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
              <StadiumCard
                key={stadium.name}
                name={stadium.name}
                team={stadium.team}
                date={stadium.date}
                note={stadium.note}
                index={idx}
              />
            ))}
          </div>
        </motion.section>

        {/* 搶票日曆 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral to-red-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gradient">搶票日曆</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="ocean-card p-4 rounded-xl border border-red-500/30 bg-red-500/5">
              <p className="text-xs text-red-400 font-bold">🔥 6/3(水) 11:00</p>
              <p className="text-sm text-shell-white mt-1">中日龍 @ バンテリンドーム</p>
              <p className="text-xs text-stone-gray mt-1">後天！</p>
            </div>
            <div className="ocean-card p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <p className="text-xs text-sunray font-bold">6/7〜</p>
              <p className="text-sm text-shell-white mt-1">軟銀 @ PayPay巨蛋</p>
              <p className="text-xs text-stone-gray mt-1">6天後</p>
            </div>
            <div className="ocean-card p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <p className="text-xs text-sunray font-bold">6/19(金) 11:00</p>
              <p className="text-sm text-shell-white mt-1">養樂多 @ 神宮球場</p>
              <p className="text-xs text-stone-gray mt-1">18天後</p>
            </div>
            <div className="ocean-card p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <p className="text-xs text-sunray font-bold">6/20(土) 11:00</p>
              <p className="text-sm text-shell-white mt-1">巨人 @ 東京ドーム</p>
              <p className="text-xs text-stone-gray mt-1">19天後</p>
            </div>
            <div className="ocean-card p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <p className="text-xs text-sunray font-bold">7/22(水)</p>
              <p className="text-sm text-shell-white mt-1">歐力士×2：ほっと神戸+京セラD</p>
              <p className="text-xs text-stone-gray mt-1">51天後・一起搶</p>
            </div>
            <div className="ocean-card p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <p className="text-xs text-sunray font-bold">未定</p>
              <p className="text-sm text-shell-white mt-1">明星賽 @ 富山 抽選</p>
              <p className="text-xs text-stone-gray mt-1">待公佈</p>
            </div>
          </div>
        </motion.section>

        {/* 看球紀錄簿 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
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
                className="ocean-card group relative p-5 rounded-xl border border-ocean-wave/30 bg-ocean-mid/20 hover:border-ocean-wave/60 transition-all duration-300"
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
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
