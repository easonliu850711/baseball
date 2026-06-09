'use client'

import { Trophy, MapPin, Calendar, Clock, DollarSign, Star, Bus, Plane, Train, Bed, X, Target, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import StadiumCard from '../components/StadiumCard'

// 🎯 2026 NPB 14場巡禮完整清單（依實際日期排序，含已完賽）
const STADIUM_TOUR = [
  {
    id: 1, name: '横浜スタジアム', team: 'DeNA', opponent: '軟銀', date: '2026-06-07', week: '日',
    watched: true, bought: true, price: 10450,
    transport: '🚃 電車 ¥155 ✅ 已購',
    hotel: '—',
    note: '突然決定的初戰！橫濱在地應援',
    color: 'from-blue-500 to-cyan-600',
    detail: {
      ticketType: '内野指定席',
      seat: '—',
      score: '—',
      highlight: '已看但不記得了，請 Imori 之後補上 😅',
      food: '—',
      souvenir: '—',
      weather: '—',
      mood: '🎉',
    }
  },
  {
    id: 2, name: 'ES CON FIELD 北海道', team: '日本火腿', opponent: '中日龍', date: '2026-06-12', week: '金',
    watched: false, bought: true, price: 7313,
    transport: '✈️ Peach ¥10,250 ✅ 已購（06:50→08:40）',
    hotel: '🏨 レンブラントスタイル札幌 ✅ 已訂',
    note: '北海道遠征開幕 🔥 後天出發！',
    color: 'from-sky-400 to-blue-600',
    detail: null,
  },
  {
    id: 3, name: '楽天モバイルパーク', team: '樂天金鷹', opponent: '廣島鯉魚', date: '2026-06-14', week: '日',
    watched: false, bought: true, price: 7165,
    transport: '✈️ Peach ¥7,390 ✅ 已購（札幌→仙台）+ 🚌 夜巴 ¥5,340 ✅ 已購（仙台→横浜）',
    hotel: '🏨 バリュー・ザ・ホテル仙台名取 ¥7,200 ✅ 已訂（6/13住宿）',
    note: '東西縱走！北海道→東北→關東',
    color: 'from-red-500 to-rose-700',
    detail: null,
  },
  {
    id: 4, name: 'ZOZOマリンスタジアム', team: '羅德海洋', opponent: '樂天', date: '2026-06-21', week: '日',
    watched: false, bought: true, price: 7020,
    transport: '🚃 電車來回 ¥2,660 待購',
    hotel: '—（當天來回）',
    note: '千葉海邊的棒球 × 炸雞啤酒 🍗🍺',
    color: 'from-black to-gray-800',
    detail: null,
  },
  {
    id: 5, name: 'ベルーナドーム', team: '西武獅', opponent: '日本火腿', date: '2026-06-28', week: '日',
    watched: false, bought: true, price: 6040,
    transport: '🚃 電車來回 ¥2,274 待購',
    hotel: '—（當天來回）',
    note: '黃金週場勘後的正式巡禮 ✅',
    color: 'from-emerald-500 to-green-700',
    detail: null,
  },
  {
    id: 6, name: '富山市民球場', team: '明星賽 ⭐', opponent: '—', date: '2026-07-29', week: '水',
    watched: false, bought: false, price: 0,
    transport: '🚌 夜巴來回 ¥12,200 ✅ 已購',
    hotel: '🚌 夜巴車上（不住宿）',
    note: 'オールスター！夜巴來回已買，球票待購',
    color: 'from-yellow-400 to-amber-600',
    detail: null,
  },
  {
    id: 7, name: '東京ドーム', team: '讀賣巨人', opponent: '横浜DeNA', date: '2026-08-02', week: '日',
    watched: false, bought: false, price: 6200,
    transport: '🚃 電車來回 ¥1,414 待購',
    hotel: '—（當天來回）',
    note: '6/20(土) 11:00 搶票 🔥',
    color: 'from-orange-400 to-red-600',
    detail: null,
  },
  {
    id: 8, name: '神宮球場', team: '養樂多燕子', opponent: '阪神虎', date: '2026-08-02', week: '日',
    watched: false, bought: false, price: 3900,
    transport: '🚃 電車來回 ¥1,582 待購',
    hotel: '—（當天來回）',
    note: '6/19(金) 11:00 搶票 🔥 同一天雙重賽',
    color: 'from-green-400 to-emerald-600',
    detail: null,
  },
  {
    id: 9, name: 'バンテリンドーム', team: '中日龍', opponent: '横浜DeNA', date: '2026-08-11', week: '火',
    watched: false, bought: true, price: 5585,
    transport: '🚌 夜巴來回 ¥11,500 ✅ 已購',
    hotel: '🚌 夜巴車上（不住宿）',
    note: '夜巴+球票全部已買 ✅',
    color: 'from-blue-400 to-indigo-600',
    detail: null,
  },
  {
    id: 10, name: 'MAZDA Zoom-Zoom', team: '廣島鯉魚', opponent: '巨人', date: '2026-09-05', week: '土',
    watched: false, bought: true, price: 3520,
    transport: '✈️ 東京→廣島 ¥6,313 待購',
    hotel: '🏨 ¥6,520 待訂',
    note: '廣島名物・牡蠣と野球！🦪',
    color: 'from-red-400 to-rose-600',
    detail: null,
  },
  {
    id: 11, name: 'みずほPayPay', team: '軟銀鷹', opponent: '—', date: '2026-09-06', week: '日',
    watched: false, bought: false, price: 5400,
    transport: '🚄 新幹線 広島→福岡 ¥8,900 待購 + ✈️ Peach 福岡→成田 ¥10,890 ✅ 已購',
    hotel: '—（看完球搭夜Peach回東京）',
    note: '廣島→福岡→東京 奔波日',
    color: 'from-yellow-400 to-amber-600',
    detail: null,
  },
  {
    id: 12, name: '甲子園球場', team: '阪神虎', opponent: '廣島鯉魚', date: '2026-09-09', week: '水',
    watched: false, bought: true, price: 9986,
    transport: '🚃 ¥740（出差公司出）',
    hotel: '🏨 出差公司出',
    note: '聖地再臨！阪神×廣島 🐯',
    color: 'from-yellow-500 to-amber-700',
    detail: null,
  },
  {
    id: 13, name: 'ほっと神戸', team: '歐力士猛牛', opponent: '西武獅', date: '2026-09-10', week: '木',
    watched: false, bought: false, price: 2800,
    transport: '🚃 ¥870（出差公司出）',
    hotel: '🏨 出差公司出',
    note: '7/22(水) 京セラD一起搶 🔥 關西出差第2站',
    color: 'from-amber-500 to-orange-700',
    detail: null,
  },
  {
    id: 14, name: '京セラドーム大阪', team: '歐力士猛牛', opponent: '樂天金鷹', date: '2026-09-12', week: '土',
    watched: false, bought: false, price: 3700,
    transport: '🚃 ¥440（出差公司出）',
    hotel: '🏨 出差公司出',
    note: '7/22(水) 一起搶！巡禮最終站 🏁',
    color: 'from-amber-500 to-orange-700',
    detail: null,
  },
]

// 計算
const WATCHED = STADIUM_TOUR.filter(s => s.watched)
const BOUGHT = STADIUM_TOUR.filter(s => s.bought && !s.watched)
const NOT_BOUGHT = STADIUM_TOUR.filter(s => !s.bought && !s.watched)
const TOTAL_TICKET_COST = STADIUM_TOUR.filter(s => s.bought).reduce((sum, s) => sum + s.price, 0)

// 交通已購
const TRANSPORT_BOUGHT = [
  { name: '6/7 横浜 🚃', price: 155 },
  { name: '6/12 Peach 東京→札幌 ✈️', price: 10250 },
  { name: '6/13 Peach 札幌→仙台 ✈️', price: 7390 },
  { name: '6/14 夜巴 仙台→横浜 🚌', price: 5340 },
  { name: '7/29 夜巴來回 富山 🚌', price: 12200 },
  { name: '8/11 夜巴來回 名古屋 🚌', price: 11500 },
  { name: '9/6 Peach 福岡→成田 ✈️', price: 10890 },
]
const TRANSPORT_PENDING = [
  { name: '7站電車代（羅德/西武/巨人/神宮/廣島/福岡/横浜etc）', price: 14900 },
]

// 住宿已訂
const HOTEL_BOOKED = [
  { name: '6/12 レンブラントスタイル札幌', price: 11400 },
  { name: '6/13 バリュー・ザ・ホテル仙台名取', price: 7200 },
  { name: '9/5 廣島住宿', price: 6520 },
]

const TOTAL_TRANSPORT_BOUGHT = TRANSPORT_BOUGHT.reduce((s, t) => s + t.price, 0)
const TOTAL_TRANSPORT_PENDING = TRANSPORT_PENDING.reduce((s, t) => s + t.price, 0)
const TOTAL_HOTEL = HOTEL_BOOKED.reduce((s, h) => s + h.price, 0)
const GRAND_TOTAL = TOTAL_TICKET_COST + TOTAL_TRANSPORT_BOUGHT + TOTAL_HOTEL

export default function WatchRecords() {
  const totalGames = STADIUM_TOUR.length
  const totalWatched = WATCHED.length

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
            從6/7横浜到9/12京セラD — 這趟旅程的棒球足跡
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
              <p className="text-3xl font-bold text-emerald-400">{totalWatched}</p>
              <p className="text-xs text-stone-gray mt-1">已完賽 ✅</p>
            </div>
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 text-center">
              <p className="text-3xl font-bold text-sunray">{14 - totalWatched}</p>
              <p className="text-xs text-stone-gray mt-1">待完成</p>
            </div>
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20 text-center">
              <p className="text-3xl font-bold text-coral-light">¥{GRAND_TOTAL.toLocaleString()}</p>
              <p className="text-xs text-stone-gray mt-1">已花費</p>
            </div>
          </div>

          {/* 進度條 */}
          <div className="mt-6 ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
            <div className="flex justify-between text-xs text-stone-gray mb-2">
              <span>制霸進度</span>
              <span>{totalWatched}/{totalGames}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-ocean-mid/40 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(totalWatched / totalGames) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-ocean-wave to-coral"
              />
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
                🎫 球票 <span className="text-ocean-wave">¥{TOTAL_TICKET_COST.toLocaleString()}</span>
              </h3>
              <div className="space-y-2">
                {STADIUM_TOUR.filter(s => s.bought).map(s => (
                  <div key={s.id} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                    <span className="text-stone-gray">{s.date.slice(5)} {s.team}{s.watched ? ' ✅' : ''}</span>
                    <span className="text-shell-white">¥{s.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-stone-gray/60">
                待購：明星賽¥8,800・巨人¥6,200・養樂多¥3,900・軟銀¥5,400・歐力士×2 ¥6,500（6場）
              </div>
            </div>

            {/* 交通 */}
            <div className="ocean-card p-5 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <h3 className="text-sm font-bold text-shell-white mb-4 flex items-center gap-2">
                🚌✈️ 交通 <span className="text-ocean-wave">¥{TOTAL_TRANSPORT_BOUGHT.toLocaleString()}</span>
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
                🏨 住宿 <span className="text-ocean-wave">¥{TOTAL_HOTEL.toLocaleString()}</span>
              </h3>
              <div className="space-y-2">
                {HOTEL_BOOKED.map(h => (
                  <div key={h.name} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                    <span className="text-stone-gray">✅ {h.name}</span>
                    <span className="text-shell-white">¥{h.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-stone-gray/60">
                🛏️ 夜巴車上過夜：6/14・7/29・8/11 計3晚<br />
                🧳 出差公司出：9/9-9/12 關西4晚
              </div>
            </div>
          </div>

          {/* 總計卡 */}
          <div className="mt-6 ocean-card p-5 rounded-xl border border-ocean-wave/30 bg-gradient-to-r from-ocean-mid/30 to-ocean-deep/50 text-center">
            <p className="text-sm text-stone-gray mb-1">已花總計（球票+交通+住宿）</p>
            <p className="text-4xl font-bold text-gradient">¥{GRAND_TOTAL.toLocaleString()}</p>
            <p className="text-xs text-stone-gray/60 mt-2">+ 待購球票6張約¥30,600 + 待購交通約¥14,900</p>
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
            <span className="text-xs text-stone-gray/50">點擊卡片看詳細內容</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STADIUM_TOUR.map((stadium, idx) => (
              <StadiumCard
                key={stadium.date + stadium.name}
                name={stadium.name}
                team={stadium.team}
                opponent={stadium.opponent}
                date={stadium.date}
                week={stadium.week}
                note={stadium.note}
                watched={stadium.watched}
                bought={stadium.bought}
                price={stadium.price}
                transport={stadium.transport}
                hotel={stadium.hotel}
                detail={stadium.detail}
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
              <p className="text-xs text-red-400 font-bold">🔥 6/19(金) 11:00</p>
              <p className="text-sm text-shell-white mt-1">養樂多 @ 神宮球場</p>
              <p className="text-xs text-stone-gray mt-1">10天後！</p>
            </div>
            <div className="ocean-card p-4 rounded-xl border border-red-500/30 bg-red-500/5">
              <p className="text-xs text-red-400 font-bold">🔥 6/20(土) 11:00</p>
              <p className="text-sm text-shell-white mt-1">巨人 @ 東京ドーム</p>
              <p className="text-xs text-stone-gray mt-1">11天後！</p>
            </div>
            <div className="ocean-card p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <p className="text-xs text-sunray font-bold">7/22(水)</p>
              <p className="text-sm text-shell-white mt-1">歐力士×2：ほっと神戸+京セラD</p>
              <p className="text-xs text-stone-gray mt-1">43天後・一起搶 🔥</p>
            </div>
            <div className="ocean-card p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <p className="text-xs text-sunray font-bold">未定</p>
              <p className="text-sm text-shell-white mt-1">明星賽 @ 富山 球票</p>
              <p className="text-xs text-stone-gray mt-1">夜巴已買 ✅</p>
            </div>
            <div className="ocean-card p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <p className="text-xs text-sunray font-bold">未定</p>
              <p className="text-sm text-shell-white mt-1">軟銀 @ PayPay巨蛋</p>
              <p className="text-xs text-stone-gray mt-1">球票待購</p>
            </div>
            <div className="ocean-card p-4 rounded-xl border border-ocean-light/20 bg-ocean-mid/20">
              <p className="text-xs text-emerald-400 font-bold">✅ 已買</p>
              <p className="text-sm text-shell-white mt-1">6/7 横浜・6/12 ES CON</p>
              <p className="text-xs text-stone-gray mt-1">等 6/14 楽天モバイル</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
