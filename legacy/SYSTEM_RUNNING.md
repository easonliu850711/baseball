# ⚾ CPBL棒球系統 - 運行說明

## 🎯 系統概覽

**最後更新**: 2026-04-12 23:33  
**系統狀態**: ✅ 正常運行  
**遷移狀態**: ✅ Studio Imori 2.0 完成

## 📁 檔案結構

```
baseball-platform/
├── README.md                    # 專案說明
├── cpbl_final_crawler.py        # 主爬蟲腳本
├── cpbl_final_data.json         # 最新戰績數據
├── baseball_dashboard.html      # 前端儀表板
└── backup/                      # 備份檔案
    ├── test-scripts/           # 測試腳本
    ├── html-dumps/             # HTML快照
    ├── data-backups/           # 舊數據
    └── old-versions/           # 舊版本
```

## 🚀 運行方式

### 1. 手動執行爬蟲
```bash
cd /home/node/.openclaw/workspace/baseball-platform
python3 cpbl_final_crawler.py
```

### 2. 查看最新數據
```bash
# 查看JSON格式
cat cpbl_final_data.json | python3 -m json.tool

# 簡要查看
python3 -c "
import json
with open('cpbl_final_data.json', 'r') as f:
    data = json.load(f)
for team in data['standings']['teams']:
    print(f\"{team['rank']}. {team['team_name']}: {team['wins']}勝{team['losses']}敗{team['ties']}和\")
"
```

### 3. 開啟儀表板
```bash
# 本地開啟
open baseball_dashboard.html  # macOS
xdg-open baseball_dashboard.html  # Linux

# 線上版本
http://api.studio-imori.com/nosae/eason-lab/web/baseball/baseball_dashboard.html
```

### 4. 定時自動執行 (建議)
```bash
# 編輯crontab
crontab -e

# 每小時執行一次
0 * * * * cd /home/node/.openclaw/workspace/baseball-platform && python3 cpbl_final_crawler.py

# 每天上午9點執行
0 9 * * * cd /home/node/.openclaw/workspace/baseball-platform && python3 cpbl_final_crawler.py
```

## 🔗 系統網址

### 主要網址
- **數據API**: `http://api.studio-imori.com/nosae/eason-lab/baseball-data/cpbl_final_data.json`
- **前端儀表板**: `http://api.studio-imori.com/nosae/eason-lab/web/baseball/baseball_dashboard.html`
- **執行報告**: `http://api.studio-imori.com/nosae/eason-lab/cpbl/latest_report.txt`

### 備援網址 (DNS問題時使用)
- **備援IP**: `http://100.105.195.37/nosae/`
- **數據備援**: `http://100.105.195.37/nosae/eason-lab/baseball-data/cpbl_final_data.json`

## 📊 數據格式

### cpbl_final_data.json 結構
```json
{
  "timestamp": "2026-04-12T23:31:00.123456",
  "status": "success",
  "data_available": true,
  "last_updated": "2026-04-12 23:31:00",
  "standings": {
    "timestamp": "2026-04-12T23:31:00.123456",
    "source_url": "https://www.cpbl.com.tw/standings/season",
    "date": "2026-04-12",
    "teams": [
      {
        "rank": "1",
        "team_name": "味全龍",
        "games_played": "10",
        "wins": "7",
        "losses": "3",
        "ties": "0",
        "win_percentage": "0.7",
        "games_behind": "-"
      },
      ... 其他5支球隊
    ]
  }
}
```

## 🛠️ 維護指令

### 檢查系統狀態
```bash
# 檢查爬蟲是否正常
python3 cpbl_final_crawler.py --test

# 檢查網址可用性
curl -I http://api.studio-imori.com/nosae/eason-lab/baseball-data/cpbl_final_data.json

# 檢查數據完整性
python3 -c "
import json
with open('cpbl_final_data.json', 'r') as f:
    data = json.load(f)
print(f'數據時間: {data[\"last_updated\"]}')
print(f'球隊數量: {len(data[\"standings\"][\"teams\"])}')
"
```

### 備份與恢復
```bash
# 備份當前數據
cp cpbl_final_data.json cpbl_final_data_$(date +%Y%m%d_%H%M%S).json

# 從備份恢復
cp backup/data-backups/cpbl_correct_data.json cpbl_final_data.json

# 清理舊備份 (保留最近7天)
find backup/ -name "*.json" -mtime +7 -delete
```

## ⚠️ 常見問題

### 1. DNS解析問題
**症狀**: 無法連線到 `api.studio-imori.com`
**解決方案**:
- 使用備援IP: `http://100.105.195.37/nosae/`
- 等待DNS快取更新 (約5-10分鐘)
- 重啟Docker容器

### 2. 爬蟲執行失敗
**症狀**: 無法獲取CPBL數據
**解決方案**:
```bash
# 檢查網路連線
curl -I https://www.cpbl.com.tw/standings/season

# 檢查Python環境
python3 --version

# 手動測試解析
python3 -c "
import requests
url = 'https://www.cpbl.com.tw/standings/season'
response = requests.get(url, timeout=10)
print(f'HTTP狀態: {response.status_code}')
print(f'內容長度: {len(response.text)}')
"
```

### 3. 儀表板無法顯示數據
**症狀**: 儀表板空白或顯示錯誤
**解決方案**:
1. 檢查 `cpbl_final_data.json` 是否存在且格式正確
2. 檢查瀏覽器控制台錯誤
3. 確認網址配置正確

## 📈 監控與日誌

### 執行日誌
```bash
# 查看爬蟲執行記錄
tail -f /var/log/cpbl_crawler.log  # 如果設置了日誌

# 手動記錄
python3 cpbl_final_crawler.py 2>&1 | tee -a cpbl_execution.log
```

### 健康檢查
```bash
#!/bin/bash
# health_check.sh
cd /home/node/.openclaw/workspace/baseball-platform

# 檢查數據檔案
if [ ! -f "cpbl_final_data.json" ]; then
    echo "❌ 數據檔案不存在"
    exit 1
fi

# 檢查數據時效性
last_updated=$(python3 -c "
import json, datetime
with open('cpbl_final_data.json', 'r') as f:
    data = json.load(f)
print(data['last_updated'])
")

current_time=$(date '+%Y-%m-%d %H:%M:%S')
echo "✅ 系統正常運行"
echo "   最後更新: $last_updated"
echo "   當前時間: $current_time"
```

## 🔄 更新與升級

### 更新爬蟲邏輯
```bash
# 備份當前版本
cp cpbl_final_crawler.py cpbl_final_crawler_backup.py

# 更新腳本
# 編輯 cpbl_final_crawler.py
# 測試新版本
python3 cpbl_final_crawler.py --test
```

### 更新儀表板
```bash
# 備份當前版本
cp baseball_dashboard.html baseball_dashboard_backup.html

# 更新HTML/CSS/JS
# 測試本地版本
open baseball_dashboard.html

# 上傳到伺服器
curl -X POST -F "file=@baseball_dashboard.html" \
  -F "path=eason-lab/web/baseball" \
  http://api.studio-imori.com/nosae/api/upload
```

## 🎯 最佳實踐

1. **定期執行**: 設置cron job每小時執行一次
2. **監控日誌**: 記錄每次執行結果
3. **定期備份**: 每周備份重要數據
4. **版本控制**: 重要修改前備份腳本
5. **健康檢查**: 每天檢查系統狀態

## 📞 故障排除

### 緊急恢復步驟
1. **檢查網路**: `ping www.cpbl.com.tw`
2. **檢查腳本**: `python3 cpbl_final_crawler.py --dry-run`
3. **檢查數據**: `cat cpbl_final_data.json | head -20`
4. **檢查日誌**: 查看最近執行記錄
5. **恢復備份**: 使用備份數據恢復

### 聯絡支援
- **系統管理**: Eason (Studio Imori)
- **技術支援**: 乃彩絵 (Nosae)
- **問題回報**: 記錄在 `memory/YYYY-MM-DD.md`

---

**系統維護者**: 乃彩絵 (Nosae)  
**最後驗證**: 2026-04-12 23:33  
**系統版本**: CPBL System v2.0 (Studio Imori 2.0)