# 旅外球員新聞同步

## 排程
- 07:00 JST — 早間同步
- 23:30 JST — 晚間同步（與 CPBL 戰績一起執行）

## 手動執行
```bash
# Production
SYNC_TOKEN=xxx bash scripts/fetch-overseas-news.sh

# Staging (手動測試)
SYNC_TOKEN=xxx BASE_URL=https://baseball-stg.studio-imori.com \
  bash scripts/fetch-overseas-news.sh
```

## 技術細節
- 使用 Python 3 + urllib（標準函式庫）
- 透過 Google News RSS 搜尋每位旅外球員的關鍵詞
- 最高每人 3 篇，UNIQUE INDEX 自動去重
- POST 到 `/api/sync/news`，Bearer Auth
