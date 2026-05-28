'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Gamepad2, Globe, BarChart3, MapPin } from 'lucide-react'

const navLinks = [
  { href: '/', label: '戰績', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { href: '/games', label: '今日賽程', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
  { href: '/players', label: '旅外球員', icon: <Globe className="w-3.5 h-3.5" /> },
  { href: '/stadiums', label: '主場巡禮', icon: <MapPin className="w-3.5 h-3.5" /> },
]

export default function NavBar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* ── 桌面版 ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between rounded-2xl bg-ocean-deep/80 backdrop-blur-md border border-ocean-light/20 shadow-sm px-4 py-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-shell-white font-bold text-sm">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-ocean-wave to-emerald-400 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs">⚾</span>
              </span>
              <span className="hidden sm:inline text-stone-gray/80">世界野球</span>
            </Link>

            {/* 導覽連結 */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-ocean-wave/20 text-ocean-wave font-medium'
                        : 'text-stone-gray/50 hover:text-stone-gray/80 hover:bg-ocean-mid/30'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* 漢堡選單 — 手機版 */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1.5 rounded-lg text-stone-gray/50 hover:text-stone-gray/70 hover:bg-ocean-mid/30 transition-all"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── 手機版選單 ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-4 right-4 z-50 md:hidden"
          >
            <div className="rounded-2xl bg-ocean-deep/95 backdrop-blur-md border border-ocean-light/20 shadow-lg p-3">
              {navLinks.map(link => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'bg-ocean-wave/20 text-ocean-wave font-medium'
                        : 'text-stone-gray/50 hover:text-stone-gray/70 hover:bg-ocean-mid/30'
                    }`}
                  >
                    <span className={`${isActive ? 'text-ocean-wave' : 'text-stone-gray/40'}`}>{link.icon}</span>
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 內容偏移 ── */}
      <div className="h-16" />
    </>
  )
}
