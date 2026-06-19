'use client'

import { extractMeta, extractStandingsBlocks } from '@/lib/api-response'
import { getTeamDisplayName } from '@/lib/teamNames'

export interface Team {
  rank: number
  name: string
  g: number
  w: number
  l: number
  d?: number
  pct: string
  gb: string
  color?: string
}

interface LeagueBlock {
  league?: string
  icon?: string
  teams?: any[]
}

export type LeagueType = 'npb' | 'cpbl' | 'mlb' | 'kbo'

export interface StandingsFetchResult {
  teams: Team[]
  meta: {
    source?: string
    snapshot?: string
    generatedAt?: string
  }
}

function normalizeTeam(row: any, fallbackRank: number): Team {
  return {
    rank: Number(row.rank ?? fallbackRank),
    name: String(row.name ?? row.team_name ?? row.team ?? ''),
    g: Number(row.g ?? row.games ?? 0),
    w: Number(row.w ?? row.wins ?? 0),
    l: Number(row.l ?? row.losses ?? 0),
    d: Number(row.d ?? row.draws ?? 0),
    pct: String(row.pct ?? row.win_pct ?? '.000'),
    gb: String(row.gb ?? row.games_back ?? '-'),
    color: row.color,
  }
}

export async function fetchStandingsData(league: LeagueType): Promise<StandingsFetchResult> {
  const endpoint = league === 'kbo' ? '/api/kbo' : `/api/standings?league=${league}`
  const res = await fetch(endpoint, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Standings fetch failed for ${league}`)

  const payload = await res.json()
  const blocks = extractStandingsBlocks(payload) as LeagueBlock[]
  const teams = blocks.flatMap((block) => (block.teams || []).map(normalizeTeam))
  const meta = extractMeta(payload)

  return {
    teams,
    meta: {
      source: meta.source || 'unknown',
      snapshot: meta.snapshot_date || meta.last_updated || '',
      generatedAt: meta.generatedAt || '',
    },
  }
}

export async function fetchStandings(league: LeagueType): Promise<Team[]> {
  return (await fetchStandingsData(league)).teams
}

interface StandingsTableProps {
  teams: Team[]
  compact?: boolean
}

export default function StandingsTable({ teams, compact = true }: StandingsTableProps) {
  if (!teams || teams.length === 0) {
    return (
      <div className="border-y border-white/[0.06] py-8 text-center text-sm text-stone-gray/50">
        暫無戰績資料
      </div>
    )
  }

  const rows = teams.slice(0, compact ? 6 : undefined)
  const showD = !compact || rows.some(t => Number(t.d || 0) > 0)

  return (
    <div className="overflow-x-auto border-y border-white/[0.08]">
      <table className="w-full min-w-[520px] text-[13px] border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-stone-gray/50 text-[10px] uppercase tracking-wider">
            <th className="text-left py-2 pr-2 w-8 font-normal">#</th>
            <th className="text-left py-2 pr-3 font-normal">Team</th>
            <th className="text-center py-2 pr-2 w-10 font-normal">W</th>
            <th className="text-center py-2 pr-2 w-10 font-normal">L</th>
            {showD && <th className="text-center py-2 pr-2 w-10 font-normal">D</th>}
            <th className="text-center py-2 pr-2 w-16 font-normal">PCT</th>
            <th className="text-center py-2 pr-2 w-12 font-normal">GB</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((team, idx) => {
            const rank = team.rank || idx + 1
            const isPlayoff = rank <= 3
            const isFirst = rank === 1
            return (
              <tr
                key={`${team.name}-${rank}`}
                className={`border-b border-white/[0.04] last:border-b-0 ${isPlayoff ? 'bg-ocean-wave/[0.03]' : ''}`}
              >
                <td className="py-2.5 pr-2">
                  <div className={`w-6 h-6 flex items-center justify-center text-[11px] font-medium ${isFirst ? 'border-l-[3px] border-ocean-wave' : ''}`}>
                    {rank}
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-shell-white font-medium truncate max-w-[220px]">
                  {getTeamDisplayName(team.name)}
                </td>
                <td className="text-center py-2.5 pr-2 text-seafoam font-medium">{team.w}</td>
                <td className="text-center py-2.5 pr-2 text-coral-light font-medium">{team.l}</td>
                {showD && <td className="text-center py-2.5 pr-2 text-stone-gray/50">{team.d ?? 0}</td>}
                <td className="text-center py-2.5 pr-2 font-mono text-stone-gray">{team.pct}</td>
                <td className="text-center py-2.5 pr-2 text-stone-gray/40">{team.gb || '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
