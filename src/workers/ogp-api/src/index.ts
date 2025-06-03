/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';
import type { Env, OGPResponse } from '../types/index.js';
import {
  DEFAULT_CONFIG,
  ERROR_CODES,
  createCacheKey,
  createRateLimitKey,
} from './config.js';

const app = new Hono<{ Bindings: Env }>();

// CORS設定
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
);

// ユーティリティ関数
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// レート制限チェック
async function checkRateLimit(env: Env, clientIP: string): Promise<boolean> {
  const key = createRateLimitKey(clientIP);
  const now = Date.now();
  const windowStart = now - DEFAULT_CONFIG.rateLimit.windowMs;

  try {
    const rateLimitData = await env.RATE_LIMIT.get(key);
    let requests: number[] = rateLimitData ? JSON.parse(rateLimitData) : [];

    requests = requests.filter((timestamp) => timestamp > windowStart);

    if (requests.length >= DEFAULT_CONFIG.rateLimit.limit) {
      return false;
    }

    requests.push(now);
    await env.RATE_LIMIT.put(key, JSON.stringify(requests), {
      expirationTtl: Math.ceil(DEFAULT_CONFIG.rateLimit.windowMs / 1000),
    });

    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true;
  }
}

// HTMLRewriterを使ったOGP抽出
async function extractOGPWithRewriter(
  html: string,
  originalUrl: string,
): Promise<OGPResponse | null> {
  const ogData: Partial<OGPResponse> = {
    url: originalUrl,
    images: [],
  };

  const rewriter = new HTMLRewriter()
    .on('meta[property^="og:"]', {
      element(element) {
        const property = element.getAttribute('property');
        const content = element.getAttribute('content');

        if (!property || !content) return;

        switch (property.toLowerCase()) {
          case 'og:title':
            ogData.title = content;
            break;
          case 'og:description':
            ogData.description = content;
            break;
          case 'og:url':
            ogData.url = content;
            break;
          case 'og:site_name':
            ogData.siteName = content;
            break;
          case 'og:image':
            if (ogData.images && !ogData.images.includes(content)) {
              ogData.images.push(content);
            }
            break;
        }
      },
    })
    .on('title', {
      text(text) {
        if (!ogData.title && text.text) {
          ogData.title = text.text.trim();
        }
      },
    })
    .on('meta[name="description"]', {
      element(element) {
        if (!ogData.description) {
          const content = element.getAttribute('content');
          if (content) {
            ogData.description = content;
          }
        }
      },
    });

  try {
    // HTMLRewriterでパース実行
    await rewriter.transform(new Response(html)).text();

    // 最低限titleがあれば成功とみなす
    if (ogData.title) {
      return {
        title: ogData.title,
        description: ogData.description || '',
        url: ogData.url || originalUrl,
        images: ogData.images || [],
        siteName: ogData.siteName,
      };
    }

    return null;
  } catch (error) {
    console.error('HTMLRewriter error:', error);
    return null;
  }
}

// OGP取得
async function fetchOGP(url: string): Promise<OGPResponse | null> {
  try {
    // Cloudflare Workers環境でのタイムアウト実装
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OGP-Bot/1.0)',
      },
      signal: controller.signal,
    });

    // タイムアウトをクリア
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`HTTP ${response.status} for URL: ${url}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      console.warn(`Non-HTML content type: ${contentType}`);
      return null;
    }

    const html = await response.text();
    return await extractOGPWithRewriter(html, url);
  } catch (error) {
    console.error('OGP fetch error:', error);
    return null;
  }
}

// OGP API エンドポイント
app.post('/api/ogp', async (c: Context<{ Bindings: Env }>) => {
  const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';

  try {
    // レート制限チェック
    const rateLimitOk = await checkRateLimit(c.env, clientIP);
    if (!rateLimitOk) {
      return c.json(
        { error: 'Rate limit exceeded', code: ERROR_CODES.RATE_LIMIT },
        429,
      );
    }

    // リクエストボディ解析
    const body = await c.req.json();
    const targetUrl = body?.url;

    if (!targetUrl || typeof targetUrl !== 'string') {
      return c.json(
        { error: 'URL is required', code: ERROR_CODES.INVALID_URL },
        400,
      );
    }

    // URL検証
    if (!isValidUrl(targetUrl)) {
      return c.json(
        { error: 'Invalid URL format', code: ERROR_CODES.INVALID_URL },
        400,
      );
    }

    // キャッシュ確認
    const cacheKey = createCacheKey(targetUrl);
    const cached = await c.env.OGP_CACHE.get(cacheKey);

    if (cached) {
      console.log('Cache hit for:', targetUrl);
      const response = c.json(JSON.parse(cached));
      response.headers.set('X-Cache', 'HIT');
      return response;
    }

    // OGP取得
    const ogpData = await fetchOGP(targetUrl);

    if (!ogpData) {
      return c.json(
        { error: 'Failed to fetch OGP data', code: ERROR_CODES.FETCH_FAILED },
        400,
      );
    }

    // キャッシュに保存
    c.executionCtx.waitUntil(
      c.env.OGP_CACHE.put(cacheKey, JSON.stringify(ogpData), {
        expirationTtl: DEFAULT_CONFIG.cache.ttl,
      }),
    );

    const response = c.json(ogpData);
    response.headers.set('X-Cache', 'MISS');
    return response;
  } catch (error) {
    console.error('API error:', error);
    return c.json(
      { error: 'Internal server error', code: ERROR_CODES.INTERNAL_ERROR },
      500,
    );
  }
});

// 404ハンドラー
app.notFound((c: Context<{ Bindings: Env }>) => {
  return c.json({ error: 'Not found', code: ERROR_CODES.NOT_FOUND }, 404);
});

export default app;
