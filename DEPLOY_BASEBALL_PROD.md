# Baseball PROD 修正版部署指令

## 修正內容

- `POST /api/sync/standings` 現在支援兩種 token：
  - JSON body：`{ "token": "baseball-apikey-202605" }`
  - Header：`Authorization: Bearer baseball-apikey-202605`
- 401 回傳會帶 `tokenConfigured`，可以判斷 PM2 進程是否有讀到 `SYNC_TOKEN`。
- `src/lib/db.ts` 會自動建立 `data` 目錄，避免 `Cannot open database because the directory does not exist`。
- 新增 `ecosystem.config.cjs`，固定使用：
  - PM2 app：`baseball-prod`
  - port：`3004`
  - DB：`C:\studio-imori\baseball\prod\data\baseball.db`

## 台灣主機部署

```powershell
cd C:\studio-imori\baseball\prod

npm install
npm run build

pm2 delete baseball-prod
pm2 start ecosystem.config.cjs
pm2 save

pm2 env baseball-prod | findstr SYNC_TOKEN
pm2 logs baseball-prod --lines 50
```

## 本機驗證

```powershell
$body = @{
  token = "baseball-apikey-202605"
  league = "cpbl"
  season = 2026
  date = "2026-05-27"
  teams = @(
    @{
      rank = 1
      team_name = "測試隊"
      games_played = 1
      wins = 1
      losses = 0
      ties = 0
      win_percentage = "1.000"
      games_behind = "-"
    }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "http://127.0.0.1:3004/api/sync/standings" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

## 遠端驗證：body token

```powershell
curl.exe -X POST "https://baseball.studio-imori.com/api/sync/standings" `
  -H "Content-Type: application/json" `
  -d "{\"token\":\"baseball-apikey-202605\",\"league\":\"cpbl\",\"season\":2026,\"date\":\"2026-05-27\",\"teams\":[{\"rank\":1,\"team_name\":\"測試隊\",\"games_played\":1,\"wins\":1,\"losses\":0,\"ties\":0,\"win_percentage\":\"1.000\",\"games_behind\":\"-\"}]}"
```

## 遠端驗證：Bearer token

```powershell
curl.exe -X POST "https://baseball.studio-imori.com/api/sync/standings" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer baseball-apikey-202605" `
  -d "{\"league\":\"cpbl\",\"season\":2026,\"date\":\"2026-05-27\",\"teams\":[{\"rank\":1,\"team_name\":\"測試隊\",\"games_played\":1,\"wins\":1,\"losses\":0,\"ties\":0,\"win_percentage\":\"1.000\",\"games_behind\":\"-\"}]}"
```

成功時會回：

```json
{
  "success": true,
  "league": "CPBL",
  "date": "2026-05-27",
  "teams_saved": 1
}
```

如果還是 401 且 `tokenConfigured: false`，代表 PM2 進程還是沒吃到 `SYNC_TOKEN`，請重新用 `ecosystem.config.cjs` 啟動。
