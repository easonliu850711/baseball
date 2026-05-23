import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/players — 旅外球員一覽
export async function GET(request: Request) {
  initSchema()
  const db = getDb()

  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country') || ''
  const position = searchParams.get('position') || ''
  const level = searchParams.get('level') || ''
  const search = searchParams.get('search') || ''

  let sql = 'SELECT * FROM players WHERE 1=1'
  const params: any[] = []

  if (country) {
    sql += ' AND country = ?'
    params.push(country.toUpperCase())
  }
  if (position) {
    sql += ' AND position = ?'
    params.push(position.toUpperCase())
  }
  if (level) {
    sql += ' AND current_level = ?'
    params.push(level)
  }
  if (search) {
    sql += ' AND (name_zh LIKE ? OR name_en LIKE ? OR organization LIKE ?)'
    const q = `%${search}%`
    params.push(q, q, q)
  }

  sql += ' ORDER BY country, current_level, name_zh'

  const rows = db.prepare(sql).all(...params)
  return Response.json({ players: rows, total: rows.length })
}
