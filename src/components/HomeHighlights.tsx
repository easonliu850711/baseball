'use client'

import { useEffect, useState } from 'react'

interface NewsItem {
  title: string
  source?: string
  published_at?: string
}

export default function HomeHighlights() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [label, setLabel] = useState('情報同步中')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const res = await fetch('/api/news?limit=2', { cache: 'no-store' })
        if (!res.ok) {
          if (alive) {
            setItems([])
            setLabel('情報同步中')
            setLoading(false)
          }
          return
        }
        const payload = await res.json()
        if (!alive) return

        // Extract news from wrapped response or direct
        const data = payload?.data || payload
        const newsList: NewsItem[] = data?.news || data?.items || data || []
        const slice = Array.isArray(newsList) ? newsList.slice(0, 2) : []

        if (slice.length === 0) {
          setItems([])
          setLabel('情報同步中')
        } else {
          const today = new Date().toISOString().slice(0, 10)
          const hasToday = slice.some((n) => {
            const pubDate = String(n.published_at || '').slice(0, 10)
            return pubDate === today
          })
          setLabel(hasToday ? '今日焦點' : '最新情報')
          setItems(slice.map((n: any) => ({
            title: String(n.title || n.headline || 'Untitled'),
            source: n.source,
            published_at: n.published_at,
          })))
        }
      } catch {
        if (alive) {
          setItems([])
          setLabel('情報同步中')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  return (
    <aside className="rounded-2xl border border-ocean-light/10 bg-ocean-deep/50 p-5">
      <div className="mb-3">
        <h2 className="text-sm font-bold tracking-wide text-shell-white">{label}</h2>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-4 rounded bg-ocean-mid/30 animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-ocean-mid/30 animate-pulse" />
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-ocean-light/10 bg-ocean-mid/30 px-3 py-2">
              <div className="line-clamp-2 text-sm font-medium leading-5 text-shell-white">{item.title}</div>
              <div className="mt-1 text-[11px] text-stone-gray/50">
                {[item.source, item.published_at ? formatRelativeTime(item.published_at) : null].filter(Boolean).join(' · ')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-ocean-light/10 bg-ocean-mid/20 py-6 text-center">
          <p className="text-sm text-stone-gray/50">情報同步中</p>
          <p className="mt-1 text-[11px] text-stone-gray/40">即將為您帶來最新消息</p>
        </div>
      )}
    </aside>
  )
}

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  const diffH = Math.floor((Date.now() - d.getTime()) / 3600000)
  if (diffH < 1) return '剛剛'
  if (diffH < 24) return `${diffH}小時前`
  return `${Math.floor(diffH / 24)}天前`
}
