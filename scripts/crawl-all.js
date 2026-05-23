#!/usr/bin/env node
/**
 * 🕷️ Baseball Data Crawler
 *
 * Usage:
 *   node scripts/crawl-all.js          # Crawl all sources
 *   node scripts/crawl-all.js mlb      # Just MLB
 *   node scripts/crawl-all.js npb      # Just NPB (TODO)
 */

const sources = process.argv.slice(2)

async function run() {
  const tasks = sources.length === 0 || sources.includes('mlb')
    ? ['mlb']
    : sources

  for (const task of tasks) {
    switch (task) {
      case 'mlb':
        await require('./crawl-mlb')()
        break
      // TODO: NPB / CPBL / KBO crawlers
      default:
        console.log(`[crawl] Unknown source: ${task}`)
    }
  }
}

run().catch(console.error)
