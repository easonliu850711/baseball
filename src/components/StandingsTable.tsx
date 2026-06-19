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
    rank: Number(row.rank ?? fallbackRank + 1),
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
      <div className="rounded-2xl border border-dashed border-ocean-light/10 bg-ocean-mid/20 py-10 text-center text-sm text-stone-gray/50">
        戰績資料整理中
      </div>
    )
  }

  const rows = teams.slice(0, compact ? 8 : undefined)
  const showD = !compact || rows.some(t => Number(t.d || 0) > 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-ocean-light/15">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-ocean-light/10 text-[10px] tracking-[0.18em] text-stone-gray/50">
              <th className="w-12 px-3 py-3 text-left font-semibold">#</th>
              <th className="px-3 py-3 text-left font-semibold">Team</th>
              <th className="w-14 px-3 py-3 text-center font-semibold">W</th>
              <th className="w-14 px-3 py-3 text-center font-semibold">L</th>
              {showD && <th className="w-14 px-3 py-3 text-center font-semibold">D</th>}
              <th className="w-20 px-3 py-3 text-center font-semibold">PCT</th>
              <th className="w-16 px-3 py-3 text-center font-semibold">GB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-light/10 bg-ocean-mid/20">
            {rows.map((team, idx) => {
              const rank = team.rank || idx + 1
              const isFirst = rank === 1
              return (
                <tr key={`${team.name}-${rank}`} className="hover:bg-ocean-mid/30">
                  <td className="px-3 py-3">
                    <span className={[
                      'inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold',
                      isFirst ? 'bg-amber-800/30 text-amber-400' : 'bg-ocean-mid/30 text-stone-gray'
                    ].join(' ')}>
                      {rank}
                    </span>
                  </td>
                  <td className="max-w-[260px] truncate px-3 py-3 font-semibold text-shell-white">
                    {getTeamDisplayName(team.name)}
                  </td>
                  <td className="px-3 py-3 text-center font-semibold text-emerald-400">{team.w}</td>
                  <td className="px-3 py-3 text-center font-semibold text-rose-400">{team.l}</td>
                  {showD && <td className="px-3 py-3 text-center text-stone-gray">{team.d ?? 0}</td>}
                  <td className="px-3 py-3 text-center font-mono text-stone-gray/60">{team.pct}</td>
                  <td className="px-3 py-3 text-center text-stone-gray/60">{team.gb === '-' ? '—' : team.gb}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
