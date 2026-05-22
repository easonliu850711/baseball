#!/bin/bash
# =============================================================
# 🌍 旅外球員數據爬取腳本 (V1)
# 分國家 dispatch + 差異比較 + JSON/CSV 輸出
#
# Usage: bash scripts/fetch-player-stats.sh [diff|full|csv]
# =============================================================
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_FILE="$BASE_DIR/src/data/overseas-players.json"
OVERRIDE_FILE="$BASE_DIR/src/data/player-overrides.json"
CACHE_DIR="$BASE_DIR/public/data/players"
mkdir -p "$CACHE_DIR"

MODE="${1:-full}"

echo "🌐 旅外球員分國家 Dispatch"
echo "================================"
echo "白名單: $DATA_FILE"
echo "Override: $OVERRIDE_FILE"
echo ""

# 用 Node.js 做 JSON 處理
node -e "
const fs = require('fs');
const players = JSON.parse(fs.readFileSync('$DATA_FILE', 'utf8'));
const overrides = JSON.parse(fs.readFileSync('$OVERRIDE_FILE', 'utf8')).overrides || {};

console.log('📋 白名單共 ' + players.length + ' 位選手');

// 按國家分組
const counts = { US: 0, JP: 0, KR: 0 };
players.forEach(p => { counts[p.country] = (counts[p.country]||0)+1; });
console.log('🇺🇸 US: ' + (counts.US||0) + ' | 🇯🇵 JP: ' + (counts.JP||0) + ' | 🇰🇷 KR: ' + (counts.KR||0));

// 應用 override
const applied = players.map(p => {
  const ov = overrides[p.player_id];
  return ov ? { ...p, ...ov, overridden: true, override_date: (new Date()).toISOString() } : p;
});

// 輸出快照
const snapshot = applied.map(p => ({
  player_id: p.player_id, name_zh: p.name_zh, name_en: p.name_en,
  country: p.country, league: p.league, current_level: p.current_level,
  roster_status: p.roster_status, confidence: p.confidence,
  last_check: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Tokyo' })
}));
fs.writeFileSync('$CACHE_DIR/player-snapshot.json', JSON.stringify(snapshot, null, 2));
console.log('✅ 快照已寫入: $CACHE_DIR/player-snapshot.json');

// 差異比較
const prevPath = '$CACHE_DIR/player-snapshot-prev.json';
if (fs.existsSync(prevPath) && (process.argv[1] === 'diff' || '$MODE' === 'diff')) {
  const prev = JSON.parse(fs.readFileSync(prevPath, 'utf8'));
  const changes = [];
  snapshot.forEach(s => {
    const p = prev.find(x => x.player_id === s.player_id);
    if (p && (p.current_level !== s.current_level || p.roster_status !== s.roster_status)) {
      changes.push({ player_id: s.player_id, field: 'status', from: p.current_level + '/' + p.roster_status, to: s.current_level + '/' + s.roster_status });
    }
  });
  if (changes.length === 0) console.log('📊 差異: 無變化 ✅');
  else console.log('📊 差異: ' + JSON.stringify(changes, null, 2));
}
fs.writeFileSync(prevPath, JSON.stringify(snapshot, null, 2));

// CSV 輸出
if ('$MODE' === 'csv') {
  const header = 'player_id,name_zh,name_en,country,league,organization,team,current_level,roster_status,position,bats_throws,confidence';
  const rows = applied.map(p => [
    p.player_id, p.name_zh, p.name_en, p.country, p.league,
    p.organization, p.team_name, p.current_level, p.roster_status,
    p.position, p.bats_throws, p.confidence
  ].map(v => '\"' + String(v).replace(/\"/g, '\"\"') + '\"').join(','));
  fs.writeFileSync('$CACHE_DIR/players.csv', [header, ...rows].join('\n'));
  console.log('✅ CSV 已寫入: $CACHE_DIR/players.csv');
}

// 摘要
console.log('');
console.log('📊 各國分布:');
console.log('  🇺🇸 MLB/MiLB: ' + (counts.US||0) + ' 位');
console.log('  🇯🇵 NPB:      ' + (counts.JP||0) + ' 位');
console.log('  🇰🇷 KBO:      ' + (counts.KR||0) + ' 位');
console.log('  ─────────────');
console.log('  🌍 合計:     ' + players.length + ' 位');
console.log('');
console.log('✅ V1 完成');
"
