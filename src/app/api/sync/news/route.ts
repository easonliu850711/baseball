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

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token !== process.env.SYNC_TOKEN) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.news?.length) {
      return Response.json({ success: false, error: '缺少必要欄位 (news)' }, { status: 400 })
    }

    // ── 確保資料表存在 ──
    initSchema()
    const db = getDb()

    // ── 寫入新聞 ──
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO player_news (player_id, title, url, source, published_at, summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    let inserted = 0
    const insertMany = db.transaction((items: NewsItem[]) => {
      for (const item of items) {
        const result = insertStmt.run(
          item.player_id,
          item.title,
          item.url,
          item.source,
          item.published_at,
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
    })
  } catch (err) {
    console.error('sync/news error:', err)
    return Response.json({ success: false, error: String(err) }, { status: 500 })
  }
}
