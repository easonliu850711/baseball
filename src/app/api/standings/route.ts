import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LEAGUE_META: Record<string, { icon: string; title: string }> = {
  NPB_CENTRAL: { icon: '🏔️', title: '央聯 セ・リーグ' },
  NPB_PACIFIC: { icon: '🌊', title: '洋聯 パ・リーグ' },
  CPBL: { icon: '🐉', title: '中華職棒' },
}

export async function GET(request: Request) {
  initSchema()
  const db = getDb()

  const { searchParams } = new URL(request.url)
  const league = searchParams.get('league') || ''
  const season = parseInt(searchParams.get('season') || '2026')

  // 找最新快照日期
  const latest = db.prepare(`
    SELECT snapshot_date FROM standings
    WHERE league LIKE ? AND season = ?
    ORDER BY snapshot_date DESC LIMIT 1
  `).get(league === 'npb' ? 'NPB_%' : league.toUpperCase(), season) as { snapshot_date: string } | undefined

  const date = latest?.snapshot_date || new Date().toISOString().slice(0, 10)

  let rows: any[]
  if (league === 'npb') {
    const central = db.prepare(`
      SELECT * FROM standings
      WHERE league = 'NPB_CENTRAL' AND season = ? AND snapshot_date = ?
      ORDER BY rank ASC
    `).all(season, date) as any[]
    const pacific = db.prepare(`
      SELECT * FROM standings
      WHERE league = 'NPB_PACIFIC' AND season = ? AND snapshot_date = ?
      ORDER BY rank ASC
    `).all(season, date) as any[]

    return Response.json([
      {
        league: LEAGUE_META.NPB_CENTRAL.title,
        icon: LEAGUE_META.NPB_CENTRAL.icon,
        teams: central.map(normalizeTeam),
      },
      {
        league: LEAGUE_META.NPB_PACIFIC.title,
        icon: LEAGUE_META.NPB_PACIFIC.icon,
        teams: pacific.map(normalizeTeam),
      },
    ])
  }

  if (league === 'cpbl') {
    rows = db.prepare(`
      SELECT * FROM standings
      WHERE league = 'CPBL' AND season = ? AND snapshot_date = ?
      ORDER BY rank ASC
    `).all(season, date) as any[]

    return Response.json([
      {
        league: LEAGUE_META.CPBL.title,
        icon: LEAGUE_META.CPBL.icon,
        teams: rows.map(normalizeTeam),
      },
    ])
  }

  // 預設回傳所有
  rows = db.prepare(`
    SELECT * FROM standings
    WHERE season = ? AND snapshot_date = ?
    ORDER BY league, rank ASC
  `).all(season, date)

  return Response.json({ date, season, standings: rows })
}

function normalizeTeam(row: any) {
  return {
    rank: row.rank,
    name: row.team_name,
    g: row.games,
    w: row.wins,
    l: row.losses,
    d: row.draws,
    pct: row.pct,
    gb: row.gb,
    color: row.color || '#',
    stadium: row.stadium || '',
  }
}
