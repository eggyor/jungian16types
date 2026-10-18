# 經典榮格網站

本專案是以 Jekyll 建置、由 GitHub Actions 發佈至 GitHub Pages 的網站。此檔案夾是網站根目錄；保留現有檔案層級，勿把網站內容再包進另一層資料夾。

## 文件入口

- [網站架構與維護](docs/網站架構與維護.md)：網站如何組成、主要目錄與共用功能在哪裡。
- [新增文章與分類標籤](docs/新增文章與分類標籤.md)：文章範本、Front Matter、分類規則和發佈流程。
- [分類與標籤詞彙表](docs/分類與標籤詞彙表.md)：可用的文章分類和既有標籤名稱。
- [測驗題目、算分與結果跳轉](docs/測驗題目與算分跳轉說明.md)：題目分支、計分及結果頁對照。
- [聯絡表單除錯手冊](docs/聯絡表單除錯手冊.md)：Turnstile、Cloudflare Worker、Resend。
- [Instagram 自動更新設定](docs/Instagram自動更新設定.md)：GitHub Actions 憑證與貼文同步方式。
- [每日瀏覽統計設定](docs/每日瀏覽統計設定.md)：GA4 測量 ID 設定與每日瀏覽量查詢方式。

## 快速開始

新增文章請複製 `templates/文章範本.md`，按 [新增文章與分類標籤](docs/新增文章與分類標籤.md) 填寫分類和內容。推送到 `main` 後，GitHub Actions 會同步 Instagram（有設定憑證時）、更新相關文章資料、建置並發佈網站。更多日常維護方式請從上方文件入口開始。
