# 私人旅記

手機優先的加密靜態旅遊導覽。網站： https://chiehti0317-debug.github.io/kansai-guide/

## 使用

使用 Safari 或 Chrome 開啟網站，輸入另外私下保管的解鎖碼。首次連線解鎖後，按「離線準備」。iPhone 可在 Safari 的分享選單加入主畫面；請再從主畫面開啟、完成離線準備，出發前以飛航模式實測。Google Maps 與外部店家網站仍需要網路。

## 隱私

- 本儲存庫只包含通用介面及 AES-256-GCM 加密的旅記，解鎖碼不在這裡。
- 解密完全在瀏覽器進行，沒有伺服器登入帳號、雲端資料庫或付費 API。
- 持有解鎖碼的人可查看及另存內容。這不是個別帳號權限系統。
- 筆記和勾選只存於自己的瀏覽器，不會在不同裝置或同行者間同步。
- 「鎖定」會關閉行程，但不清除已保存的本機筆記。
- 匯出的個人 JSON、明文 HTML、原始 Excel、票券截圖和解鎖碼，均不得提交至公開儲存庫。
- 瀏覽器可能回收離線快取；正式憑證請另外離線保存。

## 部署

GitHub Pages：main 分支 / (root)。所有執行時檔案都在本儲存庫；沒有 Floot、Cloudflare 或其他主機的執行時依賴。保留 `.nojekyll`，所有資產及 service worker 使用相對路徑，以支援 `/kansai-guide/` 子路徑。

使用 GitHub Free 的公開儲存庫及 GitHub Pages。未配置自訂付費網域、付費 runner 或任何收費後端。是否免費與使用配額依 GitHub 當時政策。

網站清單：`index.html`、`app.js`、`guide.enc.json`、`sw.js`、`manifest.webmanifest`、`icon-512.png`、`robots.txt`、`.nojekyll`。
