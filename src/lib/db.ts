import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const DB_PATH = process.env.BASEBALL_DB_PATH || path.join(process.cwd(), 'data', 'baseball.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dbDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  db = new Database(DB_PATH)

  // WAL mode for better concurrent reads
  db.pragma('journal_mode = WAL')
  db.pragma('busy_timeout = 5000')

  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
