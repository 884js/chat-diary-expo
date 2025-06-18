// デフォルト設定
export const DEFAULT_CONFIG = {
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
};
// APIパス
export const API_PATHS = {
    OGP: '/api/ogp',
};
// キャッシュキー生成関数
export function createCacheKey(url) {
    return `${DEFAULT_CONFIG.cache.keyPrefix}${url}`;
}
// レート制限キー生成関数
export function createRateLimitKey(clientIP) {
    return `rate_limit:${clientIP}`;
}
