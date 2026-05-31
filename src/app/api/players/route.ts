import fs from 'fs'
import path from 'path'

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

// 從 JSON 載入球員主名冊 + 合併 overrides
function loadPlayers(): Player[] {
  const playersPath = path.join(DATA_DIR, 'overseas-players.json')
  if (!fs.existsSync(playersPath)) return []

  const raw = fs.readFileSync(playersPath, 'utf-8')
  const players: Player[] = JSON.parse(raw)

  const overridePath = path.join(DATA_DIR, 'player-overrides.json')
  if (fs.existsSync(overridePath)) {
    const overrideRaw = fs.readFileSync(overridePath, 'utf-8')
    const overrides: OverrideFile = JSON.parse(overrideRaw)
    for (const [pid, patch] of Object.entries(overrides.overrides)) {
      const idx = players.findIndex(p => p.player_id === pid)
      if (idx !== -1) {
        players[idx] = { ...players[idx], ...patch }
      }
    }
  }

  return players
}

// GET /api/players — 旅外球員一覽（JSON source of truth）
export async function GET(request: Request) {
  const players = loadPlayers()

  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country')
  const level = searchParams.get('level')
  const position = searchParams.get('position')
  const search = searchParams.get('search')

  let filtered = [...players]

  if (country) {
    filtered = filtered.filter(p => p.country === country.toUpperCase())
  }
  if (level) {
    filtered = filtered.filter(p => p.current_level === level)
  }
  if (position) {
    filtered = filtered.filter(p => p.position === position.toUpperCase())
  }
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(p =>
      p.name_zh.includes(q) ||
      p.name_en.toLowerCase().includes(q) ||
      p.organization.toLowerCase().includes(q) ||
      p.team_name.toLowerCase().includes(q)
    )
  }

  // 按層級排序
  const LEVEL_ORDER: Record<string, number> = {
    'MLB': 0, '1軍': 1, '3A': 2, '2A': 3, 'High-A': 4, 'Low-A': 5, 'Rookie': 6,
    '支配下': 1, '2軍': 5, '育成': 7,
  }
  filtered.sort((a, b) => {
    const la = LEVEL_ORDER[a.current_level] ?? 99
    const lb = LEVEL_ORDER[b.current_level] ?? 99
    if (la !== lb) return la - lb
    return a.name_zh.localeCompare(b.name_zh, 'zh')
  })

  return Response.json({
    players: filtered,
    total: filtered.length,
    meta: {
      source: 'overseas-players.json',
      last_updated: '2026-05-22',
    },
  })
}
