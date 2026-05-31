#!/usr/bin/env node
/**
 * 每日旅外球員新聞搜尋腳本
 *
 * 用法: node scripts/fetch-player-news.mjs
 *
 * 流程:
 *   1. 讀取 src/data/overseas-players.json 取得所有球員
 *   2. 用 web_search 搜尋每位球員的最新新聞（先限日本組）
 *   3. 輸出 JSON 供同步用
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '..', 'src', 'data')
const OUTPUT_DIR = path.resolve(__dirname, '..', 'tmp')

// 讀取球員名冊
function loadPlayers() {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'overseas-players.json'), 'utf-8')
  return JSON.parse(raw)
}

// 日本球員 — 目前先聚焦這裡
function getJapanPlayers(players) {
  return players.filter(p => p.country === 'JP')
}

function main() {
  const players = loadPlayers()
  const japanPlayers = getJapanPlayers(players)

  console.log(`📡 旅外球員新聞搜尋腳本`)
  console.log(`   白名單共 ${players.length} 位`)
  console.log(`   日本組 ${japanPlayers.length} 位`)
  console.log()

  for (const p of japanPlayers) {
    console.log(`   [${p.name_zh}] ${p.name_en} — ${p.organization} ${p.current_level}`)
  }

  // 輸出搜尋關鍵字清單（方便 cron job 使用）
  const searchQueries = japanPlayers.map(p => ({
    player_id: p.player_id,
    name_zh: p.name_zh,
    name_en: p.name_en,
    queries: [
      `${p.name_zh} 旅日 棒球`,
      `${p.name_en} NPB`,
    ],
  }))

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'player-search-queries.json'),
    JSON.stringify(searchQueries, null, 2)
  )

  console.log()
  console.log(`✅ 搜尋關鍵字已輸出至 tmp/player-search-queries.json`)
  console.log(`   ${japanPlayers.length} 位日本組球員準備搜尋`)
}

main()
