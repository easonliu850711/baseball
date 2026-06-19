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

  if (loading) {
    return (
      <section className="mb-5 border-y border-white/[0.06] py-3">
        <div className="h-4 w-20 bg-ocean-mid/20 rounded animate-pulse mb-3" />
        <div className="h-5 w-full bg-ocean-mid/20 rounded animate-pulse" />
      </section>
    )
  }

  if (items.length > 0) {
    return (
      <section className="mb-5 border-y border-white/[0.06] py-3">
        <div className="text-[11px] uppercase tracking-wider text-stone-gray/45 mb-2">今日焦點</div>
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 min-w-0 border-l-2 border-ocean-wave/40 pl-3">
              <span className="text-[13px] text-shell-white leading-snug truncate">{item.title}</span>
              <span className="ml-auto shrink-0 text-[10px] text-stone-gray/45">
                {[item.source, item.published_at ? formatRelativeTime(item.published_at) : null].filter(Boolean).join(' · ')}
              </span>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (facts?.players || facts?.snapshot) {
    return (
      <section className="mb-5 border-y border-white/[0.06] py-3">
        <div className="text-[11px] uppercase tracking-wider text-stone-gray/45 mb-2">今日焦點</div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-stone-gray/65">
          {facts.players && <span>旅外球員 {facts.players} 人</span>}
          <span>CPBL · NPB · MLB · KBO</span>
          {facts.snapshot && <span>Snapshot {facts.snapshot}</span>}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-5 border-y border-white/[0.06] py-3 text-[12px] text-stone-gray/50">
      資料同步中
    </section>
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
