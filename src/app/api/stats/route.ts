import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  initSchema()
  const db = getDb()

  const { searchParams } = new URL(request.url)
  const playerId = searchParams.get('player_id') || ''
  const season = parseInt(searchParams.get('season') || '2026')

  let sql = 'SELECT * FROM player_stats WHERE season = ?'
  const params: any[] = [season]

  if (playerId) {
    sql += ' AND player_id = ?'
    params.push(playerId)
  }

  sql += ' ORDER BY player_id, league'

  const rows = db.prepare(sql).all(...params)
  return Response.json({ stats: rows, total: rows.length })
}
