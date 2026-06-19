'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Home', kind: 'route' },
  { href: '/#standings', label: 'Standings', kind: 'anchor' },
  { href: '/games', label: 'Games', kind: 'route' },
  { href: '/players', label: 'Players', kind: 'route' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="group flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-sm text-white shadow-sm">
              ⚾
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold tracking-tight text-slate-950">
                伊森の国際野球航路
              </span>
              <span className="hidden text-[10px] uppercase tracking-[0.22em] text-slate-400 sm:block">
                Studio Imori Baseball
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
            {navLinks.map(link => {
              const isActive = link.kind === 'route' && pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors',
                    isActive
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-white hover:text-slate-900'
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
      <div className="h-14" />
    </>
  )
}
