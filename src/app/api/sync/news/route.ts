import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface NewsItem {
  player_id: string
  title: string
  url: string
  source: string
  published_at: string    // ISO date string
  summary?: string
}

interface SyncBody {
  token?: string
  news: NewsItem[]
}

function getIncomingToken(request: Request, body: SyncBody): string {
  const authHeader = request.headers.get('authorization') || ''
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : ''
  return String(body.token || bearerToken || '').trim()
}

export async function POST(request: Request) {
  try {
    const body: SyncBody = await request.json()

    // ── 驗證 token（同 standings API）──
    const serverToken = String(process.env.SYNC_TOKEN || '').trim()
    const incomingToken = getIncomingToken(request, body)

    if (!serverToken || incomingToken !== serverToken) {
      return Response.json({
        success: false,
        error: '無效的 token',
        tokenConfigured: Boolean(serverToken),
      }, { status: 401 })
    }

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
