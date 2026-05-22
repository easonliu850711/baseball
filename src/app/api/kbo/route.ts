import { NextResponse } from 'next/server'

const KBO_COLORS: Record<string, string> = {
  'SAMSUNG': 'text-blue-400',
  'LG': 'text-red-400',
  'KT': 'text-orange-400',
  'SSG': 'text-yellow-400',
  'KIA': 'text-red-500',
  'DOOSAN': 'text-indigo-400',
  'HANWHA': 'text-orange-500',
  'LOTTE': 'text-pink-400',
  'KIWOOM': 'text-red-300',
  'NC': 'text-blue-300',
}

export async function GET() {
  try {
    const res = await fetch('https://eng.koreabaseball.com/Standings/TeamStandings.aspx', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 } // cache 5 min
    })
    const html = await res.text()

    const tableMatch = html.match(/<table[^>]*summary="team standings"[^>]*>[\s\S]*?<\/table>/i)
    if (!tableMatch) {
      return NextResponse.json({ league: 'KBO 聯賽', icon: '🇰🇷', teams: [], error: 'table_not_found' })
    }

    const table = tableMatch[0]
    const rows = table.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []
    const teams: any[] = []

    for (const row of rows) {
      const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g)
      if (!cells || cells.length < 8) continue

      const clean = cells.map((c: string) => c.replace(/<[^>]+>/g, '').trim())
      const rank = parseInt(clean[0])
      if (isNaN(rank) || rank < 1 || rank > 10) continue

      const name = clean[1]
      const g = parseInt(clean[2]) || 0
      const w = parseInt(clean[3]) || 0
      const l = parseInt(clean[4]) || 0
      const d = parseInt(clean[5]) || 0
      const pct = clean[6]
      const gb = clean[7] === '0.0' ? '-' : clean[7]

      teams.push({ rank, name, g, w, l, d, pct, gb, color: KBO_COLORS[name?.toUpperCase()] || 'text-gray-400' })
    }

    return NextResponse.json({ league: 'KBO 聯賽', icon: '🇰🇷', teams })
  } catch (err: any) {
    return NextResponse.json({ league: 'KBO 聯賽', icon: '🇰🇷', teams: [], error: err.message }, { status: 500 })
  }
}
