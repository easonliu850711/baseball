#!/usr/bin/env node
/**
 * 🕷️ Baseball Data Crawler
 *
 * Usage:
 *   node scripts/crawl-all.js              # Crawl all sources
 *   node scripts/crawl-all.js mlb          # Just MLB standings
 *   node scripts/crawl-all.js npb-schedule # NPB 賽程
 *   node scripts/crawl-all.js cpbl-schedule # CPBL 賽程
 *   node scripts/crawl-all.js all-schedule # NPB + CPBL 賽程
 */

const sources = process.argv.slice(2)

async function run() {
  const all = sources.length === 0

  if (all || sources.includes('mlb')) {
    console.log('\n=== 🗽 MLB ===')
    await require('./crawl-mlb')()
  }

  if (all || sources.includes('npb-schedule') || sources.includes('all-schedule')) {
    console.log('\n=== 🇯🇵 NPB 賽程 ===')
    await require('./crawl-npb-schedule')()
  }

  if (all || sources.includes('cpbl-schedule') || sources.includes('all-schedule')) {
    console.log('\n=== 🇹🇼 CPBL 賽程 ===')
    await require('./crawl-cpbl-schedule')()
  }

  console.log('\n✅ 所有爬取任務完成')
}

run().catch(err => {
  console.error('❌ 爬取失敗:', err)
  process.exit(1)
})
