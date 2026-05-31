import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'
import { getTeamDisplayName } from '@/lib/teamNames'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  initSchema()
  const db = getDb()

  const { searchParams } = new URL(request.url)
  const league = searchParams.get('league') || ''
  const date = searchParams.get('date') || ''
  const status = searchParams.get('status') || ''

  let sql = 'SELECT * FROM games WHERE season = 2026'
  const params: any[] = []

  if (league) {
    sql += ' AND league = ?'
    params.push(league.toUpperCase())
  }
  if (date) {
    sql += ' AND game_date = ?'
    params.push(date)
  }
  if (status) {
    sql += ' AND status = ?'
    params.push(status)
  }

  sql += ' ORDER BY game_date DESC, league'

  const rows = db.prepare(sql).all(...params) as any[]
  const games = rows.map((game) => ({
    ...game,
    home_team: getTeamDisplayName(game.home_team),
    away_team: getTeamDisplayName(game.away_team),
  }))

  return Response.json({ games, total: games.length })
}
