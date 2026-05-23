#!/usr/bin/env node
/**
 * Crawl MLB Standings → SQLite
 * 
 * Fetches current MLB standings and stores them in baseball.db
 * for historical tracking and fast serving.
 */

const path = require('path')
const fs = require('fs')
const DB_PATH = process.env.BASEBALL_DB_PATH || path.join(__dirname, '..', 'data', 'baseball.db')

async function crawlMLB() {
  const Database = require('better-sqlite3')
  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')

  const today = new Date().toISOString().slice(0, 10)
  const season = 2026
  let inserted = 0

  try {
    console.log(`[mlb] Fetching MLB standings...`)
    const res = await fetch('https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2026&standingsTypes=regularSeason')
    const data = await res.json()
    const records = data.records || []

    const MLB_DIVISIONS = {
      200: { league: 'AL', div: 'West' },
      201: { league: 'AL', div: 'East' },
      202: { league: 'AL', div: 'Central' },
      203: { league: 'NL', div: 'West' },
      204: { league: 'NL', div: 'East' },
      205: { league: 'NL', div: 'Central' },
    }

    const insert = db.prepare(`
      INSERT OR IGNORE INTO standings (league, division, season, snapshot_date, rank, team_name, games, wins, losses, draws, win_pct, games_back, streak)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const tx = db.transaction(() => {
      for (const r of records) {
        const divInfo = MLB_DIVISIONS[r.division?.id] || { league: 'MLB', div: 'Unknown' }
        const teams = r.teamRecords || []

        for (const t of teams) {
          const w = t.wins || 0
          const l = t.losses || 0
          const total = w + l
          const pct = total > 0 ? `.${String(Math.round(w / total * 1000)).padStart(3, '0')}` : '.000'

          insert.run(
            divInfo.league,
            divInfo.div,
            season,
            today,
            parseInt(t.divisionRank) || 0,
            t.team?.name || '?',
            total,
            w,
            l,
            0,
            pct,
            t.gamesBack === '-' || t.gamesBack === 0 ? '-' : (t.gamesBack || '-'),
            t.streak?.streakCode || ''
          )
          inserted++
        }
      }
    })

    tx()
    console.log(`[mlb] ✅ ${inserted} records inserted for ${today}`)

    db.prepare(`INSERT INTO crawl_log (source, status, rows_inserted, finished_at) VALUES ('mlb', 'success', ?, datetime('now'))`).run(inserted)
  } catch (err) {
    console.error(`[mlb] ❌ Failed:`, err.message)
    db.prepare(`INSERT INTO crawl_log (source, status, rows_inserted, error_message, finished_at) VALUES ('mlb', 'failed', 0, ?, datetime('now'))`).run(err.message)
  } finally {
    db.close()
  }
}

crawlMLB()
