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
    fetch('/api/news?limit=4', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(payload => {
        if (!alive) return
        const news = extractNews(payload)
        setItems(news.slice(0, 4).map((n: any) => ({
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

  return (
    <section className="rounded-2xl border border-ocean-light/10 bg-ocean-deep/50 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold tracking-wide text-shell-white">情報更新</h2>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-12 rounded-xl bg-ocean-mid/30 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ocean-light/10 bg-ocean-mid/20 py-8 text-center">
          <div className="text-sm font-medium text-stone-gray/50">新聞資料同步中</div>
        </div>
      ) : (
        <div className="divide-y divide-ocean-light/10">
          {items.map((item, i) => (
            <div key={item.id || i} className="py-3">
              <div className="line-clamp-2 text-sm font-semibold leading-5 text-shell-white">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-ocean-wave">
                    {item.title}
                  </a>
                ) : item.title}
              </div>
              <div className="mt-1 text-[11px] text-stone-gray/50">
                {[item.source, item.published_at ? formatRelativeTime(item.published_at) : null].filter(Boolean).join(' · ')}
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
  if (diffH < 1) return '剛剛'
  if (diffH < 24) return `${diffH}小時前`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}天前`
}
