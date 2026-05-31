import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface NewsItem {
  player_id: string
  title: string
  url: string
  source: string
  published_at: string
  summary?: string
}

/** 將各種日期格式轉為 ISO string，無效則 fallback 到當前時間 */
function toIso(raw: string): string {
  const ts = Date.parse(raw)
  return Number.isNaN(ts) ? new Date().toISOString() : new Date(ts).toISOString()
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : ''

    const serverToken = String(process.env.SYNC_TOKEN || '').trim()

    if (!serverToken || token !== serverToken) {
      return Response.json(
        { success: false, error: 'Unauthorized', tokenConfigured: Boolean(serverToken) },
        { status: 401 }
      )
    }

    const body = await request.json()

    // ── 確保資料表存在（含 UNIQUE index）──
    initSchema()
    const db = getDb()

    // 可選：清空超過 N 天的新聞
    if (body.clear_old_days && typeof body.clear_old_days === 'number') {
      const cutoff = new Date(Date.now() - body.clear_old_days * 86400_000).toISOString()
      db.prepare('DELETE FROM player_news WHERE published_at < ?').run(cutoff)
      console.log(`Cleared news older than ${body.clear_old_days} days`)
    }

    if (!body.news?.length) {
      return Response.json({ success: true, news_received: 0, news_inserted: 0, cleared: true })
    }

    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO player_news (player_id, title, url, source, published_at, summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    let inserted = 0
    const insertMany = db.transaction((items: NewsItem[]) => {
      for (const item of items) {
        const publishedAt = toIso(item.published_at)
        const result = insertStmt.run(
          item.player_id,
          item.title,
          item.url,
          item.source,
          publishedAt,
          item.summary || ''
        )
        if (result.changes > 0) inserted++
      }
    })

    insertMany(body.news)

    return Response.json({
      success: true,
      news_received: body.news.length,
      news_inserted: inserted,
      message: `${inserted} 篇新聞已同步（重複 ${body.news.length - inserted} 篇）`,
      cleared_old_days: body.clear_old_days || 0,
    })
  } catch (err) {
    console.error('sync/news error:', err)
    return Response.json({ success: false, error: String(err) }, { status: 500 })
  }
}
