#!/bin/bash
# 旅外球員新聞爬蟲 — production sync job
# 每天 07:00 & 23:30 JST 由 cron 執行
#
# Usage:
#   SYNC_TOKEN=xxx bash scripts/fetch-overseas-news.sh
#
# 環境變數:
#   SYNC_TOKEN  (必要) — API auth token (Authorization Bearer)
#   BASE_URL    (選項) — 預設 baseball.studio-imori.com
#
# Production:
#   SYNC_TOKEN=xxx BASE_URL=https://baseball.studio-imori.com \
#     bash scripts/fetch-overseas-news.sh
#
# Staging (手動測試):
#   SYNC_TOKEN=xxx BASE_URL=https://baseball-stg.studio-imori.com \
#     bash scripts/fetch-overseas-news.sh

set -euo pipefail

cd "$(dirname "$0")/.."

BASE_URL="${BASE_URL:-https://baseball.studio-imori.com}"
SYNC_TOKEN="${SYNC_TOKEN:-}"

if [ -z "$SYNC_TOKEN" ]; then
  echo "ERROR: SYNC_TOKEN is not set"
  exit 1
fi

echo "=== Oversea News Sync ==="
echo "  Target: $BASE_URL"
echo "  Time:   $(date '+%Y-%m-%d %H:%M JST')"
echo ""

exec python3 scripts/fetch-overseas-news.py
