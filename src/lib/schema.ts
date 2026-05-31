import { getDb } from './db'

type BaseballDb = ReturnType<typeof getDb>


function migratePlayerNewsAwayFromPlayersForeignKey(db: BaseballDb): void {
  const foreignKeys = db.prepare('PRAGMA foreign_key_list(player_news)').all() as Array<{ table: string }>
  const hasPlayersForeignKey = foreignKeys.some(fk => fk.table === 'players')

  if (!hasPlayersForeignKey) return

  db.pragma('foreign_keys = OFF')

  try {
    db.transaction(() => {
      db.exec(`
        DROP TABLE IF EXISTS player_news_new;

        CREATE TABLE player_news_new (
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          player_id       TEXT NOT NULL,
          title           TEXT NOT NULL,
          summary         TEXT,
          url             TEXT,
          source          TEXT,
          published_at    TEXT,
          category        TEXT DEFAULT 'general',
          created_at      TEXT DEFAULT (datetime('now'))
        );

        INSERT INTO player_news_new (
          id, player_id, title, summary, url, source, published_at, category, created_at
        )
        SELECT
          id, player_id, title, summary, url, source, published_at, category, created_at
        FROM player_news;

        DROP TABLE player_news;
        ALTER TABLE player_news_new RENAME TO player_news;
      `)
    })()
  } finally {
    db.pragma('foreign_keys = ON')
  }
}

function dedupePlayerNews(db: BaseballDb): void {
  db.exec(`
    DELETE FROM player_news
    WHERE url IS NOT NULL
      AND url <> ''
      AND id NOT IN (
        SELECT MIN(id)
        FROM player_news
        WHERE url IS NOT NULL AND url <> ''
        GROUP BY player_id, url
      );
  `)
}

function ensurePlayerNewsIndexes(db: BaseballDb): void {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_player_news_player ON player_news(player_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_player_news_unique ON player_news(player_id, url);
    CREATE INDEX IF NOT EXISTS idx_player_news_date ON player_news(published_at);
  `)
}

export function initSchema(): void {
  const db = getDb()

  db.exec(`
    -- ================================================================
    -- 🏟️ 球場資訊
    -- ================================================================
    CREATE TABLE IF NOT EXISTS stadiums (
      id              TEXT PRIMARY KEY,
      name_zh         TEXT NOT NULL,
      name_jp         TEXT,
      name_en         TEXT,
      league          TEXT NOT NULL,  -- NPB / CPBL / MLB / KBO
      team_name       TEXT,
      city            TEXT,
      capacity        INTEGER,
      opened          INTEGER,
      latitude        REAL,
      longitude       REAL,
      image_url       TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    -- ================================================================
    -- ⚾ 各國賽季戰績（每日快照）
    -- ================================================================
    CREATE TABLE IF NOT EXISTS standings (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      league          TEXT NOT NULL,  -- NPB / CPBL / MLB / KBO
      division        TEXT,           -- 央聯/洋聯, AL East, etc.
      season          INTEGER NOT NULL DEFAULT 2026,
      snapshot_date   TEXT NOT NULL,  -- YYYY-MM-DD
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

    -- Index for fast lookup
    CREATE INDEX IF NOT EXISTS idx_standings_snapshot ON standings(league, season, snapshot_date);
    CREATE INDEX IF NOT EXISTS idx_standings_team ON standings(team_name, league);

    -- ================================================================
    -- 🧢 台灣旅外球員
    -- ================================================================
    CREATE TABLE IF NOT EXISTS players (
      id              TEXT PRIMARY KEY,
      name_zh         TEXT NOT NULL,
      name_en         TEXT,
      country         TEXT NOT NULL,  -- US / JP / KR
      league          TEXT,           -- MLB / MiLB / NPB / KBO
      organization    TEXT,
      team_name       TEXT,
      current_level   TEXT,           -- MLB / 3A / 2A / 1軍 / 2軍
      roster_status   TEXT,
      position        TEXT,
      bats_throws     TEXT,           -- R/R, L/L, S/R etc.
      birth_date      TEXT,
      height_cm       INTEGER,
      weight_kg       INTEGER,
      confidence      TEXT DEFAULT 'medium',  -- high / medium / low
      needs_review    INTEGER DEFAULT 0,
      notes           TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    -- ================================================================
    -- 📊 球員賽季成績（逐年累積）
    -- ================================================================
    CREATE TABLE IF NOT EXISTS player_stats (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id       TEXT NOT NULL REFERENCES players(id),
      season          INTEGER NOT NULL DEFAULT 2026,
      league          TEXT NOT NULL,

      -- 投手
      g               INTEGER DEFAULT 0,  -- 出賽
      gs              INTEGER DEFAULT 0,  -- 先發
      w               INTEGER DEFAULT 0,  -- 勝
      l               INTEGER DEFAULT 0,  -- 敗
      sv              INTEGER DEFAULT 0,  -- 救援
      hld             INTEGER DEFAULT 0,  -- 中繼
      ip              REAL DEFAULT 0,     -- 局數
      ha              INTEGER DEFAULT 0,  -- 被安打
      hr              INTEGER DEFAULT 0,  -- 被全壘打
      bb              INTEGER DEFAULT 0,  -- 四死球
      so              INTEGER DEFAULT 0,  -- 三振
      era             REAL,               -- 防禦率
      whip            REAL,               -- WHIP

      -- 打者
      avg             REAL,               -- 打擊率
      obp             REAL,               -- 上壘率
      slg             REAL,               -- 長打率
      ops             REAL,               -- OPS
      g_batter        INTEGER DEFAULT 0,  -- 出賽(野手)
      pa              INTEGER DEFAULT 0,  -- 打席
      ab              INTEGER DEFAULT 0,  -- 打數
      r               INTEGER DEFAULT 0,  -- 得分
      h               INTEGER DEFAULT 0,  -- 安打
      double          INTEGER DEFAULT 0,  -- 二安
      triple          INTEGER DEFAULT 0,  -- 三安
      hr_batter       INTEGER DEFAULT 0,  -- 全壘打
      rbi             INTEGER DEFAULT 0,  -- 打點
      sb              INTEGER DEFAULT 0,  -- 盜壘
      cs              INTEGER DEFAULT 0,  -- 盜壘刺
      bb_batter       INTEGER DEFAULT 0,  -- 四壞
      so_batter       INTEGER DEFAULT 0,  -- 三振(打者)

      updated_at      TEXT DEFAULT (datetime('now')),
      UNIQUE(player_id, season, league)
    );

    -- ================================================================
    -- 📰 旅外球員新聞/動向
    -- ================================================================
    CREATE TABLE IF NOT EXISTS player_news (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      -- 旅外球員主資料已改由 src/data/overseas-players.json 維護，
      -- 因此新聞只保存 player_id 字串，不再 FK 到 SQLite players table。
      player_id       TEXT NOT NULL,
      title           TEXT NOT NULL,
      summary         TEXT,
      url             TEXT,
      source          TEXT,
      published_at    TEXT,
      category        TEXT DEFAULT 'general',  -- general / injury / promotion / trade
      created_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_player_news_player ON player_news(player_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_player_news_unique ON player_news(player_id, url);
    CREATE INDEX IF NOT EXISTS idx_player_news_date ON player_news(published_at);

    -- ================================================================
    -- 📅 比賽賽程/結果
    -- ================================================================
    CREATE TABLE IF NOT EXISTS games (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      league          TEXT NOT NULL,
      season          INTEGER NOT NULL DEFAULT 2026,
      game_date       TEXT NOT NULL,
      home_team       TEXT NOT NULL,
      away_team       TEXT NOT NULL,
      home_score      INTEGER,
      away_score      INTEGER,
      status          TEXT DEFAULT 'scheduled',  -- scheduled / live / finished / postponed
      stadium_id      TEXT,
      home_team_id    TEXT,
      away_team_id    TEXT,
      game_pk         TEXT,           -- external game ID (e.g. MLB game_pk)
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_games_date ON games(league, game_date);
    CREATE INDEX IF NOT EXISTS idx_games_team ON games(home_team, away_team);

    -- ================================================================
    -- ⏰ 爬蟲排程記錄
    -- ================================================================
    CREATE TABLE IF NOT EXISTS crawl_log (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      source          TEXT NOT NULL,   -- mlb / npb / cpbl / kbo
      status          TEXT NOT NULL,   -- success / failed
      rows_inserted   INTEGER DEFAULT 0,
      error_message   TEXT,
      started_at      TEXT DEFAULT (datetime('now')),
      finished_at     TEXT
    );
  `)

  migratePlayerNewsAwayFromPlayersForeignKey(db)
  dedupePlayerNews(db)
  ensurePlayerNewsIndexes(db)
}
