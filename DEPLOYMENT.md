# 部署指南 - Vercel + Supabase

本指南將幫助您將 Recipe Notes 應用程式部署到 Vercel（前端和後端 API）和 Supabase（資料庫）。

## 📋 前置需求

1. **GitHub 帳號** - 用於版本控制
2. **Vercel 帳號** - [註冊 Vercel](https://vercel.com/signup)
3. **Supabase 帳號** - [註冊 Supabase](https://supabase.com/dashboard)

## 🗄️ 步驟 1: 設置 Supabase 資料庫

### 1.1 創建 Supabase 專案

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 點擊 "New Project"
3. 填寫專案資訊：
   - **Name**: recipe-notes (或您喜歡的名稱)
   - **Database Password**: 記下這個密碼（稍後會用到）
   - **Region**: 選擇離您最近的區域
4. 點擊 "Create new project"
5. 等待專案創建完成（約 2 分鐘）

### 1.2 獲取資料庫連接資訊

1. 在 Supabase Dashboard 中，進入您的專案
2. 點擊左側選單的 "Settings" → "Database"
3. 找到 "Connection string" 區塊
4. 選擇 "URI" 標籤，複製連接字串
5. 連接字串格式：`postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 1.3 執行資料庫 Migration

1. 在 Supabase Dashboard 中，點擊左側選單的 "SQL Editor"
2. 點擊 "New query"
3. 打開 `supabase/migrations/001_initial_schema.sql` 文件
4. 複製整個 SQL 內容並貼到 SQL Editor
5. 點擊 "Run" 執行 migration
6. 確認所有表格已創建：
   - `recipes`
   - `notes`
   - `ingredients`
   - `inventory_items`

### 1.4 設置環境變數（在 Supabase）

1. 在 Supabase Dashboard 中，點擊 "Settings" → "API"
2. 記下以下資訊（稍後在 Vercel 中會用到）：
   - Project URL
   - anon/public key（如果需要）

## 🚀 步驟 2: 部署後端 API 到 Vercel

### 2.1 準備專案

1. 確保您的專案已推送到 GitHub
2. 確認 `api-server.js` 在根目錄
3. 確認 `config.js` 使用環境變數（已配置）

### 2.2 在 Vercel 部署 API

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "Add New..." → "Project"
3. 導入您的 GitHub repository
4. 配置專案設定：
   - **Framework Preset**: Other
   - **Root Directory**: 保持為根目錄
   - **Build Command**: 留空（API 不需要 build）
   - **Output Directory**: 留空
   - **Install Command**: `npm install`

5. 添加環境變數（點擊 "Environment Variables"）：
   ```
   DB_USER=postgres
   DB_HOST=db.[YOUR-PROJECT-REF].supabase.co
   DB_NAME=postgres
   DB_PASSWORD=[YOUR-SUPABASE-PASSWORD]
   DB_PORT=5432
   PORT=3000
   ```

6. 點擊 "Deploy"
7. 等待部署完成
8. 記下部署後的 URL（例如：`https://your-project.vercel.app`）

### 2.3 更新 Vercel 配置（如果需要）

如果 API 路由有問題，可能需要調整 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api-server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api-server.js"
    }
  ]
}
```

## 🎨 步驟 3: 部署前端到 Vercel

### 3.1 更新前端 API 配置

1. 在 `frontend/src/services/api.ts` 中，API_BASE_URL 已配置為使用環境變數
2. 在 Vercel 專案設定中添加環境變數：
   ```
   VITE_API_URL=https://your-api-url.vercel.app/api
   ```

### 3.2 部署前端

**選項 A: 作為獨立專案部署**

1. 在 Vercel Dashboard 中，點擊 "Add New..." → "Project"
2. 導入同一個 GitHub repository
3. 配置專案設定：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. 添加環境變數：
   ```
   VITE_API_URL=https://your-api-url.vercel.app/api
   ```

5. 點擊 "Deploy"

**選項 B: 使用 Monorepo 部署（推薦）**

1. 在同一個 Vercel 專案中，更新 `vercel.json`：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api-server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api-server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

2. 在 `frontend/package.json` 中添加 build script（如果還沒有）：
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

3. 在 Vercel 專案設定中：
   - **Root Directory**: 保持為根目錄
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install && cd frontend && npm install`

## ✅ 步驟 4: 驗證部署

### 4.1 測試 API

1. 訪問 `https://your-api-url.vercel.app/api/health`
2. 應該看到：`{"status":"OK","message":"Recipe Notes API is running"}`

### 4.2 測試前端

1. 訪問您的前端 URL
2. 確認可以：
   - 查看 recipes
   - 添加新的 recipe
   - 查看 inventory items
   - 添加/編輯/刪除 inventory items

### 4.3 檢查環境變數

如果遇到連接問題，檢查：
1. Vercel 環境變數是否正確設置
2. Supabase 資料庫連接資訊是否正確
3. 前端 API URL 是否指向正確的後端 URL

## 🔧 疑難排解

### 問題：API 返回 500 錯誤

**解決方案**：
1. 檢查 Vercel 的 Function Logs
2. 確認資料庫連接資訊正確
3. 確認 Supabase 專案已啟動（不是暫停狀態）

### 問題：前端無法連接到 API

**解決方案**：
1. 確認 `VITE_API_URL` 環境變數已設置
2. 檢查瀏覽器 Console 的錯誤訊息
3. 確認 CORS 設定正確（`api-server.js` 中已啟用 CORS）

### 問題：資料庫連接失敗

**解決方案**：
1. 確認 Supabase 專案狀態為 "Active"
2. 檢查資料庫密碼是否正確
3. 確認連接字串格式正確
4. 檢查 Supabase 的 "Database" → "Connection pooling" 設定

## 📝 注意事項

1. **免費方案限制**：
   - Vercel: 100GB 頻寬/月，無限制請求
   - Supabase: 500MB 資料庫，2GB 頻寬/月

2. **環境變數**：
   - 生產環境的環境變數需要在 Vercel Dashboard 中設置
   - 不要將 `.env` 文件提交到 Git

3. **資料庫遷移**：
   - 未來如果有新的 migration，在 Supabase SQL Editor 中執行

4. **自動部署**：
   - 推送到 GitHub main 分支會自動觸發 Vercel 部署

## 🎉 完成！

您的應用程式現在應該已經成功部署到 Vercel 和 Supabase 了！

如有任何問題，請檢查：
- Vercel Function Logs
- Supabase Database Logs
- 瀏覽器 Console
