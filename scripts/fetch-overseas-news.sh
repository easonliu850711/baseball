#!/bin/bash
# 旅外球員新聞爬蟲 — 台灣主機 cron 專用
# Usage:
#   bash scripts/fetch-overseas-news.sh
#
# 環境變數:
#   SYNC_TOKEN  — API auth token
#   BASE_URL    — 預設 baseball-stg.studio-imori.com

set -euo pipefail

export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8

BASE_URL="${BASE_URL:-https://baseball-stg.studio-imori.com}"
SYNC_TOKEN="${SYNC_TOKEN:-}"

if [ -z "$SYNC_TOKEN" ]; then
  echo "ERROR: SYNC_TOKEN is not set"
  exit 1
fi

PYTHON_BIN="$(command -v python3 || command -v python || true)"

if [ -z "$PYTHON_BIN" ]; then
  echo "ERROR: python3/python is not available"
  exit 1
fi

echo "Using Python: $PYTHON_BIN"

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

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

NEWS_ARR="$TMPDIR/news_array.json"
echo '[]' > "$NEWS_ARR"

for entry in "${QUERIES[@]}"; do
  IFS='|' read -r pid name keywords <<< "$entry"

  echo "=== Searching: $name ($pid) ==="

  ENCODED_KEYWORDS="$("$PYTHON_BIN" -c "import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))" "$keywords")"
  RSS_URL="https://news.google.com/rss/search?q=${ENCODED_KEYWORDS}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"

  RSS_FILE="$TMPDIR/rss-$pid.xml"
  RESULT_FILE="$TMPDIR/result-$pid.json"

  curl -sL --max-time 10 \
    -A "Mozilla/5.0 (compatible; StudioImoriBot/1.0)" \
    "$RSS_URL" > "$RSS_FILE" || true

  "$PYTHON_BIN" -c "
import sys, xml.etree.ElementTree as ET, json, os

pid = sys.argv[1]
rss_path = sys.argv[2]

try:
    if not os.path.exists(rss_path) or os.path.getsize(rss_path) == 0:
        print('[]')
        sys.exit(0)

    tree = ET.parse(rss_path)
    root = tree.getroot()
    items = []

    for item in root.findall('.//item')[:3]:
        title = item.findtext('title', '')
        link = item.findtext('link', '')
        src = item.findtext('source', '')
        pub = item.findtext('pubDate', '')

        if title and link:
            items.append({
                'player_id': pid,
                'title': title.strip(),
                'url': link.strip(),
                'source': src.strip() if src else '',
                'published_at': pub.strip() if pub else '',
                'summary': ''
            })

    print(json.dumps(items, ensure_ascii=True))
except Exception as e:
    print('PARSE_ERROR:', e, file=sys.stderr)
    print('[]')
" "$pid" "$RSS_FILE" > "$RESULT_FILE"

  FOUND="$("$PYTHON_BIN" -c "import json, sys; print(len(json.load(open(sys.argv[1], encoding='utf-8'))))" "$RESULT_FILE")"
  echo "Found: $FOUND"

  "$PYTHON_BIN" -c "
import json, sys, os

news_path = sys.argv[1]
result_path = sys.argv[2]

if not os.path.exists(news_path):
    with open(news_path, 'w', encoding='utf-8') as f:
        f.write('[]')

with open(news_path, encoding='utf-8') as f:
    body = json.load(f)

with open(result_path, encoding='utf-8') as f:
    results = json.load(f)

body.extend(results)

with open(news_path, 'w', encoding='utf-8') as f:
    json.dump(body, f, ensure_ascii=False, indent=2)
" "$NEWS_ARR" "$RESULT_FILE"

  sleep 1
done

TOTAL="$("$PYTHON_BIN" -c "import json, sys; print(len(json.load(open(sys.argv[1], encoding='utf-8'))))" "$NEWS_ARR")"
echo "=== Total news found: $TOTAL ==="

if [ "$TOTAL" -eq 0 ]; then
  echo "No news found, skipping POST"
  exit 0
fi

POST_BODY="$TMPDIR/post_body.json"

"$PYTHON_BIN" -c "
import json, sys

news_path = sys.argv[1]
post_path = sys.argv[2]

with open(news_path, encoding='utf-8') as f:
    news = json.load(f)

with open(post_path, 'w', encoding='utf-8') as f:
    json.dump({'news': news}, f, ensure_ascii=False)
" "$NEWS_ARR" "$POST_BODY"

echo "=== POST to $BASE_URL/api/sync/news ==="

curl -s -X POST "$BASE_URL/api/sync/news" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SYNC_TOKEN" \
  --data-binary "@$POST_BODY" | "$PYTHON_BIN" -m json.tool

echo ""
echo "=== Done ==="
