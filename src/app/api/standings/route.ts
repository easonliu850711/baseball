import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  initSchema()
  const db = getDb()

  const { searchParams } = new URL(request.url)
  const league = searchParams.get('league') || ''
  const season = parseInt(searchParams.get('season') || '2026')
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10)

  let rows
  if (league) {
    rows = db.prepare(`
      SELECT * FROM standings
      WHERE league = ? AND season = ? AND snapshot_date = ?
      ORDER BY rank ASC
    `).all(league.toUpperCase(), season, date)
  } else {
    rows = db.prepare(`
      SELECT * FROM standings
      WHERE season = ? AND snapshot_date = ?
      ORDER BY league, rank ASC
    `).all(season, date)
  }

  return Response.json({
    date,
    season,
    standings: rows
  })
}
