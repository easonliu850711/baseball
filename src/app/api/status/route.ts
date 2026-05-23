import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  initSchema()
  const db = getDb()

  // Total counts
  const playerCount = (db.prepare('SELECT COUNT(*) as c FROM players').get() as any).c
  const standingsCount = (db.prepare('SELECT COUNT(*) as c FROM standings').get() as any).c
  const gameCount = (db.prepare('SELECT COUNT(*) as c FROM games').get() as any).c
  const newsCount = (db.prepare('SELECT COUNT(*) as c FROM player_news').get() as any).c

  // Latest crawl
  const latestCrawl = db.prepare(`
    SELECT * FROM crawl_log ORDER BY started_at DESC LIMIT 5
  `).all()

  // Latest snapshot date
  const latestSnapshot = db.prepare(`
    SELECT snapshot_date FROM standings ORDER BY snapshot_date DESC LIMIT 1
  `).get() as any

  return Response.json({
    status: 'ok',
    db: {
      players: playerCount,
      standings: standingsCount,
      games: gameCount,
      news: newsCount,
    },
    dbSize: (db.pragma('page_count') as any)[0]?.page_count * (db.pragma('page_size') as any)[0]?.page_size || 0,
    latestSnapshot: latestSnapshot?.snapshot_date || null,
    latestCrawl,
  })
}
