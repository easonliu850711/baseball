'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Heart, CheckCircle, Clock, DollarSign, X, Bus, Plane, Train, Bed, Star, Ticket } from 'lucide-react'
import { useState } from 'react'

interface StadiumDetail {
  ticketType?: string
  seat?: string
  score?: string
  highlight: string
  food?: string
  souvenir?: string
  weather?: string
  mood: string
}

interface StadiumCardProps {
  name: string
  team: string
  opponent: string
  date: string
  week: string
  note: string
  watched: boolean
  bought: boolean
  price: number
  transport: string
  hotel: string
  detail: StadiumDetail | null
  image?: string
  index: number
}

export default function StadiumCard({ name, team, opponent, date, week, note, watched, bought, price, transport, hotel, detail, image, index }: StadiumCardProps) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 * index }}
        whileHover={{ scale: 1.03, y: -4 }}
        onClick={() => setShowDetail(true)}
        className="group relative overflow-hidden rounded-xl border border-ocean-light/20 bg-ocean-mid/20 p-5 transition-all duration-300 hover:border-ocean-wave/40 hover:bg-white/[0.08] cursor-pointer"
      >
        {/* 裝飾光暈 */}
        <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-ocean-mid/20 blur-xl group-hover:bg-ocean-mid/30 transition-all duration-500" />

        {/* 已完賽徽章 */}
        {watched && (
          <div className="absolute top-0 right-0">
            <div className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> 已完賽
            </div>
          </div>
        )}

        <div className="relative">
          {/* 日期徽章 */}
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${watched ? 'bg-emerald-500/20 text-emerald-300' : 'bg-ocean-mid/20 text-stone-gray'}`}>
              <Calendar className="w-3 h-3" />
              {date}（{week}）
            </span>
            <span className="text-lg">{watched ? '✅' : bought ? '🎫' : '⏳'}</span>
          </div>

          {/* 球場名稱 */}
          <h3 className="text-base font-bold mb-1 group-hover:text-ocean-wave transition-colors duration-300">
            {name}
          </h3>
          <p className="text-sm text-stone-gray flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-ocean-wave/60" />
            {team}{opponent ? ` vs ${opponent}` : ''}
          </p>

          {/* 價格 & 購票狀態 */}
          <div className="flex items-center gap-3 mt-2 text-xs">
            {bought && (
              <span className="flex items-center gap-1 text-emerald-400/80">
                <Ticket className="w-3 h-3" /> ¥{price.toLocaleString()}
              </span>
            )}
            {!bought && (
              <span className="flex items-center gap-1 text-amber-400/80">
                <Clock className="w-3 h-3" /> 待購
              </span>
            )}
          </div>

          {/* 溫暖備註 */}
          <p className="mt-3 text-xs leading-relaxed text-stone-gray/80 border-t border-white/5 pt-3">
            {note}
          </p>

          {/* 點擊提示 */}
          <div className="mt-2 flex items-center gap-1 text-[10px] text-ocean-wave/40 group-hover:text-ocean-wave/60 transition-colors">
            點擊查看詳細 <span className="text-xs">→</span>
          </div>
        </div>
      </motion.div>

      {/* 彈出視窗 */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-ocean-light/20 bg-ocean-deep p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* 關閉按鈕 */}
              <button
                onClick={() => setShowDetail(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ocean-mid/30 flex items-center justify-center hover:bg-ocean-mid/60 transition-colors"
              >
                <X className="w-4 h-4 text-stone-gray" />
              </button>

              {/* 標題區 */}
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ocean-wave to-ocean-surface flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-shell-white">{name}</h3>
                  <p className="text-sm text-stone-gray">{team} vs {opponent}</p>
                  <p className="text-xs text-stone-gray/60 mt-1">{date}（{week}）</p>
                </div>
                {/* 狀態徽章 */}
                <div className="ml-auto">
                  {watched ? (
                    <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3" /> 已完賽
                    </span>
                  ) : bought ? (
                    <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                      <Ticket className="w-3 h-3" /> 已購
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      <Clock className="w-3 h-3" /> 待購
                    </span>
                  )}
                </div>
              </div>

              {/* 資訊區塊 */}
              <div className="space-y-3">
                {/* 球票資訊 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-ocean-mid/20 border border-ocean-light/10">
                  <Ticket className="w-4 h-4 text-ocean-wave mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-gray/60">球票</p>
                    {bought ? (
                      <p className="text-sm text-shell-white font-medium">¥{price.toLocaleString()} ✅</p>
                    ) : (
                      <p className="text-sm text-amber-300 font-medium">¥{price.toLocaleString()} ⏳ 待購</p>
                    )}
                    {detail?.ticketType && <p className="text-xs text-stone-gray/60 mt-0.5">{detail.ticketType}</p>}
                    {detail?.seat && <p className="text-xs text-stone-gray/60">{detail.seat}</p>}
                  </div>
                </div>

                {/* 交通資訊 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-ocean-mid/20 border border-ocean-light/10">
                  {transport.includes('✈️') ? <Plane className="w-4 h-4 text-ocean-wave mt-0.5" /> :
                   transport.includes('🚌') ? <Bus className="w-4 h-4 text-ocean-wave mt-0.5" /> :
                   transport.includes('🚄') ? <Train className="w-4 h-4 text-ocean-wave mt-0.5" /> :
                   <Train className="w-4 h-4 text-ocean-wave mt-0.5" />}
                  <div>
                    <p className="text-xs text-stone-gray/60">交通</p>
                    <p className="text-sm text-shell-white">{transport.startsWith('✅') ? transport : transport || '-'}</p>
                  </div>
                </div>

                {/* 住宿資訊 */}
                {hotel && hotel !== '—' && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-ocean-mid/20 border border-ocean-light/10">
                    <Bed className="w-4 h-4 text-ocean-wave mt-0.5" />
                    <div>
                      <p className="text-xs text-stone-gray/60">住宿</p>
                      <p className="text-sm text-shell-white">{hotel}</p>
                    </div>
                  </div>
                )}

                {/* 如果是已完賽的比賽，顯示詳細紀錄 */}
                {watched && detail && (
                  <>
                    <div className="border-t border-white/10 pt-3 mt-3">
                      <p className="text-xs font-bold text-ocean-wave mb-3 flex items-center gap-2">
                        <Star className="w-3.5 h-3.5" /> 觀賽紀錄
                      </p>
                      <div className="space-y-2.5">
                        {detail.score && (
                          <div className="flex justify-between text-sm">
                            <span className="text-stone-gray/70">比數</span>
                            <span className="text-shell-white font-bold">{detail.score}</span>
                          </div>
                        )}
                        <div className="text-sm text-stone-gray/80 bg-ocean-mid/20 p-3 rounded-lg">
                          {detail.highlight}
                        </div>
                        {detail.food && detail.food !== '—' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-stone-gray/70">球場美食</span>
                            <span className="text-shell-white">{detail.food}</span>
                          </div>
                        )}
                        {detail.weather && detail.weather !== '—' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-stone-gray/70">天氣</span>
                            <span className="text-shell-white">{detail.weather}</span>
                          </div>
                        )}
                        {detail.mood && (
                          <div className="flex justify-between text-sm">
                            <span className="text-stone-gray/70">心情</span>
                            <span className="text-lg">{detail.mood}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* 備註 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-ocean-mid/10 border border-ocean-light/5">
                  <div>
                    <p className="text-xs text-stone-gray/60">備註</p>
                    <p className="text-sm text-stone-gray/80">{note}</p>
                  </div>
                </div>
              </div>

              {/* 底部編輯提示 */}
              {!watched && (
                <p className="mt-4 text-[10px] text-center text-stone-gray/40">
                  看球後點擊編輯，Imori 會幫你補上紀錄 🎉
                </p>
              )}
              {watched && !detail?.highlight.includes('請 Imori') && (
                <p className="mt-4 text-[10px] text-center text-stone-gray/40">
                  想修改紀錄可以告訴我 🌸
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
