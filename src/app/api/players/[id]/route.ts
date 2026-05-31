import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATA_DIR = path.join(process.cwd(), 'src', 'data')

interface Player {
  player_id: string
  name_zh: string
  name_en: string
  country: string
  league: string
  organization: string
  team_name: string
  current_level: string
  roster_status: string
  position: string
  bats_throws: string
  confidence: string
  needs_review?: boolean
}

interface OverrideFile {
  meta: { last_updated: string; description: string }
  overrides: Record<string, Partial<Player>>
}

function loadPlayers(): Player[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'overseas-players.json'), 'utf-8')
  const players: Player[] = JSON.parse(raw)
  const overridePath = path.join(DATA_DIR, 'player-overrides.json')
  if (fs.existsSync(overridePath)) {
    const overrides: OverrideFile = JSON.parse(fs.readFileSync(overridePath, 'utf-8'))
    for (const [pid, patch] of Object.entries(overrides.overrides)) {
      const idx = players.findIndex(p => p.player_id === pid)
      if (idx !== -1) players[idx] = { ...players[idx], ...patch }
    }
  }
  return players
}

// GET /api/players/[id] — single player profile
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const players = loadPlayers()
  const player = players.find(p => p.player_id === id)

  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  return Response.json({ player })
}
