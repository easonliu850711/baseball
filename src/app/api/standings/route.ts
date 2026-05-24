import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LEAGUE_META: Record<string, { icon: string; title: string }> = {
  NPB_CENTRAL: { icon: '🏔️', title: '央聯 セ・リーグ' },
  NPB_PACIFIC: { icon: '🌊', title: '洋聯 パ・リーグ' },
  CPBL: { icon: '🐉', title: '中華職棒' },
}

// ── 🪨 Fallback 靜態資料（DB 無資料時使用） ──
const FALLBACK: Record<string, any[]> = {
  NPB_CENTRAL: [
    { rank: 1, team_name: '養樂多', games: 44, wins: 27, losses: 17, draws: 0, win_pct: '.614', games_back: '-', color: 'text-green-400', stadium: '神宮球場' },
    { rank: 2, team_name: '阪神',   games: 43, wins: 25, losses: 17, draws: 1, win_pct: '.595', games_back: '1.0', color: 'text-yellow-400', stadium: '甲子園' },
    { rank: 3, team_name: '巨人',   games: 43, wins: 24, losses: 19, draws: 0, win_pct: '.558', games_back: '2.5', color: 'text-orange-500', stadium: '東京巨蛋' },
    { rank: 4, team_name: 'DeNA',   games: 44, wins: 20, losses: 22, draws: 2, win_pct: '.476', games_back: '6.0', color: 'text-blue-400', stadium: '橫濱球場' },
    { rank: 5, team_name: '廣島',   games: 41, wins: 16, losses: 23, draws: 2, win_pct: '.410', games_back: '8.5', color: 'text-red-500', stadium: '馬自達球場' },
    { rank: 6, team_name: '中日',   games: 43, wins: 14, losses: 28, draws: 1, win_pct: '.333', games_back: '12.0', color: 'text-blue-600', stadium: '名古屋巨蛋' },
  ],
  NPB_PACIFIC: [
    { rank: 1, team_name: '歐力士', games: 43, wins: 25, losses: 18, draws: 0, win_pct: '.581', games_back: '-', color: 'text-amber-500', stadium: '京瓷巨蛋' },
    { rank: 2, team_name: '西武',   games: 45, wins: 25, losses: 19, draws: 1, win_pct: '.568', games_back: '0.5', color: 'text-emerald-400', stadium: '西武巨蛋' },
    { rank: 3, team_name: '火腿',   games: 46, wins: 23, losses: 23, draws: 0, win_pct: '.500', games_back: '3.5', color: 'text-sky-400', stadium: 'ES CON FIELD' },
    { rank: 4, team_name: '軟銀',   games: 42, wins: 20, losses: 22, draws: 0, win_pct: '.476', games_back: '4.5', color: 'text-yellow-400', stadium: 'PayPay巨蛋' },
    { rank: 5, team_name: '羅德',   games: 43, wins: 19, losses: 24, draws: 0, win_pct: '.442', games_back: '6.0', color: 'text-black', stadium: 'ZOZO海洋球場' },
    { rank: 6, team_name: '樂天',   games: 43, wins: 18, losses: 24, draws: 1, win_pct: '.429', games_back: '6.5', color: 'text-red-400', stadium: '樂天移動通信球場' },
  ],
  CPBL: [
    { rank: 1, team_name: '味全龍',  games: 36, wins: 23, losses: 13, draws: 0, win_pct: '.639', games_back: '-', color: 'text-red-500', stadium: '' },
    { rank: 2, team_name: '富邦悍將', games: 33, wins: 19, losses: 14, draws: 0, win_pct: '.576', games_back: '2.5', color: 'text-blue-500', stadium: '' },
    { rank: 3, team_name: '統一獅',  games: 35, wins: 18, losses: 16, draws: 1, win_pct: '.529', games_back: '4.0', color: 'text-orange-500', stadium: '' },
    { rank: 4, team_name: '台鋼雄鷹', games: 37, wins: 18, losses: 18, draws: 1, win_pct: '.500', games_back: '5.0', color: 'text-emerald-400', stadium: '' },
    { rank: 5, team_name: '樂天桃猿', games: 34, wins: 14, losses: 19, draws: 1, win_pct: '.424', games_back: '7.5', color: 'text-red-400', stadium: '' },
    { rank: 6, team_name: '中信兄弟', games: 35, wins: 11, losses: 23, draws: 1, win_pct: '.324', games_back: '11.0', color: 'text-yellow-400', stadium: '' },
  ],
}

function queryDB(league: string, season: number) {
  const db = getDb()
  const latest = db!.prepare(`
    SELECT snapshot_date FROM standings
    WHERE league = ? AND season = ?
    ORDER BY snapshot_date DESC LIMIT 1
  `).get(league, season) as { snapshot_date: string } | undefined

  if (!latest) return null

  const rows = db!.prepare(`
    SELECT * FROM standings
    WHERE league = ? AND season = ? AND snapshot_date = ?
    ORDER BY rank ASC
  `).all(league, season, latest.snapshot_date) as any[]

  return rows.length > 0 ? rows : null
}

export async function GET(request: Request) {
  try {
    initSchema()
  } catch {
    // DB 不存在時直接 fallback
  }

  const { searchParams } = new URL(request.url)
  const league = searchParams.get('league') || ''
  const season = parseInt(searchParams.get('season') || '2026')

  try {
    if (league === 'npb') {
      let central = queryDB('NPB_CENTRAL', season)
      let pacific = queryDB('NPB_PACIFIC', season)

      // Fallback to hardcoded data if DB is empty
      if (!central) central = FALLBACK.NPB_CENTRAL
      if (!pacific) pacific = FALLBACK.NPB_PACIFIC

      return Response.json([
        { league: LEAGUE_META.NPB_CENTRAL.title, icon: LEAGUE_META.NPB_CENTRAL.icon, teams: central.map(normalizeTeam) },
        { league: LEAGUE_META.NPB_PACIFIC.title, icon: LEAGUE_META.NPB_PACIFIC.icon, teams: pacific.map(normalizeTeam) },
      ])
    }

    if (league === 'cpbl') {
      let rows = queryDB('CPBL', season)
      if (!rows) rows = FALLBACK.CPBL

      return Response.json([
        { league: LEAGUE_META.CPBL.title, icon: LEAGUE_META.CPBL.icon, teams: rows.map(normalizeTeam) },
      ])
    }

    return Response.json([])
  } catch (err) {
    // 任何 DB 錯誤時也用 fallback
    if (league === 'npb') {
      return Response.json([
        { league: LEAGUE_META.NPB_CENTRAL.title, icon: LEAGUE_META.NPB_CENTRAL.icon, teams: FALLBACK.NPB_CENTRAL.map(normalizeTeam) },
        { league: LEAGUE_META.NPB_PACIFIC.title, icon: LEAGUE_META.NPB_PACIFIC.icon, teams: FALLBACK.NPB_PACIFIC.map(normalizeTeam) },
      ])
    }
    if (league === 'cpbl') {
      return Response.json([
        { league: LEAGUE_META.CPBL.title, icon: LEAGUE_META.CPBL.icon, teams: FALLBACK.CPBL.map(normalizeTeam) },
      ])
    }
    return Response.json([])
  }
}

function normalizeTeam(row: any) {
  return {
    rank: row.rank,
    name: row.team_name,
    g: row.games,
    w: row.wins,
    l: row.losses,
    d: row.draws,
    pct: row.win_pct || row.pct,
    gb: row.games_back || row.gb,
    color: row.color || '#',
    stadium: row.stadium || '',
  }
}
