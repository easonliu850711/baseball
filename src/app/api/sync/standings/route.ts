import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'
import { writeFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface StandingTeam {
  rank: number | string
  team_name: string
  games_played?: number | string
  wins: number | string
  losses: number | string
  ties?: number | string
  win_percentage: string | number
  games_behind: string
}

interface SyncBody {
  token: string
  league: string       // 'cpbl' | 'npb' | 'mlb' | 'kbo'
  season: number
  date: string          // '2026-05-27'
  teams: StandingTeam[]
}

export async function POST(request: Request) {
  try {
    const body: SyncBody = await request.json()

    // ── 驗證 token ──
    if (body.token !== process.env.SYNC_TOKEN) {
      return Response.json({ success: false, error: '無效的 token' }, { status: 401 })
    }

    if (!body.league || !body.date || !body.teams?.length) {
      return Response.json({ success: false, error: '缺少必要欄位 (league, date, teams)' }, { status: 400 })
    }

    // ── 確保資料表存在 ──
    initSchema()
    const db = getDb()

    // ── 刪除當天同一聯盟的舊快照，再寫入新數據 ──
    const deleteStmt = db.prepare(
      'DELETE FROM standings WHERE league = ? AND season = ? AND snapshot_date = ?'
    )
    deleteStmt.run(body.league.toUpperCase(), body.season, body.date)

    const insertStmt = db.prepare(`
      INSERT INTO standings (league, season, snapshot_date, rank, team_name, games, wins, losses, draws, win_pct, games_back)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const insertMany = db.transaction((teams: StandingTeam[]) => {
      for (const t of teams) {
        const games = Number(t.games_played ?? 0) || (Number(t.wins) + Number(t.losses) + Number(t.ties ?? 0))
        const draws = Number(t.ties ?? 0)
        insertStmt.run(
          body.league.toUpperCase(), body.season, body.date,
          Number(t.rank), t.team_name, games,
          Number(t.wins), Number(t.losses), draws,
          String(t.win_percentage), t.games_behind
        )
      }
    })

    insertMany(body.teams)

    // ── 同步更新 fallback.json ──
    const fallbackPath = join(process.cwd(), 'src', 'app', 'api', 'standings', 'fallback.json')
    let fallbackData: Record<string, any[]> = {}
    try {
      fallbackData = JSON.parse(require('fs').readFileSync(fallbackPath, 'utf-8'))
    } catch { /* ignore */ }

    fallbackData[body.league.toUpperCase()] = body.teams.map(t => ({
      team_name: t.team_name,
      games: Number(t.games_played ?? 0) || (Number(t.wins) + Number(t.losses) + Number(t.ties ?? 0)),
      wins: Number(t.wins),
      losses: Number(t.losses),
      draws: Number(t.ties ?? 0),
      win_pct: String(t.win_percentage),
      games_back: t.games_behind,
      color: '',
      stadium: '',
      rank: Number(t.rank),
    }))

    writeFileSync(fallbackPath, JSON.stringify(fallbackData, null, 2) + '\n')

    return Response.json({
      success: true,
      league: body.league,
      date: body.date,
      teams_saved: body.teams.length,
      message: `${body.league.toUpperCase()} 戰績已同步（${body.date}，${body.teams.length} 隊）`,
    })
  } catch (err) {
    console.error('sync/standings error:', err)
    return Response.json({ success: false, error: String(err) }, { status: 500 })
  }
}
