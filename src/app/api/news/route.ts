import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  initSchema()
  const db = getDb()

  const { searchParams } = new URL(request.url)
  const playerId = searchParams.get('player_id') || ''
  const limit = parseInt(searchParams.get('limit') || '10')

  let sql = 'SELECT * FROM player_news WHERE 1=1'
  const params: any[] = []

  if (playerId) {
    sql += ' AND player_id = ?'
    params.push(playerId)
  }

  sql += ' ORDER BY published_at DESC LIMIT ?'
  params.push(limit)

  const rows = db.prepare(sql).all(...params)
  return Response.json({ news: rows, total: rows.length })
}
