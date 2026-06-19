'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/standings', label: 'Standings' },
  { href: '/games', label: 'Games' },
  { href: '/players', label: 'Players' },
  { href: '/stadiums', label: 'Stadiums' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ocean-abyss border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          {/* First row: site name */}
          <div className="flex items-center h-9">
            <Link href="/" className="text-[13px] text-shell-white font-medium tracking-wide">
              伊森の国際野球航路
            </Link>
          </div>
          {/* Second row: league tabs style nav */}
          <div className="flex items-center h-8 gap-0">
            {navLinks.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-3 py-1 text-[12px] transition-colors
                    ${isActive
                      ? 'text-shell-white border-b-[2px] border-ocean-wave -mb-[1px]'
                      : 'text-stone-gray/50 hover:text-stone-gray/70'
                    }
                  `}
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
