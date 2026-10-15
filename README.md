# 經典榮格 Jekyll 文章與分類頁範本

這是一份合併後的 Jekyll 網站功能檔案包。文章版型、理論文章單頁分類導覽和共用頁首／頁尾會放在同一個網站專案根目錄，由 Jekyll 讀取；ZIP 不應再被放到另一個子資料夾中。

## 解壓後的主要結構

- `_includes/header.html`、`_includes/footer.html`：共用頁首與頁尾；文章頁和理論文章單頁讀取相同部件。
- `assets/css/site-chrome.css`：共用部件的樣式。
- `_layouts/post.html`：文章頁版型。
- `_posts/`：新增文章時複製範例 Markdown。
- `theory/index.html`：理論文章總目錄。
- `scripts/build_related.py`、`_data/related_posts.json`：發佈時從文章文字計算相似文章。
- `.github/workflows/pages.yml`：GitHub Actions 建置及發佈流程。
- `img/logo2.jpeg`：共用頁首的原網站標誌。
- `readme.txt`：原網站大分類、小分類和標籤名稱清單。

## 怎樣放進 GitHub 專案

將 ZIP 解壓後，把裡面的檔案和資料夾合併到網站專案最外層。確認 `_includes`、`_layouts`、`_posts`、`assets`、`scripts`、`.github` 等資料夾直接位於專案根目錄。理論文章分類由 `theory/index.html` 的六個同頁分頁呈現。GitHub Pages 的來源選擇 GitHub Actions。若主要分支不是 `main`，需調整 workflow 的分支名稱。

## 新文章的分類欄位

文章範例已含 `categories`、`subcategory`、`tags`、`cover` 欄位。理論文章須填 `categories: [理論文章]` 及其中一個小分類 `subcategory`，對應的分頁才會顯示文章。封面路徑放在 `cover`。舊文章也要有這些欄位，才會加入動態分類清單。

文章版型和理論文章頁都用 `{% include header.html %}` / `{% include footer.html %}` 讀取共用部件。更改導覽列或頁尾時，修改 `_includes` 中的檔案即可。直接在瀏覽器打開 Jekyll 原始檔時會看到 Liquid 指令；需經 GitHub Actions 建置才會轉成網站。

原始媒體 ZIP 可另外提供其他圖片和靜態頁面資源。理論文章入口和六個分類均由 `theory/index.html` 處理；請勿恢復舊的獨立分類頁。首頁與其他靜態頁仍須按 Jekyll 網站結構另外整理。


