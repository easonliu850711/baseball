'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: '首頁' },
  { href: '/standings', label: '戰績' },
  { href: '/games', label: '賽程' },
  { href: '/players', label: '旅外球員' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ocean-abyss/90 shadow-ocean-deep backdrop-blur-xl">
        <div className="mx-auto flex min-h-[64px] max-w-6xl flex-col justify-center gap-2 px-4 py-3 sm:min-h-[60px] sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:py-0">
          <Link href="/" className="group min-w-0 leading-none transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-ocean-wave/30 bg-ocean-mid/60 text-[15px] shadow-ocean-subtle">
                ⚾
              </span>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-bold tracking-[0.04em] text-shell-white group-hover:text-ocean-foam sm:text-base">
                  伊森の国際野球航路
                </div>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-ocean-light/10 bg-ocean-deep/55 p-1 no-scrollbar sm:gap-1.5">
            {navLinks.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold tracking-wide transition-all sm:px-3.5',
                    isActive
                      ? 'bg-ocean-wave text-ocean-abyss shadow-sm'
                      : 'text-stone-gray/80 hover:bg-ocean-mid/70 hover:text-shell-white'
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
      <div className="h-[96px] sm:h-[60px]" />
    </>
  )
}
