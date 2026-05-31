import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'
import FALLBACK from './fallback.json'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const SEASON = Number(process.env.NPB_SEASON || new Date().getFullYear())

const LEAGUE_META: Record<string, { icon: string; title: string }> = {
  NPB_CENTRAL: { icon: '🏔️', title: '央聯 セ・リーグ' },
  NPB_PACIFIC: { icon: '🌊', title: '洋聯 パ・リーグ' },
  CPBL: { icon: '🐉', title: '中華職棒' },
  MLB_AL: { icon: '🇺🇸', title: 'MLB 美國聯盟' },
  MLB_NL: { icon: '🇺🇸', title: 'MLB 國家聯盟' },
  KBO: { icon: '🇰🇷', title: 'KBO 韓國職棒' },
}

const MLB_SHORT: Record<string, string> = {
  'Rays': '光芒',
  'Yankees': '洋基',
  'Red Sox': '紅襪',
  'Blue Jays': '藍鳥',
  'Orioles': '金鶯',
  'Guardians': '守護者',
  'Twins': '雙城',
  'Tigers': '老虎',
  'White Sox': '白襪',
  'Royals': '皇家',
  'Astros': '太空人',
  'Mariners': '水手',
  'Angels': '天使',
  'Athletics': '運動家',
  'Rangers': '遊騎兵',
  'Braves': '勇士',
  'Phillies': '費城人',
  'Mets': '大都會',
  'Nationals': '國民',
  'Marlins': '馬林魚',
  'Brewers': '釀酒人',
  'Cubs': '小熊',
  'Cardinals': '紅雀',
  'Reds': '紅人',
  'Pirates': '海盜',
  'Dodgers': '道奇',
  'Padres': '教士',
  'Giants': '巨人(MLB)',
  'Diamondbacks': '響尾蛇',
  'D-backs': '響尾蛇',
  'Rockies': '落磯',
}

const KBO_SHORT: Record<string, string> = {
  'Kia Tigers': '起亞虎',
  'Samsung Lions': '三星獅',
  'LG Twins': 'LG雙子',
  'Doosan Bears': '斗山熊',
  'SSG Landers': 'SSG登陸者',
  'KT Wiz': 'KT巫師',
  'NC Dinos': 'NC恐龍',
  'Lotte Giants': '樂天巨人',
  'Hanwha Eagles': '韓華鷹',
  'Kiwoom Heroes': '培證英雄',
}

const NPB_TEAM_SHORT: Record<string, string> = {
  'Hanshin Tigers': '阪神',
  'Tokyo Yakult Swallows': '養樂多',
  'Yomiuri Giants': '巨人',
  'YOKOHAMA DeNA BAYSTARS': 'DeNA',
  'YOKOHAMA DeNA': 'DeNA',
  'Hiroshima Toyo Carp': '廣島',
  'Chunichi Dragons': '中日',
  'ORIX Buffaloes': '歐力士',
  'Saitama Seibu Lions': '西武',
  'Hokkaido Nippon-Ham Fighters': '火腿',
  'Fukuoka SoftBank Hawks': '軟銀',
  'Chiba Lotte Marines': '羅德',
  'Tohoku Rakuten Golden Eagles': '樂天',
}

const NPB_COLORS: Record<string, string> = {
  '養樂多': 'text-green-400',
  '阪神': 'text-yellow-400',
  '巨人': 'text-orange-500',
  'DeNA': 'text-blue-400',
  '廣島': 'text-red-500',
  '中日': 'text-blue-600',
  '歐力士': 'text-amber-500',
  '西武': 'text-emerald-400',
  '火腿': 'text-sky-400',
  '軟銀': 'text-yellow-400',
  '羅德': 'text-stone-200',
  '樂天': 'text-red-400',
}

const NPB_STADIUMS: Record<string, string> = {
  '養樂多': '神宮球場',
  '阪神': '甲子園',
  '巨人': '東京巨蛋',
  'DeNA': '橫濱球場',
  '廣島': '馬自達球場',
  '中日': '名古屋巨蛋',
  '歐力士': '京瓷巨蛋',
  '西武': 'Belluna Dome',
  '火腿': 'ES CON FIELD',
  '軟銀': 'PayPay巨蛋',
  '羅德': 'ZOZO海洋球場',
  '樂天': '樂天生命球場',
}

type StandingRow = {
  rank: number
  team_name: string
  games: number
  wins: number
  losses: number
  draws: number
  win_pct: string
  games_back: string
  color: string
  stadium: string
}

function decodeHtml(text: string) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
}

function cleanText(html: string) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<br\s*\/?\s*>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

function normalizeGb(value: string) {
  const v = String(value || '-').trim()
  return v === '--' || v === '0' || v === '0.0' ? '-' : v
}

function shortTeamName(raw: string) {
  const normalized = raw.replace(/\s+/g, ' ').trim().toLowerCase()

  const matchedKey = Object.keys(NPB_TEAM_SHORT)
    .sort((a, b) => b.length - a.length)
    .find((key) => normalized.includes(key.toLowerCase()))

  return matchedKey ? NPB_TEAM_SHORT[matchedKey] : null
}

function buildRow(rank: number, rawTeam: string, values: string[]): StandingRow | null {
  const team = shortTeamName(rawTeam)
  if (!team) return null

  const games = Number.parseInt(values[0] || '0', 10)
  const wins = Number.parseInt(values[1] || '0', 10)
  const losses = Number.parseInt(values[2] || '0', 10)
  const draws = Number.parseInt(values[3] || '0', 10)
  const pct = (values[4] || '.000').trim()
  const gb = normalizeGb(values[5] || '-')

  if (!Number.isFinite(games) || games <= 0) return null

  return {
    rank,
    team_name: team,
    games,
    wins,
    losses,
    draws,
    win_pct: pct,
    games_back: gb,
    color: NPB_COLORS[team] || 'text-gray-400',
    stadium: NPB_STADIUMS[team] || '',
  }
}

function parseNPBStandings(html: string) {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || []
  const teams: StandingRow[] = []
  const seen = new Set<string>()

  for (const rowHtml of rows) {
    const cells = Array.from(rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi))
      .map((m) => cleanText(m[1]))
      .filter(Boolean)

    if (cells.length < 7) continue

    const teamCellIndex = cells.findIndex((cell) => shortTeamName(cell))
    if (teamCellIndex < 0) continue

    const rawTeam = cells[teamCellIndex]
    const values = cells.slice(teamCellIndex + 1)
    const row = buildRow(teams.length + 1, rawTeam, values)

    if (row && !seen.has(row.team_name)) {
      seen.add(row.team_name)
      teams.push(row)
    }

    if (teams.length >= 6) break
  }

  return teams
}

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; StudioImoriBot/1.0; +https://studio-imori.com)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en,ja;q=0.8,zh-TW;q=0.7',
      'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) throw new Error(`NPB fetch failed: ${res.status} ${url}`)
  return res.text()
}

async function scrapeNPB(): Promise<{ central: StandingRow[]; pacific: StandingRow[] } | null> {
  try {
    const [centralHtml, pacificHtml] = await Promise.all([
      fetchHtml(`https://npb.jp/bis/eng/${SEASON}/stats/std_c.html`),
      fetchHtml(`https://npb.jp/bis/eng/${SEASON}/stats/std_p.html`),
    ])

    const central = parseNPBStandings(centralHtml)
    const pacific = parseNPBStandings(pacificHtml)

    if (central.length < 6 || pacific.length < 6) {
      console.error('[standings][npb] parse empty', {
        centralCount: central.length,
        pacificCount: pacific.length,
        season: SEASON,
      })
      return null
    }

    return { central, pacific }
  } catch (err) {
    console.error('[standings][npb] scrape failed:', err)
    return null
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
    pct: (row.win_pct || row.pct || '.000').trim(),
    gb: normalizeGb(row.games_back || row.gb || '-'),
    color: row.color || 'text-gray-400',
    stadium: row.stadium || '',
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const league = searchParams.get('league') || ''

  if (league === 'npb') {
    const scraped = await scrapeNPB()
    const central = scraped?.central?.length ? scraped.central : (FALLBACK as any).NPB_CENTRAL
    const pacific = scraped?.pacific?.length ? scraped.pacific : (FALLBACK as any).NPB_PACIFIC

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

  async function scrapeMLB(): Promise<any[]> {
  try {
    const [alData, nlData] = await Promise.all([
      fetch('https://statsapi.mlb.com/api/v1/standings?leagueId=103&season=' + SEASON + '&standingsTypes=regularSeason', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      }).then(r => r.json()),
      fetch('https://statsapi.mlb.com/api/v1/standings?leagueId=104&season=' + SEASON + '&standingsTypes=regularSeason', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      }).then(r => r.json()),
    ])

    const result: any[] = []

    for (const records of [alData.records, nlData.records]) {
      for (const div of records) {
        const teams = div.teamRecords.map((t: any) => {
          const name = MLB_SHORT[t.team.name] || t.team.name
          const g = t.gamesPlayed
          const w = t.leagueRecord.wins
          const l = t.leagueRecord.losses
          const d = t.leagueRecord.ties || 0
          const pct = (t.leagueRecord.pct || '').trim()
          const gb = normalizeGb(t.gamesBack)
          return { rank: 0, team_name: name, games: g, wins: w, losses: l, draws: d, win_pct: pct, games_back: gb, color: 'text-gray-400', stadium: '' }
        }).filter((r: any) => r && r.games > 0)

        // Re-rank within each division
        teams.forEach((t: any, i: number) => { t.rank = i + 1 })

        if (teams.length > 0) {
          // Determine which league: if any team matches AL teams
          const alTeams = ['光芒','洋基','紅襪','藍鳥','金鶯','守護者','雙城','老虎','白襪','皇家','太空人','水手','天使','運動家','遊騎兵']
          const isAL = teams.some((t: any) => alTeams.includes(t.team_name))
          result.push({
            league: isAL ? LEAGUE_META.MLB_AL.title : LEAGUE_META.MLB_NL.title,
            icon: isAL ? LEAGUE_META.MLB_AL.icon : LEAGUE_META.MLB_NL.icon,
            teams: teams.map(normalizeTeam),
          })
        }
      }
    }

    return result
  } catch (err) {
    console.error('[standings][mlb] scrape failed:', err)
    return []
  }
}

async function scrapeKBO(): Promise<any[]> {
  try {
    // KBO data from Wikipedia (no official public API available)
    const res = await fetch(
      'https://en.wikipedia.org/w/api.php?action=parse&page=' + SEASON + '_KBO_League_season&prop=text&format=json',
      {
        headers: { 'User-Agent': 'StudioImoriBot/1.0 (baseball.studio-imori.com)' },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      }
    )
    const data = await res.json()
    const html = data?.parse?.text?.['*'] || ''

    // Find the regular season standings table (second wikitable with 11+ columns)
    const tables = html.match(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>[\s\S]*?<\/table>/g) || []
    
    for (const tableHtml of tables) {
      const rows = tableHtml.match(/<tr>[\s\S]*?<\/tr>/g) || []
      if (rows.length < 5) continue

      const teams: StandingRow[] = []
      const seen = new Set<string>()

      for (let i = 1; i < rows.length; i++) {
        const cellMatches = Array.from(String(rows[i]).matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi))
        const cells = cellMatches.map((m: RegExpExecArray) => cleanText(m[1])).filter(Boolean)

        // Need at least rank + team + W + L + D + PCT
        if (cells.length < 8) continue

        const rank = Number.parseInt(cells[0], 10)
        const rawTeam = cells[1]
        if (!Number.isFinite(rank) || rank < 1 || rank > 10) continue

        const team = KBO_SHORT[rawTeam]
        if (!team || seen.has(team)) continue

        const gp = Number.parseInt(cells[2], 10)
        const w = Number.parseInt(cells[3], 10)
        const l = Number.parseInt(cells[4], 10)
        const d = Number.parseInt(cells[5], 10)
        const pct = (cells[6] || '.000').trim()
        const gb = normalizeGb(cells[7] || '-')

        if (!Number.isFinite(gp) || gp <= 0) continue

        teams.push({
          rank, team_name: team,
          games: gp, wins: w, losses: l, draws: d,
          win_pct: pct, games_back: gb,
          color: 'text-gray-400',
          stadium: '',
        })
        seen.add(team)
      }

      // Regular season: teams have 50+ GP, spring training has 12 GP
      const isRegularSeason = teams.every((t: StandingRow) => t.games >= 40)
      if (teams.length >= 8 && isRegularSeason) {
        return [{
          league: LEAGUE_META.KBO.title,
          icon: LEAGUE_META.KBO.icon,
          teams: teams.map(normalizeTeam),
        }]
      }
    }

    return []
  } catch (err) {
    console.error('[standings][kbo] scrape failed:', err)
    return []
  }
}

  if (league === 'cpbl') {
    // 先讀 DB cache
    try {
      initSchema()
      const db = getDb()
      const latestDate = db.prepare(
        "SELECT snapshot_date FROM standings WHERE league = ? AND season = ? ORDER BY snapshot_date DESC LIMIT 1"
      ).get('CPBL', 2026) as { snapshot_date: string } | undefined

      if (latestDate) {
        const rows = db.prepare(
          "SELECT * FROM standings WHERE league = ? AND season = ? AND snapshot_date = ? ORDER BY rank ASC"
        ).all('CPBL', 2026, latestDate.snapshot_date) as any[]

        if (rows.length >= 4) {
          const teams = rows.map(r => ({
            rank: r.rank,
            team_name: r.team_name,
            games: r.games,
            wins: r.wins,
            losses: r.losses,
            draws: r.draws,
            win_pct: r.win_pct,
            games_back: r.games_back,
            color: '',
            stadium: '',
          }))
          return Response.json([
            { league: LEAGUE_META.CPBL.title, icon: LEAGUE_META.CPBL.icon, teams: teams.map(normalizeTeam) },
          ])
        }
      }
    } catch { /* DB 不可用 */ }

    return Response.json([
      { league: LEAGUE_META.CPBL.title, icon: LEAGUE_META.CPBL.icon, teams: (FALLBACK as any).CPBL.map(normalizeTeam) },
    ])
  }

  if (league === 'mlb') {
    const scraped = await scrapeMLB()
    const fallback = (FALLBACK as any).MLB
    if (scraped.length > 0) {
      return Response.json(scraped)
    }
    return Response.json(fallback || [])
  }

  if (league === 'kbo') {
    const scraped = await scrapeKBO()
    const fallback = (FALLBACK as any).KBO
    if (scraped.length > 0) {
      return Response.json(scraped)
    }
    return Response.json(fallback || [])
  }

  return Response.json([])
}
