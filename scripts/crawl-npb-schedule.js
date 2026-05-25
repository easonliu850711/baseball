#!/usr/bin/env node
/**
 * 🕷️ NPB 賽程爬蟲
 *
 * 從 NPB 官方 API 爬取賽程，寫入 SQLite games 表
 *
 * Usage: node scripts/crawl-npb-schedule.js <yyyy-mm-dd>
 *   - 無日期參數：爬今日起 30 天
 *   - 有日期參數：爬指定日期前後 15 天
 */

const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', 'data', 'baseball.db')
const BASE = 'https://baseball-data.com/api/v1/npb'

const TEAM_MAP = {
  'Giants': '讀賣巨人',
  'Tigers': '阪神虎',
  'Dragons': '中日龍',
  'Carp': '廣島鯉魚',
  'Swallows': '養樂多燕子',
  'BayStars': 'DeNA海星',
  'Buffaloes': '歐力士猛牛',
  'Hawks': '軟銀鷹',
  'Marines': '羅德海洋',
  'Lions': '西武獅',
  'Fighters': '日本火腿',
  'Eagles': '樂天金鷹',
}

function translateTeam(name) {
  if (!name) return name
  const en = Object.keys(TEAM_MAP).find(k => name.includes(k) || name === k)
  return en ? TEAM_MAP[en] : name
}

async function crawlNPB(fromDate, toDate) {
  const db = new Database(DB_PATH)

  // 確保 games 表有欄位
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      league TEXT NOT NULL DEFAULT 'NPB',
      game_date TEXT NOT NULL,
      home_team TEXT,
      away_team TEXT,
      home_score INTEGER,
      away_score INTEGER,
      stadium TEXT,
      status TEXT DEFAULT 'scheduled',
      game_time TEXT,
      season INTEGER DEFAULT 2026,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)
  // 確保唯一索引
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_games_unique
    ON games(league, game_date, home_team, away_team)
  `)

  const insert = db.prepare(`
    INSERT OR REPLACE INTO games
      (league, game_date, home_team, away_team, home_score, away_score, stadium, status, game_time, season)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((games) => {
    for (const g of games) insert.run(...g)
  })

  let total = 0
  let current = new Date(fromDate)

  while (current <= toDate) {
    const dateStr = current.toISOString().slice(0, 10)
    const [y, m, d] = dateStr.split('-')
    const url = `${BASE}/schedule/${y}${m}${d}`

    console.log(`  📡 ${dateStr} ...`)

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'StudioImori/1.0' },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) {
        console.log(`     ⚠️  ${res.status}`)
        current.setDate(current.getDate() + 1)
        continue
      }

      const data = await res.json()
      const games = data?.data || data?.games || data || []

      if (!Array.isArray(games) || games.length === 0) {
        console.log(`     📭 無賽程`)
        current.setDate(current.getDate() + 1)
        continue
      }

      const rows = []
      for (const g of games) {
        const home = translateTeam(g.home_team || g.home || '')
        const away = translateTeam(g.away_team || g.away || '')
        if (!home || !away) continue

        rows.push([
          'NPB',
          dateStr,
          home,
          away,
          g.home_score ?? g.homeScore ?? null,
          g.away_score ?? g.awayScore ?? null,
          g.stadium || g.venue || '',
          g.status || 'scheduled',
          g.game_time || g.time || g.start_time || '',
          2026,
        ])
      }

      if (rows.length > 0) {
        insertMany(rows)
        total += rows.length
        console.log(`     ✅ ${rows.length} 場寫入`)
      }
    } catch (err) {
      console.log(`     ❌ ${err.message}`)
    }

    current.setDate(current.getDate() + 1)
  }

  db.close()
  console.log(`\n📊 NPB 賽程爬取完成：共 ${total} 場`)
  return total
}

// ── 主程式 ──
const argDate = process.argv[2]
const today = new Date()

let fromDate, toDate

if (argDate && /^\d{4}-\d{2}-\d{2}$/.test(argDate)) {
  fromDate = new Date(argDate)
  fromDate.setDate(fromDate.getDate() - 15)
  toDate = new Date(argDate)
  toDate.setDate(toDate.getDate() + 15)
} else {
  fromDate = new Date()
  toDate = new Date()
  toDate.setDate(toDate.getDate() + 30)
}

// 格式化 YYYY-MM-DD
const fmt = (d) => d.toISOString().slice(0, 10)

console.log(`🕷️ NPB 賽程爬取 ${fmt(fromDate)} ~ ${fmt(toDate)}`)

crawlNPB(fromDate, toDate)
  .then(count => {
    console.log(`🏁 完成！共 ${count} 場寫入資料庫`)
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ 爬取失敗:', err)
    process.exit(1)
  })
