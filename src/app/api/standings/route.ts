import { proxyCentralApi } from '@/lib/central-api-proxy'
import fallbackData from './fallback.json'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type StandingsBlock = {
  league: string
  teams: any[]
}

const FALLBACK_GROUPS = fallbackData as Record<string, any[]>

function requestedLeague(request: Request): string {
  const url = new URL(request.url)
  return (url.searchParams.get('league') || 'npb').toLowerCase()
}

function requestWithDefaultLeague(request: Request): Request {
  const url = new URL(request.url)
  if (!url.searchParams.get('league')) {
    url.searchParams.set('league', 'npb')
  }
  return new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: ['GET', 'HEAD'].includes(request.method.toUpperCase()) ? undefined : request.body,
  })
}

function dedupeTeams(teams: any[]): any[] {
  const seen = new Set<string>()
  return teams.filter((team) => {
    const key = String(team?.team_name ?? team?.name ?? team?.team ?? '').trim()
    if (!key) return false
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function normalizeFallbackBlocks(league: string): StandingsBlock[] {
  const pick = (key: string): StandingsBlock => ({
    league: key,
    teams: dedupeTeams(Array.isArray(FALLBACK_GROUPS[key]) ? FALLBACK_GROUPS[key] : []),
  })

  if (league === 'npb') return [pick('NPB_CENTRAL'), pick('NPB_PACIFIC')]
  if (league === 'cpbl') return [pick('CPBL')]
  return []
}

function extractBlocksFromPayload(payload: any): any[] {
  const inner = payload?.data ?? payload
  if (Array.isArray(inner)) return inner
  if (Array.isArray(inner?.data)) return inner.data
  if (Array.isArray(inner?.blocks)) return inner.blocks
  if (Array.isArray(inner?.standings)) return inner.standings
  return []
}

function hasUsableStandings(payload: any): boolean {
  const blocks = extractBlocksFromPayload(payload)
  return blocks.some((block) => Array.isArray(block?.teams) && block.teams.length > 0)
}

function fallbackResponse(league: string) {
  return Response.json({
    success: true,
    data: {
      source: 'fallback',
      season: new Date().getFullYear(),
      snapshot_date: new Date().toISOString().slice(0, 10),
      data: normalizeFallbackBlocks(league),
    },
    warnings: ['standings-upstream-empty-or-unavailable'],
  })
}

export async function GET(request: Request) {
  const league = requestedLeague(request)
  const upstreamRequest = requestWithDefaultLeague(request)

  try {
    const response = await proxyCentralApi(upstreamRequest, '/api/baseball/standings')
    if (!response.ok) throw new Error(`Upstream status: ${response.status}`)

    const payload = await response.json()
    if (!hasUsableStandings(payload)) {
      return fallbackResponse(league)
    }

    return Response.json(payload)
  } catch {
    return fallbackResponse(league)
  }
}
