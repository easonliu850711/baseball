'use client'

export type LeagueType = 'npb' | 'cpbl' | 'mlb' | 'kbo'

const LEAGUES: { key: LeagueType; label: string }[] = [
  { key: 'npb', label: 'NPB' },
  { key: 'cpbl', label: 'CPBL' },
  { key: 'mlb', label: 'MLB' },
  { key: 'kbo', label: 'KBO' },
]

interface LeagueTabsProps {
  active: LeagueType
  onChange: (league: LeagueType) => void
}

export default function LeagueTabs({ active, onChange }: LeagueTabsProps) {
  return (
    <div className="flex gap-0.5 overflow-x-auto no-scrollbar">
      {LEAGUES.map(lg => {
        const isActive = active === lg.key
        return (
          <button
            key={lg.key}
            onClick={() => onChange(lg.key)}
            className={`
              px-4 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap
              ${isActive
                ? 'text-shell-white border-b-2 border-ocean-wave'
                : 'text-stone-gray/50 hover:text-stone-gray/70 border-b-2 border-transparent'
              }
            `}
          >
            {lg.label}
          </button>
        )
      })}
    </div>
  )
}
