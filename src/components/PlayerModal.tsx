export interface Player {
  player_id: string
  name_zh: string
  name_en: string
  league: string
  organization: string
  team_name: string
  current_level: string
  roster_status: string
  position: string
  bats_throws: string
  confidence?: string
}

export interface NewsItem {
  id: number
  player_id: string
  title: string
  url: string
  source: string
  published_at: string
  summary: string
}

interface PlayerModalProps {
  player: Player
  news: NewsItem[]
  newsLoading: boolean
  onClose: () => void
}

function getLevelColor(level: string): string {
  if (level === 'MLB' || level === '1軍' || level === '一軍') return 'bg-emerald-500/20 text-emerald-400'
  if (level === '3A' || level.includes('2軍') || level.includes('二軍')) return 'bg-blue-500/20 text-blue-400'
  if (level === '2A') return 'bg-violet-500/20 text-violet-400'
  if (level === 'High-A') return 'bg-amber-500/20 text-amber-400'
  if (level === 'Low-A') return 'bg-stone-500/20 text-stone-gray'
  return 'bg-ocean-light/20 text-stone-gray'
}

export default function PlayerModal({ player, news, newsLoading, onClose }: PlayerModalProps) {
  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6"
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-ocean-light/20 bg-ocean-abyss shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-ocean-light/20 bg-ocean-mid/60 p-2 text-stone-gray transition-colors hover:text-shell-white"
          aria-label="關閉球員詳情"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 md:p-8">
          {/* Player header */}
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-wave to-emerald-400 text-3xl font-bold text-white shadow-lg shadow-ocean-wave/20">
              {player.name_zh[0]}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-bold text-shell-white">{player.name_zh}</h2>
                <span className="text-sm text-stone-gray/50">{player.name_en}</span>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-ocean-light/15 px-3 py-1 text-xs text-ocean-foam">{player.league}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${getLevelColor(player.current_level)}`}>{player.current_level}</span>
                <span className="rounded-full bg-ocean-light/15 px-3 py-1 text-xs text-stone-gray/70">{player.roster_status}</span>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              { label: '守備位置', value: player.position || '-' },
              { label: '投打習慣', value: player.bats_throws || '-' },
              { label: '所屬聯盟', value: player.league || '-' },
              { label: '所屬球隊', value: player.team_name || player.organization || '-' },
              { label: '球團組織', value: player.organization || '-' },
              { label: '當前層級', value: player.current_level || '-' },
              { label: '狀態', value: player.roster_status || '-' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-ocean-light/10 bg-ocean-mid/10 p-4">
                <p className="text-[11px] uppercase tracking-wider text-stone-gray/40">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-shell-white">{item.value}</p>
              </div>
            ))}
          </div>

          {/* News section */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-bold text-shell-white">相關新聞</h3>
              {newsLoading && (
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-ocean-wave border-t-transparent" />
              )}
            </div>

            {!newsLoading && news.length === 0 && (
              <div className="rounded-xl border border-ocean-light/10 bg-ocean-mid/10 p-5 text-center">
                <p className="text-sm text-stone-gray/50">目前尚無相關新聞</p>
              </div>
            )}

            {!newsLoading && news.length > 0 && (
              <div className="space-y-2">
                {news.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-ocean-light/10 bg-ocean-mid/10 p-4 transition-all hover:border-ocean-wave/30"
                  >
                    <p className="line-clamp-2 text-sm text-shell-white transition-colors hover:text-ocean-wave">{item.title}</p>
                    {item.summary && (
                      <p className="mt-1 line-clamp-2 text-xs text-stone-gray/50">{item.summary}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[10px] text-stone-gray/40">{item.source}</span>
                      <span className="text-[10px] text-stone-gray/30">
                        {String(item.published_at || '').slice(0, 10) || 'N/A'}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
