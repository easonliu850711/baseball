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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-ocean-abyss">
        <div className="mx-auto flex h-[68px] max-w-5xl flex-col justify-center px-4">
          {/* Row 1: Site name */}
          <div className="flex items-center">
            <Link href="/" className="text-[15px] font-bold tracking-wide text-shell-white hover:text-ocean-wave transition-colors">
              台灣旅外球員情報中樞
            </Link>
          </div>

          {/* Row 2: Navigation links */}
          <div className="flex items-center gap-6 -ml-0.5">
            {navLinks.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'text-[12px] font-medium tracking-wide transition-colors py-0.5',
                    isActive
                      ? 'text-shell-white border-b border-ocean-wave'
                      : 'text-stone-gray/60 hover:text-shell-white border-b border-transparent'
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
      <div className="h-[68px]" />
    </>
  )
}
