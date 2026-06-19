'use client'

export type LeagueType = 'npb' | 'cpbl' | 'mlb' | 'kbo'

const LEAGUES: { key: LeagueType; label: string; sub: string }[] = [
  { key: 'npb', label: 'NPB', sub: 'Japan' },
  { key: 'cpbl', label: 'CPBL', sub: 'Taiwan' },
  { key: 'mlb', label: 'MLB', sub: 'USA' },
  { key: 'kbo', label: 'KBO', sub: 'Korea' },
]

interface LeagueTabsProps {
  active: LeagueType
  onChange: (league: LeagueType) => void
}

export default function LeagueTabs({ active, onChange }: LeagueTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {LEAGUES.map(lg => {
        const isActive = active === lg.key
        return (
          <button
            key={lg.key}
            onClick={() => onChange(lg.key)}
            className={[
              'min-w-[86px] rounded-2xl border px-3 py-2 text-left transition-all',
              isActive
                ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-950'
            ].join(' ')}
          >
            <span className="block text-[13px] font-semibold leading-none">{lg.label}</span>
            <span className={['mt-1 block text-[10px] leading-none', isActive ? 'text-white/55' : 'text-slate-400'].join(' ')}>
              {lg.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}
