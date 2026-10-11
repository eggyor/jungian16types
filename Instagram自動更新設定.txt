Instagram 自動更新設定（GitHub Pages）
====================================

網站首頁已準備好：它會讀取 _data/instagram.yml，最多顯示最新 8 則貼文；桌面版版面為每行 4 則、共 2 行。更新程式會在網站建置時向 Instagram 讀取最新貼文，將縮圖存到網站資源，再由 Jekyll 顯示。憑證不會寫進 index.html。

上傳網站到 GitHub 後，請設定一次：

1. 打開 GitHub 上的網站 repository。
2. 進入 Settings → Secrets and variables → Actions。
3. 點 New repository secret。
4. Name 填：INSTAGRAM_ACCESS_TOKEN
5. Secret 填入你在 Meta 儲存的 Instagram 存取憑證，然後儲存。
   請勿把憑證貼進 index.html、instagram.yml 或公開訊息。
6. 進入 Actions，啟用工作流程；選擇「Build and publish Jekyll site」並按 Run workflow 作首次更新。

成功後，網站建置時會更新首頁資料。之後 GitHub Actions 每天會自動執行一次（香港時間約晚上 6:17），更新最新貼文並重新發布網站。排程是每天檢查一次，所以新貼文不會即時出現。

若 Meta 憑證過期或取消授權，Instagram 更新步驟會失敗，避免用空白資料覆蓋網站；網站仍保留上一次已發布的版本。請在 Meta 重新授權，再到 GitHub 的同一個 Secret 更新憑證並重新執行工作流程。