'use client'

import { motion } from 'framer-motion'
import { MapPin, Calendar, Heart } from 'lucide-react'

interface StadiumCardProps {
  name: string
  team: string
  date: string
  note: string
  image?: string
  index: number
}

export default function StadiumCard({ name, team, date, note, image, index }: StadiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="group relative overflow-hidden rounded-xl border border-ocean-light/20 bg-ocean-mid/20 p-5 transition-all duration-300 hover:border-ocean-wave/40 hover:bg-white/[0.08]"
    >
      {/* 裝飾光暈 */}
      <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-ocean-mid/20 blur-xl group-hover:bg-ocean-mid/30 transition-all duration-500" />

      <div className="relative">
        {/* 日期徽章 */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-ocean-mid/20 text-stone-gray">
            <Calendar className="w-3 h-3" />
            {date}
          </span>
          <Heart className="w-4 h-4 text-coral/60 group-hover:text-coral transition-colors duration-300" />
        </div>

        {/* 球場名稱 */}
        <h3 className="text-base font-bold mb-1 group-hover:text-ocean-wave transition-colors duration-300">
          {name}
        </h3>
        <p className="text-sm text-stone-gray flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-ocean-wave/60" />
          {team}
        </p>

        {/* 溫暖備註 */}
        <p className="mt-3 text-xs leading-relaxed text-stone-gray/80 border-t border-white/5 pt-3">
          {note}
        </p>
      </div>
    </motion.div>
  )
}
