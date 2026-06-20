'use client'

export type LeagueType = 'npb' | 'cpbl' | 'mlb' | 'kbo'

const LEAGUES: { key: LeagueType; label: string; sub: string }[] = [
  { key: 'npb', label: 'NPB', sub: '日本職棒' },
  { key: 'cpbl', label: 'CPBL', sub: '中華職棒' },
  { key: 'mlb', label: 'MLB', sub: '美國職棒' },
  { key: 'kbo', label: 'KBO', sub: '韓國職棒' },
]

interface LeagueTabsProps {
  active: LeagueType
  onChange: (league: LeagueType) => void
}

export default function LeagueTabs({ active, onChange }: LeagueTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar rounded-2xl border border-ocean-light/10 bg-ocean-abyss/35 p-1.5">
      {LEAGUES.map(lg => {
        const isActive = active === lg.key
        return (
          <button
            key={lg.key}
            onClick={() => onChange(lg.key)}
            className={[
              'min-w-[92px] rounded-xl border px-3 py-2 text-left transition-all',
              isActive
                ? 'border-ocean-wave/45 bg-ocean-wave text-ocean-abyss shadow-ocean-glow'
                : 'border-transparent bg-ocean-mid/25 text-stone-gray/75 hover:border-ocean-light/20 hover:bg-ocean-mid/45 hover:text-shell-white'
            ].join(' ')}
          >
            <span className="block text-[13px] font-black leading-none tracking-wide">{lg.label}</span>
            <span className={['mt-1 block text-[10px] font-semibold tracking-[0.08em] leading-none', isActive ? 'text-ocean-abyss/65' : 'text-stone-gray/45'].join(' ')}>
              {lg.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}
