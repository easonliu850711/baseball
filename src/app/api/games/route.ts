import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'
import { getTeamDisplayName } from '@/lib/teamNames'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type League = 'NPB' | 'MLB' | 'CPBL' | 'KBO'
type GameStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled' | 'reserved' | 'suspended'

type GameRecord = {
  id?: number | string
  league: League
  season: number
  game_date: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  stadium: string
  status: GameStatus
  game_time: string
  game_pk?: string
  source: string
}

const LEAGUES: League[] = ['NPB', 'MLB', 'CPBL', 'KBO']
const DEFAULT_TIMEOUT_MS = 12_000

const NPB_TEAMS = [
  'Nippon-Ham', 'Rakuten', 'Seibu', 'Lotte', 'ORIX', 'Orix', 'SoftBank', 'Softbank',
  'Yomiuri', 'Yakult', 'DeNA', 'Hanshin', 'Chunichi', 'Hiroshima', 'Giants', 'Tigers',
  'Dragons', 'Carp', 'Swallows', 'BayStars', 'Buffaloes', 'Hawks', 'Marines', 'Lions',
  'Fighters', 'Eagles',
]

const KBO_TEAMS = ['KIA', 'LG', 'KT', 'KIWOOM', 'LOTTE', 'NC', 'DOOSAN', 'SAMSUNG', 'SSG', 'HANWHA']

const CPBL_TEAMS = ['統一7-ELEVEn獅', '樂天桃猿', '台鋼雄鷹', '中信兄弟', '味全龍', '富邦悍將']
const CPBL_TEAM_RE = CPBL_TEAMS.map(escapeRegExp).join('|')

function normalizeLeague(value: string | null): League | null {
  const upper = String(value || '').trim().toUpperCase()
  return LEAGUES.includes(upper as League) ? (upper as League) : null
}

function normalizeDate(value: string | null): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  return formatDateInTimeZone(new Date(), 'Asia/Taipei')
}

function formatDateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const y = parts.find((p) => p.type === 'year')?.value || String(date.getFullYear())
  const m = parts.find((p) => p.type === 'month')?.value || '01'
  const d = parts.find((p) => p.type === 'day')?.value || '01'
  return `${y}-${m}-${d}`
}

function formatTimeInTimeZone(value: string | undefined, timeZone: string): string {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed)
}

function seasonFromDate(date: string): number {
  return Number(date.slice(0, 4)) || new Date().getFullYear()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function cleanText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>|<\/div>|<\/li>|<\/tr>|<\/td>|<\/th>|<\/a>|<\/h\d>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\r/g, '')
}

function textLines(html: string): string[] {
  return cleanText(html)
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; StudioImoriBot/1.0; +https://studio-imori.com)',
      Accept: 'text/html,application/xhtml+xml,application/json',
      'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8,ja;q=0.7,ko;q=0.7',
      'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  })

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.text()
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; StudioImoriBot/1.0; +https://studio-imori.com)',
      Accept: 'application/json,text/plain,*/*',
      'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  })

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

function normalizeStatus(raw: string | undefined): GameStatus {
  const text = String(raw || '').trim().toLowerCase()
  if (!text) return 'scheduled'
  if (/final|game over|finished|closed|complete|已結束|比賽結束/.test(text)) return 'finished'
  if (/live|in progress|進行中|比賽中|top|bot|mid|end/.test(text)) return 'live'
  if (/postpon|rain|延賽/.test(text)) return 'postponed'
  if (/cancel|取消/.test(text)) return 'cancelled'
  if (/reserved|保留/.test(text)) return 'reserved'
  if (/suspend|暫停/.test(text)) return 'suspended'
  return 'scheduled'
}

function normalizeGame(game: GameRecord): GameRecord {
  return {
    ...game,
    home_team: getTeamDisplayName(game.home_team),
    away_team: getTeamDisplayName(game.away_team),
    stadium: game.stadium || '',
    game_time: game.game_time || '',
    home_score: toNumber(game.home_score),
    away_score: toNumber(game.away_score),
  }
}

async function fetchMLBGames(date: string): Promise<GameRecord[]> {
  const season = seasonFromDate(date)
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=team,linescore,venue`
  const data = await fetchJson<any>(url)
  const games = data?.dates?.[0]?.games || []

  return games.map((g: any): GameRecord => {
    const status = normalizeStatus(g?.status?.abstractGameState || g?.status?.detailedState)
    const awayScore = toNumber(g?.teams?.away?.score)
    const homeScore = toNumber(g?.teams?.home?.score)

    return normalizeGame({
      id: `MLB-${g.gamePk}`,
      league: 'MLB',
      season,
      game_date: date,
      away_team: g?.teams?.away?.team?.name || '',
      home_team: g?.teams?.home?.team?.name || '',
      away_score: awayScore,
      home_score: homeScore,
      stadium: g?.venue?.name || '',
      status,
      game_time: formatTimeInTimeZone(g?.gameDate, 'Asia/Taipei'),
      game_pk: String(g?.gamePk || ''),
      source: 'MLB Stats API',
    })
  })
}

function parseNPBFinishedText(text: string, date: string, season: number): GameRecord[] {
  const teamRe = NPB_TEAMS.map(escapeRegExp).join('|')
  const re = new RegExp(`(${teamRe})\\s+(\\d+)\\s+Game\\s+\\d+\\s+(.+?)\\s+(\\d+)\\s+(${teamRe})(?=\\s+(${teamRe})\\s+\\d+\\s+Game|$)`, 'gi')
  const games: GameRecord[] = []
  let match: RegExpExecArray | null

  while ((match = re.exec(text)) !== null) {
    const homeTeam = match[1]
    const homeScore = toNumber(match[2])
    const stadium = match[3].replace(/\s+/g, ' ').trim()
    const awayScore = toNumber(match[4])
    const awayTeam = match[5]

    games.push(normalizeGame({
      id: `NPB-${date}-${homeTeam}-${awayTeam}`,
      league: 'NPB',
      season,
      game_date: date,
      home_team: homeTeam,
      away_team: awayTeam,
      home_score: homeScore,
      away_score: awayScore,
      stadium,
      status: 'finished',
      game_time: '',
      source: 'NPB.jp',
    }))
  }

  return games
}

function parseNPBScheduledLines(lines: string[], date: string, season: number): GameRecord[] {
  const teamSet = new Set(NPB_TEAMS.map((t) => t.toLowerCase()))
  const isTeam = (v: string) => teamSet.has(v.toLowerCase())
  const games: GameRecord[] = []

  for (let i = 0; i < lines.length - 3; i++) {
    if (!isTeam(lines[i])) continue

    const homeTeam = lines[i]
    const stadium = lines[i + 1]
    const time = lines[i + 2]
    const awayTeam = lines[i + 3]

    if (!/^\d{1,2}:\d{2}$/.test(time) || !isTeam(awayTeam)) continue
    if (/^(Central|Pacific|Japan|Regular|Submenu|Home|Schedule|Standings)/i.test(stadium)) continue

    games.push(normalizeGame({
      id: `NPB-${date}-${homeTeam}-${awayTeam}`,
      league: 'NPB',
      season,
      game_date: date,
      home_team: homeTeam,
      away_team: awayTeam,
      home_score: null,
      away_score: null,
      stadium,
      status: 'scheduled',
      game_time: time,
      source: 'NPB.jp',
    }))
  }

  return uniqueGames(games)
}

async function fetchNPBGames(date: string): Promise<GameRecord[]> {
  const season = seasonFromDate(date)
  const compact = date.replace(/-/g, '')
  const url = `https://npb.jp/bis/eng/${season}/games/gm${compact}.html`
  const html = await fetchText(url)
  const lines = textLines(html)
  const text = lines.join(' ')

  const finished = parseNPBFinishedText(text, date, season)
  if (finished.length > 0) return finished

  return parseNPBScheduledLines(lines, date, season)
}

type KBOParsedHeader = {
  away: string
  home: string
  awayScore: number | null
  homeScore: number | null
  status: GameStatus
  time: string
  stadium?: string
}

function cleanKBOText(value: string): string {
  return value
    .replace(/Image:\s*[A-Za-z0-9_-]+/gi, ' ')
    .replace(/\bTEAM\s+1\s+2\s+3\s+4\s+5\s+6\s+7\s+8\s+9\s+10\s+11\s+12\s+13\s+14\s+15\s+R\s+H\s+E\s+B\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseKBOHeader(line: string): KBOParsedHeader | null {
  const teamRe = KBO_TEAMS.join('|')
  const normalized = cleanKBOText(line)

  const liveOrFinal = normalized.match(
    new RegExp(`(?:^|\\s)(${teamRe})\\s+(\\d+)\\s+((?:TOP|BOT|MID|END)\\s*\\d+(?:ST|ND|RD|TH)?|FINAL(?:/\\d+)?|GAME OVER|CANCELED|CANCELLED|POSTPONED|RAINED OUT|SUSPENDED)\\s+(\\d+)\\s+(${teamRe})(?:\\s|$)`, 'i')
  )
  if (liveOrFinal) {
    return {
      away: liveOrFinal[1].toUpperCase(),
      awayScore: toNumber(liveOrFinal[2]),
      status: normalizeStatus(liveOrFinal[3]),
      homeScore: toNumber(liveOrFinal[4]),
      home: liveOrFinal[5].toUpperCase(),
      time: '',
    }
  }

  const scheduled = normalized.match(new RegExp(`(?:^|\\s)(${teamRe})\\s+(VS|:|\\d{1,2}:\\d{2})\\s+(${teamRe})(?:\\s|$)`, 'i'))
  if (!scheduled) return null

  return {
    away: scheduled[1].toUpperCase(),
    home: scheduled[3].toUpperCase(),
    awayScore: null,
    homeScore: null,
    status: 'scheduled',
    time: /^\d{1,2}:\d{2}$/.test(scheduled[2]) ? scheduled[2] : '',
  }
}

function parseKBOScoreboardText(lines: string[], date: string, season: number): GameRecord[] {
  const teamRe = KBO_TEAMS.join('|')
  const text = cleanKBOText(lines.join(' '))
  const headerRe = new RegExp(`(${teamRe})\\s+(\\d+)\\s+((?:TOP|BOT|MID|END)\\s*\\d+(?:ST|ND|RD|TH)?|FINAL(?:/\\d+)?|GAME OVER|CANCELED|CANCELLED|POSTPONED|RAINED OUT|SUSPENDED)\\s+(\\d+)\\s+(${teamRe})`, 'gi')
  const matches: RegExpExecArray[] = []
  let headerMatch: RegExpExecArray | null

  while ((headerMatch = headerRe.exec(text)) !== null) {
    matches.push(headerMatch)
  }

  const games: GameRecord[] = []

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const nextIndex = matches[i + 1]?.index ?? text.length
    const after = text.slice((match.index ?? 0) + match[0].length, nextIndex)
    const venueMatch = after.match(/\b([A-Z][A-Z0-9 ]{2,30}?)\s+(\d{1,2}:\d{2})(?:\s|$)/)

    games.push(normalizeGame({
      id: `KBO-${date}-${match[1].toUpperCase()}-${match[5].toUpperCase()}`,
      league: 'KBO',
      season,
      game_date: date,
      away_team: match[1].toUpperCase(),
      home_team: match[5].toUpperCase(),
      away_score: toNumber(match[2]),
      home_score: toNumber(match[4]),
      stadium: venueMatch?.[1]?.trim() || '',
      status: normalizeStatus(match[3]),
      game_time: venueMatch?.[2] || '',
      source: 'KBO official scoreboard',
    }))
  }

  return uniqueGames(games)
}

function parseKBODailySchedule(lines: string[], date: string, season: number): GameRecord[] {
  const [, monthRaw, dayRaw] = date.match(/^\d{4}-(\d{2})-(\d{2})$/) || []
  const month = Number(monthRaw)
  const day = Number(dayRaw)
  if (!month || !day) return []

  const teamRe = KBO_TEAMS.join('|')
  const datePrefix = `${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
  const gameRe = new RegExp(`^(?:(\\d{2}\\.\\d{2})\\([A-Z]{3}\\)\\s+REGULAR\\s+)?(\\d{1,2}:\\d{2})\\s+(${teamRe})\\s+(?:(\\d+)\\s*:\\s*(\\d+)|:)\\s+(${teamRe})\\b`, 'i')
  const games: GameRecord[] = []
  let inDate = false

  for (let i = 0; i < lines.length; i++) {
    const line = cleanKBOText(lines[i])
    const explicitDate = line.match(/^(\d{2}\.\d{2})\([A-Z]{3}\)/)

    if (explicitDate) {
      inDate = explicitDate[1] === datePrefix
    }

    if (!inDate) continue

    const match = line.match(gameRe)
    if (!match) continue

    const away = match[3].toUpperCase()
    const home = match[6].toUpperCase()
    const awayScore = toNumber(match[4])
    const homeScore = toNumber(match[5])
    const venueLine = cleanKBOText(lines[i + 1] || '')
    const isPostponed = /POSTPONED|RAINED OUT/i.test(venueLine)
    const stadium = venueLine.replace(/\s+(?:-|POSTPONED|RAINED OUT|CANCELED|CANCELLED).*$/i, '').trim()

    games.push(normalizeGame({
      id: `KBO-${date}-${away}-${home}`,
      league: 'KBO',
      season,
      game_date: date,
      away_team: away,
      home_team: home,
      away_score: awayScore,
      home_score: homeScore,
      stadium,
      status: isPostponed ? 'postponed' : (awayScore !== null && homeScore !== null ? 'finished' : 'scheduled'),
      game_time: match[2],
      source: 'KBO daily schedule',
    }))
  }

  return uniqueGames(games)
}

async function fetchKBOGames(date: string): Promise<GameRecord[]> {
  const season = seasonFromDate(date)
  const scoreboardUrl = `https://eng.koreabaseball.com/Schedule/Scoreboard.aspx?searchDate=${date}`
  const scoreboardLines = textLines(await fetchText(scoreboardUrl))

  const scoreboardGames = parseKBOScoreboardText(scoreboardLines, date, season)
  if (scoreboardGames.length > 0) return scoreboardGames

  const lineGames: GameRecord[] = []
  for (let i = 0; i < scoreboardLines.length; i++) {
    const header = parseKBOHeader(scoreboardLines[i])
    if (!header) continue

    const venueLine = cleanKBOText(scoreboardLines[i + 1] || '')
    const venueMatch = venueLine.match(/^(.+?)\s+(\d{1,2}:\d{2})/)
    const stadium = venueMatch ? venueMatch[1] : venueLine.replace(/\s+(?:-|W:|S:|L:).*$/i, '').trim()
    const time = header.time || venueMatch?.[2] || ''

    lineGames.push(normalizeGame({
      id: `KBO-${date}-${header.away}-${header.home}`,
      league: 'KBO',
      season,
      game_date: date,
      away_team: header.away,
      home_team: header.home,
      away_score: header.awayScore,
      home_score: header.homeScore,
      stadium,
      status: header.status,
      game_time: time,
      source: 'KBO official scoreboard',
    }))
  }
  if (lineGames.length > 0) return uniqueGames(lineGames)

  // Fallback: the KBO daily schedule page exposes the whole month as simple text.
  const dailyLines = textLines(await fetchText('https://eng.koreabaseball.com/Schedule/DailySchedule.aspx'))
  return parseKBODailySchedule(dailyLines, date, season)
}

function cleanCPBLSourceLines(lines: string[]): string[] {
  return lines
    .map((line) => line
      .replace(/Image:\s*[^\s]+/gi, ' ')
      .replace(/\{\{[\s\S]*?\}\}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean)
}

function isCPBLTeamLine(line: string): string | null {
  const teams = CPBL_TEAMS.filter((team) => line === team || line.includes(team))
  return teams.length === 1 ? teams[0] : null
}

function isCPBLRecordLine(line: string): boolean {
  return /^\d+-\d+-\d+$/.test(line)
}

function isCPBLDateLine(line: string): boolean {
  return /^\d{1,2}月\d{1,2}日/.test(line) || /^\d{1,2}\/\d{1,2}(?:\s|\(|$)/.test(line)
}

function normalizeCPBLTime(value: string): string {
  const match = value.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return value

  const hour = Number(match[1])
  if (!Number.isFinite(hour)) return value

  // stats.cpbl.com.tw 的 SSR 文字常把 16:05 / 17:05 / 18:35 顯示成 00:05 / 01:05 / 02:35。
  // 這裡只校正 CPBL 不會使用的凌晨開賽時段，避免正常白天賽程被誤改。
  if (hour >= 0 && hour <= 3) {
    return `${String((hour + 16) % 24).padStart(2, '0')}:${match[2]}`
  }

  return value
}

function findNextCPBLTeam(lines: string[], start: number) {
  for (let i = start; i < lines.length; i++) {
    const team = isCPBLTeamLine(lines[i])
    if (team) return { index: i, value: team }
  }
  return null
}

function findNextCPBLValue(lines: string[], start: number, predicate: (line: string) => boolean) {
  for (let i = start; i < lines.length; i++) {
    const value = lines[i]
    if (predicate(value)) return { index: i, value }
  }
  return null
}

function parseCPBLCompactBlock(block: string[], date: string, season: number): GameRecord[] {
  const text = block.join(' ').replace(/\s+/g, ' ')
  const teamRe = CPBL_TEAM_RE
  const games: GameRecord[] = []

  const finishedRe = new RegExp(`(${teamRe})\\s+(?:\\d+-\\d+-\\d+\\s+)?(\\d+)\\s*:\\s*(\\d+)\\s+([^\\s]+)\\s+(${teamRe})(?:\\s+\\d+-\\d+-\\d+)?\\s+GAME\\s*(\\d+)\\s*(已結束|進行中|比賽中|比賽暫停)?`, 'g')
  let finished: RegExpExecArray | null
  while ((finished = finishedRe.exec(text)) !== null) {
    games.push(normalizeGame({
      id: `CPBL-${date}-${finished[6]}`,
      league: 'CPBL',
      season,
      game_date: date,
      away_team: finished[1],
      home_team: finished[5],
      away_score: toNumber(finished[2]),
      home_score: toNumber(finished[3]),
      stadium: finished[4],
      status: normalizeStatus(finished[7] || '已結束'),
      game_time: '',
      game_pk: finished[6],
      source: 'CPBL advanced stats',
    }))
  }

  const scheduledRe = new RegExp(`(${teamRe})\\s+(?:\\d+-\\d+-\\d+\\s+)?(?:vs|VS\\.?)\\s+([^\\s]+)\\s+(\\d{1,2}:\\d{2})\\s+(${teamRe})(?:\\s+\\d+-\\d+-\\d+)?\\s+GAME\\s*(\\d+)\\s*(未開始|延賽|取消|保留|比賽暫停|進行中)?`, 'g')
  let scheduled: RegExpExecArray | null
  while ((scheduled = scheduledRe.exec(text)) !== null) {
    games.push(normalizeGame({
      id: `CPBL-${date}-${scheduled[5]}`,
      league: 'CPBL',
      season,
      game_date: date,
      away_team: scheduled[1],
      home_team: scheduled[4],
      away_score: null,
      home_score: null,
      stadium: scheduled[2],
      status: normalizeStatus(scheduled[6] || '未開始'),
      game_time: normalizeCPBLTime(scheduled[3]),
      game_pk: scheduled[5],
      source: 'CPBL advanced stats',
    }))
  }

  return games
}

function parseCPBLFromLines(lines: string[], date: string, season: number): GameRecord[] {
  const [, , monthRaw, dayRaw] = date.match(/^(\d{4})-(\d{2})-(\d{2})$/) || []
  const month = Number(monthRaw)
  const day = Number(dayRaw)
  const dateHeader = new RegExp(`^(?:${month}月${day}日|${month}\/${day}(?:\\s|\\(|$))`)
  const cleaned = cleanCPBLSourceLines(lines)
  const scheduleListIndex = cleaned.findIndex((line) => line.includes('賽程列表'))
  const starts = cleaned
    .map((line, index) => ({ line, index }))
    .filter(({ line, index }) => dateHeader.test(line) && (scheduleListIndex < 0 || index >= scheduleListIndex))

  const start = starts.length > 0
    ? starts[starts.length - 1].index
    : cleaned.findIndex((line) => dateHeader.test(line))

  if (start < 0) return []

  let end = cleaned.length
  for (let i = start + 1; i < cleaned.length; i++) {
    if (isCPBLDateLine(cleaned[i]) || /^##\s*第/.test(cleaned[i]) || cleaned[i] === '社群連結') {
      end = i
      break
    }
  }

  const block = cleaned.slice(start, end)
  const games: GameRecord[] = []

  for (let i = 0; i < block.length; i++) {
    const gameLine = block[i]
    const gameMatch = gameLine.match(/^GAME\s*(\d+)\s*(已結束|未開始|進行中|比賽中|延賽|取消|保留|比賽暫停)?/)
    if (!gameMatch) continue

    const gameNo = gameMatch[1]
    const status = normalizeStatus(gameMatch[2] || '')
    let cursor = i + 1

    const awayTeam = findNextCPBLTeam(block, cursor)
    if (!awayTeam) continue
    cursor = awayTeam.index + 1

    const scoreLine = findNextCPBLValue(block, cursor, (line) => /^\d+\s*:\s*\d+$/.test(line) || /^vs$/i.test(line))
    if (!scoreLine) continue
    cursor = scoreLine.index + 1

    let awayScore: number | null = null
    let homeScore: number | null = null
    let stadium = ''
    let gameTime = ''

    if (/^\d+\s*:\s*\d+$/.test(scoreLine.value)) {
      const [a, h] = scoreLine.value.split(':').map((v) => toNumber(v.trim()))
      awayScore = a
      homeScore = h

      const stadiumLine = findNextCPBLValue(block, cursor, (line) => (
        !isCPBLTeamLine(line)
        && !isCPBLRecordLine(line)
        && !/^GAME/.test(line)
        && !/^成績看板$/.test(line)
        && !/^共\s*\d+\s*場$/.test(line)
      ))
      stadium = stadiumLine?.value || ''
      if (stadiumLine) cursor = stadiumLine.index + 1
    } else {
      const stadiumLine = findNextCPBLValue(block, cursor, (line) => (
        !isCPBLTeamLine(line)
        && !isCPBLRecordLine(line)
        && !/^GAME/.test(line)
        && !/^成績看板$/.test(line)
        && !/^\d{1,2}:\d{2}$/.test(line)
      ))
      stadium = stadiumLine?.value || ''
      if (stadiumLine) cursor = stadiumLine.index + 1

      const timeLine = findNextCPBLValue(block, cursor, (line) => /^\d{1,2}:\d{2}$/.test(line))
      gameTime = timeLine ? normalizeCPBLTime(timeLine.value) : ''
      if (timeLine) cursor = timeLine.index + 1
    }

    const homeTeam = findNextCPBLTeam(block, cursor)
    if (!homeTeam) continue

    games.push(normalizeGame({
      id: `CPBL-${date}-${gameNo}`,
      league: 'CPBL',
      season,
      game_date: date,
      away_team: awayTeam.value,
      home_team: homeTeam.value,
      away_score: awayScore,
      home_score: homeScore,
      stadium,
      status: awayScore !== null && homeScore !== null ? 'finished' : status,
      game_time: gameTime,
      game_pk: gameNo,
      source: 'CPBL advanced stats',
    }))
  }

  return uniqueGames([...games, ...parseCPBLCompactBlock(block, date, season)])
}

function parseCPBLOfficialText(lines: string[], date: string, season: number): GameRecord[] {
  const [y, m, d] = date.split('-')
  const month = Number(m)
  const day = Number(d)
  const text = lines.join(' ')
  const datePrefix = new RegExp(`${month}/${day}\\([^)]*\\)\\s+(\\d+)\\s+(${CPBL_TEAM_RE})\\s+(?:(\\d+)\\s*:\\s*(\\d+)|VS\\.)\\s+(${CPBL_TEAM_RE})\\s+([^\\s]+)`, 'g')
  const games: GameRecord[] = []
  let match: RegExpExecArray | null

  while ((match = datePrefix.exec(text)) !== null) {
    games.push(normalizeGame({
      id: `CPBL-${date}-${match[1]}`,
      league: 'CPBL',
      season,
      game_date: `${y}-${m}-${d}`,
      away_team: match[2],
      home_team: match[5],
      away_score: toNumber(match[3]),
      home_score: toNumber(match[4]),
      stadium: match[6] || '',
      status: match[3] && match[4] ? 'finished' : 'scheduled',
      game_time: '',
      game_pk: match[1],
      source: 'CPBL official schedule',
    }))
  }

  return uniqueGames(games)
}

function findNext(lines: string[], start: number, predicate: (line: string) => boolean) {
  for (let i = start; i < lines.length; i++) {
    const value = lines[i]
    if (predicate(value)) return { index: i, value }
  }
  return null
}

async function fetchCPBLGames(date: string): Promise<GameRecord[]> {
  const season = seasonFromDate(date)
  const month = Number(date.slice(5, 7))

  const urls = [
    `https://stats.cpbl.com.tw/schedule?date=${date}`,
    `https://stats.cpbl.com.tw/schedule?year=${season}&month=${month}`,
    `https://stats.cpbl.com.tw/schedule`,
    `https://cpbl.com.tw/schedule?year=${season}&month=${month}`,
    `https://en.cpbl.com.tw/schedule?year=${season}&month=${month}`,
  ]

  let lastError: unknown

  for (const url of urls) {
    try {
      const lines = textLines(await fetchText(url))
      const parsed = url.includes('stats.cpbl.com.tw')
        ? parseCPBLFromLines(lines, date, season)
        : parseCPBLOfficialText(lines, date, season)
      if (parsed.length > 0) return parsed
    } catch (err) {
      lastError = err
    }
  }

  if (lastError) throw lastError
  return []
}

function uniqueGames(games: GameRecord[]): GameRecord[] {
  const seen = new Set<string>()
  return games.filter((game) => {
    const key = `${game.league}-${game.game_date}-${game.away_team}-${game.home_team}-${game.game_pk || ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function fetchLeagueGames(league: League, date: string): Promise<GameRecord[]> {
  if (league === 'MLB') return fetchMLBGames(date)
  if (league === 'NPB') return fetchNPBGames(date)
  if (league === 'KBO') return fetchKBOGames(date)
  return fetchCPBLGames(date)
}

function readDbFallback(date: string, league?: League): GameRecord[] {
  try {
    initSchema()
    const db = getDb()
    const params: any[] = [date]
    let sql = 'SELECT * FROM games WHERE season = ? AND game_date = ?'
    params.unshift(seasonFromDate(date))

    if (league) {
      sql += ' AND league = ?'
      params.push(league)
    }

    sql += ' ORDER BY league ASC, id ASC'
    const rows = db.prepare(sql).all(...params) as any[]

    return rows.map((row) => normalizeGame({
      id: row.id,
      league: String(row.league || '').toUpperCase() as League,
      season: row.season || seasonFromDate(date),
      game_date: row.game_date,
      home_team: row.home_team,
      away_team: row.away_team,
      home_score: row.home_score,
      away_score: row.away_score,
      stadium: row.stadium || row.stadium_id || '',
      status: normalizeStatus(row.status),
      game_time: row.game_time || '',
      game_pk: row.game_pk || '',
      source: 'SQLite fallback',
    })).filter((game) => LEAGUES.includes(game.league))
  } catch (err) {
    console.error('[games][fallback] failed:', err)
    return []
  }
}

function sortGames(games: GameRecord[]): GameRecord[] {
  const leagueOrder = new Map(LEAGUES.map((lg, idx) => [lg, idx]))
  return [...games].sort((a, b) => {
    const leagueDiff = (leagueOrder.get(a.league) ?? 99) - (leagueOrder.get(b.league) ?? 99)
    if (leagueDiff !== 0) return leagueDiff
    return (a.game_time || '99:99').localeCompare(b.game_time || '99:99')
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = normalizeDate(searchParams.get('date'))
  const requestedLeague = normalizeLeague(searchParams.get('league'))
  const targetLeagues = requestedLeague ? [requestedLeague] : LEAGUES

  const settled = await Promise.allSettled(
    targetLeagues.map(async (league) => ({ league, games: await fetchLeagueGames(league, date) }))
  )

  const errors: Array<{ league: League; message: string }> = []
  let games: GameRecord[] = []

  settled.forEach((result, index) => {
    const league = targetLeagues[index]
    if (result.status === 'fulfilled') {
      games.push(...result.value.games)
      return
    }

    errors.push({ league, message: result.reason instanceof Error ? result.reason.message : String(result.reason) })
    games.push(...readDbFallback(date, league))
  })

  games = sortGames(uniqueGames(games))

  return Response.json({
    success: errors.length === 0,
    date,
    league: requestedLeague || 'ALL',
    games,
    total: games.length,
    errors,
  })
}
