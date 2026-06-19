'use client'

import { useEffect, useState } from 'react'
import { extractMeta, extractNews, extractPlayers } from '@/lib/api-response'

interface HighlightItem {
  title: string
  source?: string
  published_at?: string
}

export default function HomeHighlights() {
  const [items, setItems] = useState<HighlightItem[]>([])
  const [facts, setFacts] = useState<{ players?: number; snapshot?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const newsPayload = await fetch('/api/news?limit=2', { cache: 'no-store' }).then(r => r.ok ? r.json() : null)
        const news = extractNews(newsPayload).slice(0, 2)
        if (!alive) return

        if (news.length > 0) {
          setItems(news.map((n: any) => ({
            title: String(n.title || n.headline || 'Untitled'),
            source: n.source,
            published_at: n.published_at,
          })))
          setLoading(false)
          return
        }

        const [playersPayload, statusPayload] = await Promise.all([
          fetch('/api/players', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
          fetch('/api/status', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
        ])
        const players = extractPlayers(playersPayload)
        const statusData: any = statusPayload?.success ? statusPayload.data : statusPayload
        const meta = extractMeta(statusPayload)
        setFacts({
          players: players.length || statusData?.db?.players,
          snapshot: statusData?.latestSnapshot || meta.snapshot_date,
        })
      } catch {
        setFacts(null)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  return (
    <aside className="imori-card-soft p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="imori-section-title">Today</div>
          <h2 className="mt-1 text-lg">今日焦點</h2>
        </div>
        <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-semibold text-white">
          Live DB
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-4 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-white px-3 py-2">
              <div className="line-clamp-2 text-sm font-medium leading-5 text-slate-900">{item.title}</div>
              <div className="mt-1 text-[11px] text-slate-400">
                {[item.source, item.published_at ? formatRelativeTime(item.published_at) : null].filter(Boolean).join(' · ')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white px-3 py-3 text-center shadow-sm">
            <div className="text-2xl font-semibold text-slate-950">{facts?.players || 28}</div>
            <div className="mt-1 text-[11px] text-slate-400">旅外球員</div>
          </div>
          <div className="rounded-xl bg-white px-3 py-3 text-center shadow-sm">
            <div className="text-2xl font-semibold text-slate-950">4</div>
            <div className="mt-1 text-[11px] text-slate-400">追蹤聯盟</div>
          </div>
          <div className="col-span-2 rounded-xl bg-white px-3 py-3 text-[12px] text-slate-500 shadow-sm">
            {facts?.snapshot ? `Latest snapshot: ${facts.snapshot}` : '資料同步中'}
          </div>
        </div>
      )}
    </aside>
  )
}

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  const diffH = Math.floor((Date.now() - d.getTime()) / 3600000)
  if (diffH < 1) return 'just now'
  if (diffH < 24) return `${diffH}h ago`
  return `${Math.floor(diffH / 24)}d ago`
}
