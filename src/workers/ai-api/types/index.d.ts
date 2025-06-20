/// <reference types="@cloudflare/workers-types" />

// 環境変数の型定義
export interface Env {
  AI_CACHE: KVNamespace;
  RATE_LIMIT: KVNamespace;
  GEMINI_API_KEY: string;
}

// OGP APIレスポンスの型定義
export interface OGPResponse {
  title: string;
  description: string;
  url: string;
  images: string[];
  siteName?: string;
}

// APIエラーレスポンスの型定義
export interface ErrorResponse {
  error: string;
  code?: string;
}

// AI関連の型定義
export interface AIEmotionResponse {
  emotion: string;
  confidence: number;
}

export interface AIChatResponse {
  message: string;
  followupQuestions?: string[];
}

export interface AIPromptResponse {
  prompt: string;
  type: 'morning' | 'afternoon' | 'evening' | 'emotion-based';
}

// OGP画像オブジェクトの型定義
export interface OGPImage {
  url?: string;
  width?: string | number;
  height?: string | number;
  type?: string;
  [key: string]: unknown;
}

// レート制限設定の型定義
export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

// open-graph-scraperの結果型を拡張
declare module 'open-graph-scraper' {
  interface OpenGraphScraperResult {
    ogTitle?: string;
    ogDescription?: string;
    ogUrl?: string;
    ogSiteName?: string;
    ogImage?: string | string[] | OGPImage | OGPImage[];
    [key: string]: unknown;
  }
}

// CORS設定の型定義
export interface CorsConfig {
  allowedMethods: string[];
  allowedHeaders: string[];
  allowedOrigins: string[];
}

// キャッシュ設定の型定義
export interface CacheConfig {
  ttl: number;
  keyPrefix: string;
}

// Worker設定の型定義
export interface WorkerConfig {
  rateLimit: RateLimitConfig;
  cache: CacheConfig;
  cors: CorsConfig;
}
