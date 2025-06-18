# OGP API Cloudflare Worker

Chat Diary用のOGP取得APIのCloudflare Worker実装です。

## 機能

- **OGP取得**: `open-graph-scraper`を使用したメタデータ取得
- **キャッシュ機能**: Cloudflare KVを使用した1時間キャッシュ
- **レート制限**: IP別に1時間100リクエスト制限
- **CORS対応**: 指定されたオリジンからのアクセス許可
- **エラーハンドリング**: 適切なエラーレスポンス

## セットアップ

### 1. Cloudflareアカウント作成

1. [Cloudflare](https://cloudflare.com/)でアカウント作成
2. Workers & Pages ダッシュボードにアクセス

### 2. KV Namespaceの作成

```bash
# OGPキャッシュ用KV
wrangler kv:namespace create "OGP_CACHE"
wrangler kv:namespace create "OGP_CACHE" --preview

# レート制限用KV
wrangler kv:namespace create "RATE_LIMIT"
wrangler kv:namespace create "RATE_LIMIT" --preview
```

### 3. wrangler.tomlの設定

生成されたKV Namespace IDを`wrangler.toml`に設定:

```toml
[[kv_namespaces]]
binding = "OGP_CACHE"
id = "生成されたID"
preview_id = "生成されたプレビューID"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "生成されたID"
preview_id = "生成されたプレビューID"
```

### 4. 依存関係のインストール

```bash
cd src/workers/ogp-api
npm install
```

### 5. 開発・デプロイ

```bash
# ローカル開発
npm run dev

# 本番デプロイ
npm run deploy
```

## API仕様

### エンドポイント
```
POST https://your-worker.your-subdomain.workers.dev/api/ogp
```

### リクエスト
```json
{
  "url": "https://example.com"
}
```

### レスポンス
```json
{
  "title": "ページタイトル",
  "description": "ページの説明",
  "url": "https://example.com",
  "images": ["https://example.com/image.jpg"],
  "siteName": "サイト名"
}
```

### エラーレスポンス
```json
{
  "error": "エラーメッセージ",
  "code": "ERROR_CODE"
}
```

## エラーコード

- `INVALID_URL`: 無効なURL
- `RATE_LIMIT`: レート制限超過
- `FETCH_FAILED`: OGP取得失敗
- `INTERNAL_ERROR`: 内部エラー

## 設定

### 許可オリジン

`wrangler.toml`の`ALLOWED_ORIGINS`で設定:

```toml
[vars]
ALLOWED_ORIGINS = "http://localhost:8081,https://your-domain.com"
```

### レート制限

デフォルト: **1時間に100リクエスト/IP**

コード内の`checkRateLimit`関数で変更可能:

```typescript
await checkRateLimit(env, clientIP, 200, 3600000) // 200req/hour
```

### キャッシュ期間

デフォルト: **1時間**

コード内で変更可能:

```typescript
await env.OGP_CACHE.put(cacheKey, response, {
  expirationTtl: 7200, // 2時間
});
```

## デバッグ

```bash
# ログ確認
npm run tail

# リアルタイムログ
wrangler tail --format=pretty
```

## コスト

Cloudflare Workers無料プラン:
- **100,000リクエスト/日**
- **10ms CPU時間/リクエスト**
- **KV: 100,000 read/日、1,000 write/日**

通常の使用であれば無料枠で十分です。 