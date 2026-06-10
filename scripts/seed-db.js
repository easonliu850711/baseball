#!/usr/bin/env node
/**
 * Baseball DB Seed Script
 * 
 * Imports existing JSON data into SQLite:
 * 1. overseas-players.json → players table
 * 2. Hardcoded NPB/CPBL standings → standings table
 * 3. Initial schema creation
 */

const path = require('path')
const Database = require('better-sqlite3')
const fs = require('fs')

const DB_PATH = process.env.BASEBALL_DB_PATH || path.join(__dirname, '..', 'data', 'baseball.db')

function log(msg) {
  console.log(`[seed] ${msg}`)
}

function seed() {
  // Ensure data dir
  fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true })

  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('busy_timeout = 5000')

  log(`🔌 Connected to ${DB_PATH}`)

  // === 1. Schema ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id              TEXT PRIMARY KEY,
      name_zh         TEXT NOT NULL,
      name_en         TEXT,
      country         TEXT NOT NULL,
      league          TEXT,
      organization    TEXT,
      team_name       TEXT,
      current_level   TEXT,
      roster_status   TEXT,
      position        TEXT,
      bats_throws     TEXT,
      birth_date      TEXT,
      height_cm       INTEGER,
      weight_kg       INTEGER,
      confidence      TEXT DEFAULT 'medium',
      needs_review    INTEGER DEFAULT 0,
      notes           TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS standings (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      league          TEXT NOT NULL,
      division        TEXT,
      season          INTEGER NOT NULL DEFAULT 2026,
      snapshot_date   TEXT NOT NULL,
      rank            INTEGER NOT NULL,
      team_name       TEXT NOT NULL,
      games           INTEGER DEFAULT 0,
      wins            INTEGER DEFAULT 0,
      losses          INTEGER DEFAULT 0,
      draws           INTEGER DEFAULT 0,
      win_pct         TEXT,
      games_back      TEXT,
      color           TEXT,
      stadium         TEXT,
      streak          TEXT,
      created_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_standings_snapshot ON standings(league, season, snapshot_date);
    CREATE INDEX IF NOT EXISTS idx_standings_team ON standings(team_name, league);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_standings_unique_snapshot_rank
      ON standings(league, season, snapshot_date, rank, team_name);

    CREATE TABLE IF NOT EXISTS games (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      league          TEXT NOT NULL,
      season          INTEGER NOT NULL DEFAULT 2026,
      game_date       TEXT NOT NULL,
      home_team       TEXT NOT NULL,
      away_team       TEXT NOT NULL,
      home_score      INTEGER,
      away_score      INTEGER,
      status          TEXT DEFAULT 'scheduled',
      stadium_id      TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_games_date ON games(league, game_date);

    CREATE TABLE IF NOT EXISTS player_news (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id       TEXT NOT NULL REFERENCES players(id),
      title           TEXT NOT NULL,
      summary         TEXT,
      url             TEXT,
      source          TEXT,
      published_at    TEXT,
      category        TEXT DEFAULT 'general',
      created_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_player_news_player ON player_news(player_id);

    CREATE TABLE IF NOT EXISTS player_stats (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id       TEXT NOT NULL REFERENCES players(id),
      season          INTEGER NOT NULL DEFAULT 2026,
      league          TEXT NOT NULL,
      g               INTEGER DEFAULT 0,
      gs              INTEGER DEFAULT 0,
      w               INTEGER DEFAULT 0,
      l               INTEGER DEFAULT 0,
      sv              INTEGER DEFAULT 0,
      ip              REAL DEFAULT 0,
      ha              INTEGER DEFAULT 0,
      hr              INTEGER DEFAULT 0,
      bb              INTEGER DEFAULT 0,
      so              INTEGER DEFAULT 0,
      era             REAL,
      whip            REAL,
      avg             REAL,
      obp             REAL,
      slg             REAL,
      g_batter        INTEGER DEFAULT 0,
      pa              INTEGER DEFAULT 0,
      ab              INTEGER DEFAULT 0,
      r               INTEGER DEFAULT 0,
      h               INTEGER DEFAULT 0,
      double          INTEGER DEFAULT 0,
      triple          INTEGER DEFAULT 0,
      hr_batter       INTEGER DEFAULT 0,
      rbi             INTEGER DEFAULT 0,
      sb              INTEGER DEFAULT 0,
      cs              INTEGER DEFAULT 0,
      updated_at      TEXT DEFAULT (datetime('now')),
      UNIQUE(player_id, season, league)
    );

    CREATE TABLE IF NOT EXISTS crawl_log (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      source          TEXT NOT NULL,
      status          TEXT NOT NULL,
      rows_inserted   INTEGER DEFAULT 0,
      error_message   TEXT,
      started_at      TEXT DEFAULT (datetime('now')),
      finished_at     TEXT
    );
  `)



  // === Schema compatibility patches ===
  // Older seed versions created a smaller schema. Add missing columns safely.
  function ensureColumn(table, column, definition) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name)
    if (!cols.includes(column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
    }
  }

  ensureColumn('games', 'home_team_id', 'TEXT')
  ensureColumn('games', 'away_team_id', 'TEXT')
  ensureColumn('games', 'game_pk', 'TEXT')
  ensureColumn('player_stats', 'hld', 'INTEGER DEFAULT 0')
  ensureColumn('player_stats', 'ops', 'REAL')
  ensureColumn('player_stats', 'bb_batter', 'INTEGER DEFAULT 0')
  ensureColumn('player_stats', 'so_batter', 'INTEGER DEFAULT 0')

  log('✅ Schema initialized')

  // === 2. Seed Players ===
  const today = new Date().toISOString().slice(0, 10)
  let playerCount = 0

  const playersPath = path.join(__dirname, '..', 'src', 'data', 'overseas-players.json')
  if (fs.existsSync(playersPath)) {
    const raw = fs.readFileSync(playersPath, 'utf-8')
    let players
    try { players = JSON.parse(raw) } catch { players = [] }

    const insertPlayer = db.prepare(`
      INSERT OR REPLACE INTO players (id, name_zh, name_en, country, league, organization, team_name, current_level, roster_status, position, bats_throws, confidence, needs_review)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const tx = db.transaction(() => {
      for (const p of players) {
        insertPlayer.run(
          p.player_id,
          p.name_zh,
          p.name_en || null,
          p.country,
          p.league || null,
          p.organization || null,
          p.team_name || null,
          p.current_level || null,
          p.roster_status || null,
          p.position || null,
          p.bats_throws || null,
          p.confidence || 'medium',
          p.needs_review ? 1 : 0
        )
      }
    })

    tx()
    playerCount = players.length
    log(`✅ ${playerCount} players imported`)
  } else {
    log(`⚠️  overseas-players.json not found, skipping player seed`)
  }

  // === 3. Seed Standings (NPB + CPBL) ===
  // 需用 NPB_CENTRAL / NPB_PACIFIC / CPBL 作為 league 名稱以對應 API Route
  const standingsData = [
    // 🏔️ 央聯
    { league: 'NPB_CENTRAL', rank: 1, team: '養樂多', g: 44, w: 27, l: 17, d: 0, pct: '.614', gb: '-', color: 'text-green-400', stadium: '神宮球場' },
    { league: 'NPB_CENTRAL', rank: 2, team: '阪神',   g: 43, w: 25, l: 17, d: 1, pct: '.595', gb: '1.0', color: 'text-yellow-400', stadium: '甲子園' },
    { league: 'NPB_CENTRAL', rank: 3, team: '巨人',   g: 43, w: 24, l: 19, d: 0, pct: '.558', gb: '2.5', color: 'text-orange-500', stadium: '東京巨蛋' },
    { league: 'NPB_CENTRAL', rank: 4, team: 'DeNA',   g: 44, w: 20, l: 22, d: 2, pct: '.476', gb: '6.0', color: 'text-blue-400', stadium: '橫濱球場' },
    { league: 'NPB_CENTRAL', rank: 5, team: '廣島',   g: 41, w: 16, l: 23, d: 2, pct: '.410', gb: '8.5', color: 'text-red-500', stadium: '馬自達球場' },
    { league: 'NPB_CENTRAL', rank: 6, team: '中日',   g: 43, w: 14, l: 28, d: 1, pct: '.333', gb: '12.0', color: 'text-blue-600', stadium: '名古屋巨蛋' },
    // 🌊 洋聯
    { league: 'NPB_PACIFIC', rank: 1, team: '歐力士', g: 43, w: 25, l: 18, d: 0, pct: '.581', gb: '-', color: 'text-amber-500', stadium: '京瓷巨蛋' },
    { league: 'NPB_PACIFIC', rank: 2, team: '西武',   g: 45, w: 25, l: 19, d: 1, pct: '.568', gb: '0.5', color: 'text-emerald-400', stadium: '西武巨蛋' },
    { league: 'NPB_PACIFIC', rank: 3, team: '火腿',   g: 46, w: 23, l: 23, d: 0, pct: '.500', gb: '3.5', color: 'text-sky-400', stadium: 'ES CON FIELD' },
    { league: 'NPB_PACIFIC', rank: 4, team: '軟銀',   g: 42, w: 20, l: 22, d: 0, pct: '.476', gb: '4.5', color: 'text-yellow-400', stadium: 'PayPay巨蛋' },
    { league: 'NPB_PACIFIC', rank: 5, team: '羅德',   g: 43, w: 19, l: 24, d: 0, pct: '.442', gb: '6.0', color: 'text-stone-200', stadium: 'ZOZO海洋球場' },
    { league: 'NPB_PACIFIC', rank: 6, team: '樂天',   g: 43, w: 18, l: 24, d: 1, pct: '.429', gb: '6.5', color: 'text-red-400', stadium: '樂天生命球場' },
    // 🐉 CPBL
    { league: 'CPBL', rank: 1, team: '味全龍',  g: 36, w: 23, l: 13, d: 0, pct: '.639', gb: '-', color: 'text-red-500' },
    { league: 'CPBL', rank: 2, team: '富邦悍將', g: 33, w: 19, l: 14, d: 0, pct: '.576', gb: '2.5', color: 'text-blue-500' },
    { league: 'CPBL', rank: 3, team: '統一獅',  g: 35, w: 18, l: 16, d: 1, pct: '.529', gb: '4.0', color: 'text-orange-500' },
    { league: 'CPBL', rank: 4, team: '台鋼雄鷹', g: 37, w: 18, l: 18, d: 1, pct: '.500', gb: '5.0', color: 'text-emerald-400' },
    { league: 'CPBL', rank: 5, team: '樂天桃猿', g: 34, w: 14, l: 19, d: 1, pct: '.424', gb: '7.5', color: 'text-red-400' },
    { league: 'CPBL', rank: 6, team: '中信兄弟', g: 35, w: 11, l: 23, d: 1, pct: '.324', gb: '11.0', color: 'text-yellow-400' },
  ]

  const insertStanding = db.prepare(`
    INSERT OR IGNORE INTO standings (league, division, season, snapshot_date, rank, team_name, games, wins, losses, draws, win_pct, games_back, color, stadium)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  // 欄位順序：league, division, season, snapshot_date, rank, team_name, games, wins, losses, draws, win_pct, games_back, color, stadium
  const tx2 = db.transaction(() => {
    for (const s of standingsData) {
      insertStanding.run(s.league, null, 2026, today, s.rank, s.team, s.g, s.w, s.l, s.d, s.pct, s.gb, s.color || null, s.stadium || null)
    }
  })
  tx2()
  log(`✅ ${standingsData.length} standings records imported for ${today}`)

  // === 4. Log ===
  db.prepare(`INSERT INTO crawl_log (source, status, rows_inserted, finished_at) VALUES (?, ?, ?, datetime('now'))`).run('seed', 'success', playerCount + standingsData.length)

  db.close()
  log(`🎉 Seed complete!`)
}

seed()
