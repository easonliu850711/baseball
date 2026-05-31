#!/bin/bash
# 旅外球員新聞爬蟲 — 台灣主機 cron 專用
# 每天 23:30 JST 執行
#
# Usage:
#   bash scripts/fetch-overseas-news.sh
#
# 環境變數:
#   SYNC_TOKEN  — API auth token (Authorization Bearer)
#   BASE_URL    — 預設 baseball-stg.studio-imori.com
#
# ⚠️ TEMPORARY: 28 位球員名單目前 hardcode 在腳本內
#    TODO: 之後改為讀取 src/data/overseas-players.json

set -euo pipefail

BASE_URL="${BASE_URL:-https://baseball-stg.studio-imori.com}"
SYNC_TOKEN="${SYNC_TOKEN:-}"

if [ -z "$SYNC_TOKEN" ]; then
  echo "ERROR: SYNC_TOKEN is not set"
  exit 1
fi

# ── 28 位旅外球員搜尋關鍵詞 ──────────────────────────
# TEMPORARY: 正式版請改從 src/data/overseas-players.json 讀取
#   格式: player_id|name_zh|搜尋關鍵詞
QUERIES=(
  "deng-kai-wei|鄧愷威|鄧愷威 旅美 棒球"
  "lee-hao-yu|李灝宇|李灝宇 老虎 旅美"
  "cheng-tsung-che|鄭宗哲|鄭宗哲 紅襪 旅美"
  "chuang-chen-chung-ao|莊陳仲敖|莊陳仲敖 運動家 旅美"
  "lin-yu-min|林昱珉|林昱珉 響尾蛇 旅美"
  "chen-po-yu|陳柏毓|陳柏毓 海盜 旅美"
  "liu-chih-jung|劉致榮|劉致榮 紅襪 旅美"
  "chang-hung-leng|張弘稜|張弘稜 海盜 旅美"
  "lin-wei-en|林維恩|林維恩 運動家 旅美"
  "lin-chen-wei|林振瑋|林振瑋 紅雀 旅美"
  "pan-wen-hui|潘文輝|潘文輝 費城人 旅美"
  "lin-sheng-en|林盛恩|林盛恩 紅人 旅美"
  "sha-tzu-chen|沙子宸|沙子宸 運動家 旅美"
  "ke-ching-hsien|柯敬賢|柯敬賢 道奇 旅美"
  "hsu-ju-hsi|徐若熙|徐若熙 軟銀 旅日"
  "ku-lin-ruei-yang|古林睿煬|古林睿煬 火腿 旅日"
  "sun-yi-lei|孫易磊|孫易磊 火腿 旅日"
  "lin-an-ko|林安可|林安可 西武 旅日"
  "sung-chia-hao|宋家豪|宋家豪 樂天 旅日"
  "lin-chia-cheng|林家正|林家正 火腿 旅日"
  "chang-chun-wei|張峻瑋|張峻瑋 軟銀 旅日"
  "chen-mu-heng|陳睦衡|陳睦衡 歐力士 旅日"
  "hsiao-chi|蕭齊|蕭齊 樂天 旅日"
  "hsu-hsiang-sheng|徐翔聖|徐翔聖 養樂多 旅日"
  "huang-chin-hao|黃錦豪|黃錦豪 巨人 旅日"
  "yang-po-hsiang|陽柏翔|陽柏翔 樂天 旅日"
  "lin-kuan-chen|林冠臣|林冠臣 西武 旅日"
  "wang-yen-cheng|王彥程|王彥程 韓華 旅韓"
)

# ── 新聞來源 RSS ───────────────────────────────────
NEWS_SOURCES=(
  "https://www.ettoday.net/news/news-list-7-0.xml"     # ETtoday 體育
  "https://cdn.tsna.tw/rss"                              # TSNA
  "https://feeds.feedburner.com/sportsltn"                # 自由體育
)

# ── 主流程 ─────────────────────────────────────────
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

NEWS_ARR="$TMPDIR/news_array.json"
echo '[]' > "$NEWS_ARR"

for entry in "${QUERIES[@]}"; do
  IFS='|' read -r pid name keywords <<< "$entry"

  echo "=== Searching: $name ($pid) ==="

  # URL encode 關鍵詞
  ENCODED_KEYWORDS=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$keywords'))")
  RSS_URL="https://news.google.com/rss/search?q=${ENCODED_KEYWORDS}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"

  # 抓 RSS → 解析（最多 3 筆）
  RESULTS=$(curl -sL --max-time 10 "$RSS_URL" 2>/dev/null | \
    python3 -c "
import sys, xml.etree.ElementTree as ET, json

try:
    tree = ET.parse(sys.stdin)
    root = tree.getroot()
    items = []
    for item in root.findall('.//item')[:3]:
        title = item.findtext('title', '')
        link = item.findtext('link', '')
        src = item.findtext('source', '')
        pub = item.findtext('pubDate', '')
        if title and link:
            items.append({
                'player_id': '$pid',
                'title': title.strip(),
                'url': link.strip(),
                'source': src.strip() if src else '',
                'published_at': pub.strip() if pub else '',
                'summary': ''
            })
    print(json.dumps(items, ensure_ascii=False))
" 2>/dev/null) || RESULTS='[]'

  # 合併
  python3 -c "
import json
with open('$NEWS_ARR') as f:
    body = json.load(f)
body.extend(json.loads('''$RESULTS'''))
with open('$NEWS_ARR', 'w') as f:
    json.dump(body, f, ensure_ascii=False, indent=2)
"

  sleep 1
done

# 統計
TOTAL=$(python3 -c "import json; print(len(json.load(open('$NEWS_ARR'))))")
echo "=== Total news found: $TOTAL ==="

if [ "$TOTAL" -eq 0 ]; then
  echo "No news found, skipping POST"
  exit 0
fi

# POST 到 baseball API（外層包 { news: [...] }）
echo "=== POST to $BASE_URL/api/sync/news ==="
curl -s -X POST "$BASE_URL/api/sync/news" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SYNC_TOKEN" \
  -d "{ \"news\": $(cat "$NEWS_ARR") }" | python3 -m json.tool

echo ""
echo "=== Done ==="
