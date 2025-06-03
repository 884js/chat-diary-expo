# Chat Diary Expo v2

React Native (Expo) を使用したチャット日記アプリケーション

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

以下の環境変数を設定してください：

#### OGP API設定
```bash
# .env.local または環境変数として設定
EXPO_PUBLIC_OGP_WORKER_URL=https://chat-diary-ogp-api.mmmr0628.workers.dev
```

### 3. 開発環境の起動

```bash
npm run dev
```

## 機能

- チャット形式での日記記録
- AI返答機能
- 画像添付
- OGPカード表示（URLリンクプレビュー）
- 感情記録
- カレンダービュー
- メッセージストック機能

## OGP API について

本アプリケーションは、URLのメタデータ（OGP情報）を取得するために独自のCloudflare Worker APIを使用しています。

### APIエンドポイント
- **URL**: `https://chat-diary-ogp-api.mmmr0628.workers.dev/api/ogp`
- **Method**: POST
- **Headers**: `Content-Type: application/json`
- **Body**: `{"url": "https://example.com"}`

### レスポンス形式
```json
{
  "title": "ページタイトル",
  "description": "ページの説明",
  "url": "https://example.com",
  "images": ["https://example.com/image.jpg"],
  "siteName": "サイト名"
}
```

### 制限事項
- **レート制限**: 100リクエスト/時間（IPアドレス単位）
- **キャッシュ**: 1時間のキャッシュあり
- **タイムアウト**: 10秒

## 技術スタック

- **フレームワーク**: Expo SDK 53.0.9
- **言語**: TypeScript
- **UI**: NativeWind (Tailwind CSS for React Native)
- **状態管理**: React Query
- **バックエンド**: Supabase
- **OGP API**: Cloudflare Workers + Hono + HTMLRewriter

## スクリプト

```bash
# 開発環境起動
npm run dev

# Android実行
npm run android

# iOS実行  
npm run ios

# テスト実行
npm run test

# コードフォーマット
npm run format

# Lint実行
npm run lint

# ビルド（Android）
npm run build:android:development

# Web版デプロイ
npm run deploy:web
```

## ライセンス

Private Project 