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
    <section className="imori-card p-5">
      <div className="mb-4">
        <div className="imori-section-title">News</div>
        <h2 className="mt-1 text-lg">情報更新</h2>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center">
          <div className="text-sm font-medium text-slate-600">新聞資料同步中</div>
          <div className="mt-1 text-[12px] text-slate-400">目前不使用假新聞填版</div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item, i) => (
            <div key={item.id || i} className="py-3">
              <div className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    {item.title}
                  </a>
                ) : item.title}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
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
  if (diffH < 1) return 'just now'
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  return diffD === 1 ? 'yesterday' : `${diffD}d ago`
}
