# Baseball runtime AP 發布候選 — 2026-11-20

基準 commit：ba44dfcacd3be953e694430d3f1d46489a88bc77。AP chat僅在隔離分支開發，不部署HP、不操作BAT/PM2/DB；統一交由「系統架構優化」發布。

已確認HP舊版安裝與standalone使用Next14.2.35，落在官方Windows critical公告範圍（https://github.com/advisories/GHSA-p293-qw3h-jr36）。本候選對齊Next15.5.29、React/DOM19.2.7、Lucide0.468.0、ESLint8.57.1/config-next15.5.29、對應React types與PostCSS8.5.33；正常版本範圍內修補其餘依賴，沒有使用audit fix --force。最後npm audit fix輸出found 0 vulnerabilities，含開發依賴。

Next設定固定outputFileTracingRoot為本專案、移除失效swcMinify。球員動態route params改Promise/await；移除依port猜Core及寫死的身份fallback，改成要求既有明確Core與服務身份設定。瀏覽器cookie/Authorization不轉傳，偽造x-imori-api-key不能蓋過服務身份；上游redirect拒絕、timeout10秒。3項合成proxy測試通過。真實Core資料連線需由Infra在STG驗收；本機沒有Core，舊版預覽的資料請求連線失敗屬預期，不能宣稱戰績資料已驗收。

最終production build、lint/typecheck exit0；桌面1440×1000與手機390×844本機首頁可呈現且無水平溢出，預覽已關閉。未建立真實訂單、貢獻資料或寄送訊息。只驗收AP升級與本機畫面，不以此宣稱所有外部資料/API功能已完成正式驗收。

發布需要完整安裝/build，不能沿不安裝依賴的SAFE捷徑。先保留現場修改/資料/建置，核對精確commit與既有profile；不要將STG環境覆蓋PROD。保留原部署流程與資料庫配置；不跑Baseball seed或其他非本次資料遷移。

Workspace outputs中baseball-security-20261120-build.log、baseball-security-20261120-audit-fix.log與同名前綴desktop/mobile截圖為本機證據。正式URL與HP實際版本、資料串接、PM2健康及回復，需由部署負責人另驗。

