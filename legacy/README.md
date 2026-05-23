# ⚾ CPBL 棒球數據爬蟲平台 — 說明文件

> 版本 2.0 · 最後更新 2026-05-17

---

## 📖 目錄
1. [系統目的](#-系統目的)
2. [系統架構](#-系統架構)
3. [核心檔案說明](#-核心檔案說明)
4. [數據爬蟲流程](#-數據爬蟲流程)
5. [前端儀表板](#-前端儀表板)
6. [自動排程系統](#-自動排程系統)
7. [NAS 上傳機制](#-nas-上傳機制)
8. [數據格式](#-數據格式)
9. [維護指南](#-維護指南)
10. [Q&A](#-qa)

---

## 🎯 系統目的

> 每天自動抓取中華職棒（CPBL）最新戰績，並以可視化儀表板展示。

這個平台解決 Eason 的兩個需求：

| 需求 | 解決方案 |
|:----|:---------|
| 📊 **每天要看 CPBL 戰績** | 自動化爬蟲，23:30 更新，Eason起床就有最新數據 |
| 📱 **隨手可看的儀表板** | 一個漂亮網頁，放在 API 端，手機/電腦隨時開 |
| 🗄️ **數據統一管理** | 標準 JSON 格式，前端、NAS、Next.js 三方同步 |

### 它不是⋯
- ❌ 不是 NPB 日本職棒系統（那是棒球巡禮專案的範疇）
- ❌ 不是即時比分直播（不追比賽進度，只看每日戰績表）
- ❌ 不是 Bet/賠率分析（純戰績統計）

---

## 🏗️ 系統架構

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 外部資料源                              │
│              CPBL 官方網站 (cpbl.com.tw)                      │
│               https://www.cpbl.com.tw/standings/season        │
└──────────────────────┬──────────────────────────────────────┘
                       │ curl HTML
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  🐍 Python 爬蟲層                             │
│                                                              │
│   cpbl_final_crawler_updated.py ← 目前的執行主力  (374行)    │
│   cpbl_final_crawler.py       ← 原始版本 (已取代)            │
│   extract_cpbl_data.py        ← 輔助提取腳本                 │
│                                                              │
│   工作流程:                                                  │
│   ① curl 取得 CPBL 官網 HTML                                │
│   ② regex 解析表格 → 提取 6 隊戰績                          │
│   ③ 寫入 cpbl_final_data.json                               │
│   ④ 嘗試上傳到 NAS                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ JSON
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                📁 本地儲存層 (workspace/baseball-platform/)    │
│                                                              │
│   ┌────────────────────┐   ┌──────────────────────────────┐  │
│   │ 📄 cpbl_final_data │   │ 📄 cpbl_data_20260517.json  │  │
│   │     .json          │   │     (每日備份)               │  │
│   │  最新戰績（主力）   │   │                              │  │
│   └────────┬───────────┘   └──────────────────────────────┘  │
│            │                                                  │
│            ▼                                                  │
│   ┌─────────────────────────────────────────────────────┐    │
│   │    ③ 前端資料同步                                    │    │
│   │    ┌─────────────────┐  ┌────────────────────────┐ │    │
│   │    │ public/         │  │ eason-cosmos-v2/public/│ │    │
│   │    │ cpbl_final_data │  │ cpbl_final_data.json   │ │    │
│   │    │ .json           │  │ (Next.js 用)           │ │    │
│   │    └─────────────────┘  └────────────────────────┘ │    │
│   └─────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │ 或
                       ▼
┌─────────────────────────────────────────────────────────────┐
│    ☁️ NAS 上傳 (目前失敗中)                                 │
│    ┌────────────────────┐  ┌──────────────────────────────┐ │
│    │ api.studio-imori   │  │ 100.105.195.37 (Caddy)      │ │
│    │ .com/nosae/upload  │  │ → 404 (Caddy 設定遺失)     │ │
│    └────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   🎨 前端儀表板                               │
│                                                              │
│   baseball_dashboard.html                                    │
│   - 深色背景 + Tailwind CSS                                 │
│   - 6 隊各走顏色條（統一獅橘、兄弟黃、味全紅⋯）            │
│   - 從 API 端載入 cpbl_final_data.json                      │
│   - 線上: api.studio-imori.com/.../baseball_dashboard.html  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 核心檔案說明

### 🐍 Python 爬蟲

| 檔案 | 狀態 | 說明 |
|:----|:----:|:------|
| **`cpbl_final_crawler_updated.py`** | ✅ **執行主力** | 最新版，內建 HTML 表格解析 + 備用數據 + NAS 上傳 |
| `cpbl_final_crawler.py` | 🗄️ 舊版存檔 | 原始版本，僅保留為參考 |
| `extract_cpbl_data.py` | 🛠️ 輔助工具 | 另一種解析方式，從不同 HTML 結構提取 |

### 📄 數據檔案

| 檔案 | 用途 | 更新頻率 |
|:----|:-----|:--------:|
| **`cpbl_final_data.json`** | 🥇 主力數據檔 — 所有前端讀這個 | 每日 23:30 |
| **`cpbl_correct_standings.json`** | 🥇 正確版 — 同上數據，別名同步 | 每日 23:30 |
| **`cpbl_latest.json`** | 📊 最新版快照 | 每日 23:30 |
| `cpbl_data_YYYYMMDD.json` | 📦 每日備份（如 `cpbl_data_20260517.json`） | 每日封存 |
| `cpbl_actual_data.json` | 🗄️ 舊版參考（4/14） | 不再更新 |
| `test.json` / `cpbl_test_extract.json` | 🧪 測試用 | 隨意 |

### 🎨 前端儀表板

| 檔案 | 說明 |
|:----|:------|
| **`baseball_dashboard.html`** | 主要儀表板 — Tailwind CSS，深色主題，6隊漸層配色 |
| `baseball_dashboard_local.html` | 本地測試版（讀取本地檔案） |

### 📋 歷史報告

`CPBL_UPDATE_RESULT_*.txt` 和 `cpbl_update_report_*.txt` 是每日爬蟲執行的結果報告，保留作為歷史參考。

---

## 🔄 數據爬蟲流程

### 手動執行

```bash
cd /home/node/.openclaw/workspace/baseball-platform
python3 cpbl_final_crawler_updated.py
```

執行後會：
1. ✅ curl 取得 CPBL 官網 HTML
2. ✅ 正則解析表格 → 6 隊戰績
3. ✅ 寫入 `cpbl_final_data.json`
4. ✅ 如果 3 步驟成功，嘗試上傳到 NAS
5. ✅ 生成簡要執行報告

### 自動執行（Cron Job）

每天 **23:30 JST** 自動觸發（透過 OpenClaw 內部 Cron）：

```
Job: CPBL 棒球數據每日更新
Schedule: 30 23 * * * (Asia/Tokyo)
Type: isolated agentTurn
```

Cron 觸發時，AI 會執行：
1. 執行 `cpbl_final_crawler.py` 更新數據
2. 複製 `cpbl_final_data.json` 到 `public/` 和 `eason-cosmos-v2/public/`
3. 建立每日封存 `cpbl_data_YYYYMMDD.json`
4. 嘗試上傳到 NAS（目前失敗）
5. 生成結果報告

> ⚠️ 目前實際流程由 AI 逐步驟執行（非純 CLI 腳本自動跑），因為還有 NAS 上傳路徑容錯和備份邏輯。

---

## 🎨 前端儀表板

### 位置
`workspace/baseball-platform/baseball_dashboard.html`

### 技術
- **純靜態 HTML** — 不需要框架，直接開就能用
- **Tailwind CSS** — CDN 載入
- **JavaScript Fetch** — 從遠端載入 JSON 數據
- **深色主題** — `bg-gradient(135deg, #0f172a, #1e293b)`

### 球隊配色
| 球隊 | 主色調 |
|:----|:-------|
| 🟡 中信兄弟 | 金黃色 + 黑色 |
| 🟠 統一獅 | 橙色 + 綠色 |
| 🔴 樂天桃猿 | 紅色 + 藍色 |
| 🔵 富邦悍將 | 深藍 + 紅色 |
| 🔴 味全龍 | 紅色 + 白色 |
| 🌟 台鋼雄鷹 | (自定義) |

### 數據來源順序
儀表板載入數據時會輪詢以下 URL：

```
1. cpbl_final_data.json         (同目錄，本地優先)
2. api.studio-imori.com/...     (線上主力)
3. 100.105.195.37/...           (備援 IP)
```

現在 API/Caddy 都失效，所以目前只能載入本地檔案。

### 如何查看
部署後可透過 NAS API 端訪問（本地無法直接開 HTML，因為 fetch 需要同源或 CORS 允許）。

---

## ⏰ 自動排程系統

以下為 OpenClaw Cron 中與棒球平台相關的排程：

| 名稱 | 時間 | 類型 | 說明 |
|:----|:----:|:----:|:------|
| **CPBL 棒球數據每日更新** | **23:30 每日** | ⚾ **主體** | 更新戰績 + 備份 + 上傳 |
| 專業行程大管家檢查 | 09:00 每日 | 📋 輔助 | 會提到近期票務事宜 |
| 棒球巡禮專案檢查 | 08:00 每日 | 🔔 提醒 | 檢查購票倒數 |

> Cron 可在 OpenClaw 中透過 `cron list` 查看，或在主設定檔管理。

---

## ☁️ NAS 上傳機制

爬蟲內建的上傳邏輯：

```python
# 優先嘗試主要端點
upload_url = "http://api.studio-imori.com/nosae/upload?path=eason-lab/baseball-data"

# 失敗時自動切換備援 IP
backup_url = "http://100.105.195.37/nosae/upload?path=eason-lab/baseball-data"
```

**目前狀態：❌ 失敗中（Caddy 404 第 25 天）**

| 端點 | 狀態 | 原因 |
|:----|:----:|:------|
| `api.studio-imori.com` | ❌ 301 → 無法直連 | Cloudflare Tunnel 限制 |
| `100.105.195.37:80/nosae/upload` | ❌ 404 | Caddy 設定缺少上傳端點 |
| **主機內部正確路徑** | ✅ 正常 | Docker 內 Port 3000 的 HEIC Worker APP 正常 |

**修復方式**：需要在 Japan Worker（jdc01）上的 Caddyfile 中加入 `nosae/upload` endpoint 或重啟 HEIC Worker 服務。

---

## 📊 數據格式

```json
{
  "timestamp": "2026-05-17T23:30:16",
  "status": "success",
  "last_updated": "2026-05-17 23:30:16",
  "standings": {
    "date": "2026-05-17",
    "teams": [
      {
        "rank": "1",
        "team_name": "味全龍",
        "games_played": "34",
        "wins": "21",
        "losses": "13",
        "ties": "0",
        "win_percentage": "0.618",
        "games_behind": "-"
      },
      { "... 其餘5隊 ..." }
    ]
  }
}
```

### 每隊包含的欄位

| 欄位 | 型態 | 說明 |
|:----|:----:|:------|
| `rank` | string | 排名 (1-6) |
| `team_name` | string | 球隊中文名 |
| `games_played` | string | 出賽數 |
| `wins` | string | 勝場數 |
| `losses` | string | 敗場數 |
| `ties` | string | 和局數 |
| `win_percentage` | string | 勝率（小數點三位） |
| `games_behind` | string | 勝差（"-" 表示領先） |

---

## 🔧 維護指南

### 如果爬蟲掛了

```bash
# 1. 手動測試爬蟲能否連上 CPBL 官網
curl -s -L https://www.cpbl.com.tw/standings/season \
  -H "User-Agent: Mozilla/5.0" | head -50

# 2. 如果官網 HTML 結構改了，需要更新解析正則
#    在 cpbl_final_crawler_updated.py 中的 extract_standings_from_table() 函數

# 3. 如果連不上官網，爬蟲會自動用備用數據（內建 fallback）
```

### 如果 NAS 上傳掛了

同上所述，Caddy 404 需在 Worker 端修復。本地數據不會丟失。

### 如果前端儀表板掛了

檢查：
1. `cpbl_final_data.json` 是否存在 → 爬蟲成功就有
2. 儀表板路徑是否正確
3. 瀏覽器 Console → 看 fetch 錯誤

### 如何新增功能

想加新功能（如 NPB 職棒、比賽日程）的話，建議：

```
baseball-platform/
├── cpbl/                  ← 現有 CPBL 相關
├── npb/                   ← 未來 NPB 日本職棒
├── common/                ← 共用工具
└── dashboard/             ← 整合儀表板
```

---

## 🧹 倉庫清理建議

目前 `baseball-platform/` 內有 **大量的歷史報告和舊版檔案**（40+ 個檔案），可考慮：

| 檔案 | 建議 |
|:----|:----:|
| `cpbl_update_report_*.txt` (歷史報告) | ✅ 可刪，資訊已濃縮到每日備份 JSON |
| `cpbl_actual_data.json` (4/14 舊版) | ✅ 可刪 |
| `test.json` / `cpbl_test_extract.json` | ✅ 可刪 |
| `cpbl_final_crawler.py` (舊版) | ✅ 可刪（有 `_updated` 版） |
| `ARCHITECTURE_DESIGN_REPORT.md` | ✅ 可確認是否還有用 |
| `FINAL_SYSTEM_STATUS.md` | ✅ 可確認是否還有用 |
| **每日備份 JSON** (`cpbl_data_*.json`) | ⚠️ 保留近 7 天即可 |
| `cpbl_final_data.json` / `cpbl_correct_standings.json` | 🛡️ **絕對保留** |

---

## ❓ Q&A

**Q: 為什麼爬蟲指令寫了但不是直接用 cron 跑？**
A: 爬蟲觸發後還需要 AI 做後續處理（備份到多個目錄、生成報告），所以排程是 `isolated agentTurn` 讓 AI 依步驟執行，而非裸 CLI cron。

**Q: 如果 CPBL 官網改了該怎麼辦？**
A: 爬蟲依賴正則解析 HTML 表格。如果改版，需要更新 `cpbl_final_crawler_updated.py` 中的 `extract_standings_from_table()` 函數。目前有內建備用數據（fallback），所以不會完全斷掉。

**Q: 數據會自動備份嗎？**
A: 會。每天的 `cpbl_final_data.json` 會被另存為 `cpbl_data_YYYYMMDD.json`，並複製到 `public/` 和 `eason-cosmos-v2/public/`。

**Q: NAS 上傳失敗怎麼辦？**
A: 本地數據完整保留不受影響。NAS 上傳是 History 紀錄，不是 primary storage。

**Q: 儀表板可以在手機上看嗎？**
A: 可以。但如果 NAS 端點掛了就看不了。目前只能在開發環境用 localhost 開。

---

## 📜 版本歷史

| 日期 | 版本 | 變更 |
|:----:|:----:|:------|
| 2026-04-12 | 1.0 | 初版建立 — 爬蟲 + 儀表板 + 上傳 |
| 2026-05-17 | 2.0 | 完整說明文件化、架構圖、維護指南 |

---

*爬蟲人：乃彩絵 (Nosae) · Studio Imori* 🌸
