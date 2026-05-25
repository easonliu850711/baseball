import FALLBACK from './fallback.json'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const SEASON = Number(process.env.NPB_SEASON || new Date().getFullYear())

const LEAGUE_META: Record<string, { icon: string; title: string }> = {
  NPB_CENTRAL: { icon: '🏔️', title: '央聯 セ・リーグ' },
  NPB_PACIFIC: { icon: '🌊', title: '洋聯 パ・リーグ' },
  CPBL: { icon: '🐉', title: '中華職棒' },
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
  const pct = values[4] || '.000'
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
    pct: row.win_pct || row.pct || '.000',
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

  if (league === 'cpbl') {
    return Response.json([
      { league: LEAGUE_META.CPBL.title, icon: LEAGUE_META.CPBL.icon, teams: (FALLBACK as any).CPBL.map(normalizeTeam) },
    ])
  }

  return Response.json([])
}
