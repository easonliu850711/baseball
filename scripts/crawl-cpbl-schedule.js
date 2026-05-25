#!/usr/bin/env node
/**
 * 🕷️ CPBL 賽程爬蟲
 *
 * 從 CPBL 官方網站爬取賽程
 *
 * Usage: node scripts/crawl-cpbl-schedule.js <yyyy> <month>
 *   - 無參數：爬 2026 年 5~10 月
 */

const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', 'data', 'baseball.db')
const BASE_URL = 'https://www.cpbl.com.tw/schedule'

async function crawlCPBL(year = 2026) {
  const db = new Database(DB_PATH)

  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      league TEXT NOT NULL DEFAULT 'CPBL',
      game_date TEXT NOT NULL,
      home_team TEXT,
      away_team TEXT,
      home_score INTEGER,
      away_score INTEGER,
      stadium TEXT,
      status TEXT DEFAULT 'scheduled',
      game_time TEXT,
      season INTEGER DEFAULT ${year},
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)
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
  const months = [5, 6, 7, 8, 9, 10]

  for (const month of months) {
    const url = `${BASE_URL}?year=${year}&month=${month}`
    console.log(`  📡 ${year}/${month} ...`)

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StudioImori/1.0)' },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) {
        console.log(`     ⚠️  HTTP ${res.status}`)
        continue
      }

      const html = await res.text()

      // 嘗試從 HTML 解析賽程表格
      // CPBL 官網結構：game_date, location, teams, scores
      const rows = []
      const dateRegex = /(\d{4})-(\d{2})-(\d{2})/g
      let match

      // 簡單解析：尋找日期 + 隊伍名稱模式
      const lines = html.split('\n')
      let currentDate = ''
      let currentStadium = ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        // 找日期
        const dateMatch = trimmed.match(/(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})[日]?/)
        if (dateMatch) {
          currentDate = `${dateMatch[1]}-${String(dateMatch[2]).padStart(2, '0')}-${String(dateMatch[3]).padStart(2, '0')}`
          continue
        }

        // 找球場
        if (trimmed.includes('球場') || trimmed.includes('棒球場')) {
          currentStadium = trimmed
          continue
        }

        // 找 VS 模式：兄弟 vs 統一等
        const vsMatch = trimmed.match(/([^\s]{2,4})\s*v[.s]\s*([^\s]{2,4})/)
        if (vsMatch && currentDate) {
          const away = vsMatch[1].trim()
          const home = vsMatch[2].trim()
          rows.push([date, home, away, currentStadium || ''])
        }
      }

      if (rows.length > 0) {
        const dbRows = rows.map(r => ['CPBL', r[0], r[1], r[2], null, null, r[3], 'scheduled', '', year])
        insertMany(dbRows)
        total += rows.length
        console.log(`     ✅ ${rows.length} 場寫入`)
      } else {
        console.log(`     📭 無法解析賽程（或該月無賽程）`)
      }
    } catch (err) {
      console.log(`     ❌ ${err.message}`)
    }
  }

  db.close()
  console.log(`\n📊 CPBL 賽程爬取完成：共 ${total} 場`)
  return total
}

const year = parseInt(process.argv[2]) || 2026
console.log(`🕷️ CPBL ${year} 賽程爬取`)

crawlCPBL(year)
  .then(count => {
    console.log(`🏁 完成！共 ${count} 場寫入資料庫`)
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ 爬取失敗:', err)
    process.exit(1)
  })
