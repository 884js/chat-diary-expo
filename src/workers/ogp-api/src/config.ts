import type { WorkerConfig } from '../types/index.js';

// デフォルト設定
export const DEFAULT_CONFIG: WorkerConfig = {
  rateLimit: {
    limit: 100,
    windowMs: 3600000, // 1時間
  },
  cache: {
    ttl: 3600, // 1時間
    keyPrefix: 'ogp:',
  },
  cors: {
    allowedMethods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    allowedOrigins: ['*'], // wrangler.tomlで上書きされる
  },
};

// エラーコード定数
export const ERROR_CODES = {
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_URL: 'INVALID_URL',
  FETCH_FAILED: 'FETCH_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// APIパス
export const API_PATHS = {
  OGP: '/api/ogp',
} as const;

// キャッシュキー生成関数
export function createCacheKey(url: string): string {
  return `${DEFAULT_CONFIG.cache.keyPrefix}${url}`;
}

// レート制限キー生成関数
export function createRateLimitKey(clientIP: string): string {
  return `rate_limit:${clientIP}`;
}
