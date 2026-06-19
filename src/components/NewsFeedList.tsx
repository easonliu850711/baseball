'use client'

import { useEffect, useState } from 'react'
import { extractNews } from '@/lib/api-response'

interface NewsItem {
  id?: number | string
  title: string
  source?: string
  url?: string
  published_at?: string
}

export default function NewsFeedList() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch('/api/news?limit=3', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(payload => {
        if (!alive) return
        const news = extractNews(payload)
        setItems(news.slice(0, 3).map((n: any) => ({
          id: n.id,
          title: String(n.title || n.headline || 'Untitled'),
          source: n.source,
          url: n.url,
          published_at: n.published_at,
        })))
      })
      .catch(() => setItems([]))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  if (loading) {
    return (
      <section>
        <div className="text-[11px] uppercase tracking-wider text-stone-gray/45 mb-3">News</div>
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-6 bg-ocean-mid/20 rounded animate-pulse" />)}</div>
      </section>
    )
  }

  return (
    <section>
      <div className="text-[11px] uppercase tracking-wider text-stone-gray/45 mb-3">News</div>
      {items.length === 0 ? (
        <div className="border-y border-white/[0.06] py-6 text-center text-[12px] text-stone-gray/50">新聞資料同步中</div>
      ) : (
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={item.id || i} className="flex items-start gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
              <span className="text-ocean-wave/70 text-[10px] mt-1 shrink-0">▸</span>
              <div className="min-w-0">
                <div className="text-[13px] text-shell-white leading-snug truncate max-w-full">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-ocean-wave transition-colors">
                      {item.title}
                    </a>
                  ) : item.title}
                </div>
                <div className="text-[10px] text-stone-gray/45 mt-0.5">
                  {[item.source, item.published_at ? formatRelativeTime(item.published_at) : null].filter(Boolean).join(' · ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  const diffH = Math.floor((Date.now() - d.getTime()) / 3600000)
  if (diffH < 1) return 'just now'
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  return diffD === 1 ? 'yesterday' : `${diffD}d ago`
}
