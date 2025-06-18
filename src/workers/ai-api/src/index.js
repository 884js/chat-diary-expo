/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { DEFAULT_CONFIG, ERROR_CODES, createCacheKey, createRateLimitKey, } from './config.js';
const app = new Hono();
// CORS設定
app.use('*', cors({
    origin: '*',
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
}));
// ユーティリティ関数
function isValidUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    }
    catch {
        return false;
    }
}
// レート制限チェック
async function checkRateLimit(env, clientIP) {
    const key = createRateLimitKey(clientIP);
    const now = Date.now();
    const windowStart = now - DEFAULT_CONFIG.rateLimit.windowMs;
    try {
        const rateLimitData = await env.RATE_LIMIT.get(key);
        let requests = rateLimitData ? JSON.parse(rateLimitData) : [];
        requests = requests.filter((timestamp) => timestamp > windowStart);
        if (requests.length >= DEFAULT_CONFIG.rateLimit.limit) {
            return false;
        }
        requests.push(now);
        await env.RATE_LIMIT.put(key, JSON.stringify(requests), {
            expirationTtl: Math.ceil(DEFAULT_CONFIG.rateLimit.windowMs / 1000),
        });
        return true;
    }
    catch (error) {
        console.error('Rate limit check failed:', error);
        return true;
    }
}
// HTMLRewriterを使ったOGP抽出
async function extractOGPWithRewriter(html, originalUrl) {
    const ogData = {
        url: originalUrl,
        images: [],
    };
    const rewriter = new HTMLRewriter()
        .on('meta[property^="og:"]', {
        element(element) {
            const property = element.getAttribute('property');
            const content = element.getAttribute('content');
            if (!property || !content)
                return;
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
    }
    catch (error) {
        console.error('HTMLRewriter error:', error);
        return null;
    }
}
// OGP取得
async function fetchOGP(url) {
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
    }
    catch (error) {
        console.error('OGP fetch error:', error);
        return null;
    }
}
// AI関連のユーティリティ関数
function createAIClient(apiKey) {
    return new GoogleGenerativeAI(apiKey);
}
// 感情判定用のAI関数
async function analyzeEmotion(message, apiKey) {
    const genAI = createAIClient(apiKey);
    const generationConfig = {
        responseMimeType: 'application/json',
        responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
                emotion: {
                    type: SchemaType.STRING
                },
                confidence: {
                    type: SchemaType.NUMBER
                }
            },
            required: ['emotion', 'confidence']
        },
        temperature: 0.3,
    };
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig,
    });
    const systemInstruction = `あなたは日記メッセージの感情を分析するAIです。

以下の4つの感情のいずれかに分類してください：
- happy: 嬉しい、楽しい、幸せな感情
- normal: 普通、中立的な感情
- sad: 悲しい、落ち込んだ、つらい感情  
- angry: 怒り、イライラ、不満の感情

confidenceは0.0-1.0の値で、判定の確信度を示してください。

JSON形式で回答してください：
{
  "emotion": "感情カテゴリ",
  "confidence": 0.8
}`;
    try {
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: message }],
                },
            ],
            systemInstruction: {
                role: 'model',
                parts: [{ text: systemInstruction }],
            },
        });
        const responseText = result.response.text();
        const emotionData = JSON.parse(responseText);
        return {
            emotion: emotionData.emotion,
            confidence: emotionData.confidence,
        };
    }
    catch (error) {
        console.error('Emotion analysis error:', error);
        // デフォルトフォールバック
        return {
            emotion: 'normal',
            confidence: 0.5,
        };
    }
}
// AI応答生成関数
async function generateAIResponse(message, emotion, apiKey) {
    const genAI = createAIClient(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200,
        },
    });
    const emotionContext = {
        happy: '嬉しそうですね！',
        normal: 'そうなんですね。',
        sad: '大変でしたね。',
        angry: 'お疲れさまです。'
    };
    const systemInstruction = `あなたは優しい日記の相談相手AIです。ユーザーの日記メッセージに対して共感的で温かい返答をしてください。

特徴：
- 2-3文程度の短い返答
- 共感と理解を示す
- 自然な掘り下げ質問を1つ含める
- 日本語で丁寧に話す
- 相手の感情に寄り添う

現在のユーザーの感情: ${emotion}
感情に応じた応答の開始フレーズ: ${emotionContext[emotion]}`;
    try {
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: message }],
                },
            ],
            systemInstruction: {
                role: 'model',
                parts: [{ text: systemInstruction }],
            },
        });
        const responseText = result.response.text();
        return {
            message: responseText.trim(),
            followupQuestions: [], // 今後拡張可能
        };
    }
    catch (error) {
        console.error('AI response generation error:', error);
        // デフォルトフォールバック
        return {
            message: 'お疲れさまです。今日もお話を聞かせてくれてありがとうございます。',
            followupQuestions: [],
        };
    }
}
// OGP API エンドポイント
app.post('/api/ogp', async (c) => {
    const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';
    try {
        // レート制限チェック
        const rateLimitOk = await checkRateLimit(c.env, clientIP);
        if (!rateLimitOk) {
            return c.json({ error: 'Rate limit exceeded', code: ERROR_CODES.RATE_LIMIT }, 429);
        }
        // リクエストボディ解析
        const body = await c.req.json();
        const targetUrl = body?.url;
        if (!targetUrl || typeof targetUrl !== 'string') {
            return c.json({ error: 'URL is required', code: ERROR_CODES.INVALID_URL }, 400);
        }
        // URL検証
        if (!isValidUrl(targetUrl)) {
            return c.json({ error: 'Invalid URL format', code: ERROR_CODES.INVALID_URL }, 400);
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
            return c.json({ error: 'Failed to fetch OGP data', code: ERROR_CODES.FETCH_FAILED }, 400);
        }
        // キャッシュに保存
        c.executionCtx.waitUntil(c.env.OGP_CACHE.put(cacheKey, JSON.stringify(ogpData), {
            expirationTtl: DEFAULT_CONFIG.cache.ttl,
        }));
        const response = c.json(ogpData);
        response.headers.set('X-Cache', 'MISS');
        return response;
    }
    catch (error) {
        console.error('API error:', error);
        return c.json({ error: 'Internal server error', code: ERROR_CODES.INTERNAL_ERROR }, 500);
    }
});
// AI感情判定エンドポイント
app.post('/api/ai-emotion', async (c) => {
    const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';
    try {
        // レート制限チェック
        const rateLimitOk = await checkRateLimit(c.env, clientIP);
        if (!rateLimitOk) {
            return c.json({ error: 'Rate limit exceeded', code: ERROR_CODES.RATE_LIMIT }, 429);
        }
        // リクエストボディ解析
        const body = await c.req.json();
        const message = body?.message;
        if (!message || typeof message !== 'string') {
            return c.json({ error: 'Message is required', code: ERROR_CODES.INVALID_URL }, 400);
        }
        if (!c.env.GEMINI_API_KEY) {
            return c.json({ error: 'AI service unavailable', code: ERROR_CODES.INTERNAL_ERROR }, 500);
        }
        // AI感情判定
        const emotionResult = await analyzeEmotion(message, c.env.GEMINI_API_KEY);
        return c.json(emotionResult);
    }
    catch (error) {
        console.error('AI emotion analysis error:', error);
        return c.json({ error: 'Internal server error', code: ERROR_CODES.INTERNAL_ERROR }, 500);
    }
});
// AI応答生成エンドポイント
app.post('/api/ai-chat', async (c) => {
    const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';
    try {
        // レート制限チェック
        const rateLimitOk = await checkRateLimit(c.env, clientIP);
        if (!rateLimitOk) {
            return c.json({ error: 'Rate limit exceeded', code: ERROR_CODES.RATE_LIMIT }, 429);
        }
        // リクエストボディ解析
        const body = await c.req.json();
        const { message, emotion } = body;
        if (!message || typeof message !== 'string') {
            return c.json({ error: 'Message is required', code: ERROR_CODES.INVALID_URL }, 400);
        }
        if (!c.env.GEMINI_API_KEY) {
            return c.json({ error: 'AI service unavailable', code: ERROR_CODES.INTERNAL_ERROR }, 500);
        }
        // AI応答生成
        const chatResponse = await generateAIResponse(message, emotion || 'normal', c.env.GEMINI_API_KEY);
        return c.json(chatResponse);
    }
    catch (error) {
        console.error('AI chat response error:', error);
        return c.json({ error: 'Internal server error', code: ERROR_CODES.INTERNAL_ERROR }, 500);
    }
});
// 感情判定 + AI応答の統合エンドポイント
app.post('/api/ai-message', async (c) => {
    const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';
    try {
        // レート制限チェック
        const rateLimitOk = await checkRateLimit(c.env, clientIP);
        if (!rateLimitOk) {
            return c.json({ error: 'Rate limit exceeded', code: ERROR_CODES.RATE_LIMIT }, 429);
        }
        // リクエストボディ解析
        const body = await c.req.json();
        const message = body?.message;
        if (!message || typeof message !== 'string') {
            return c.json({ error: 'Message is required', code: ERROR_CODES.INVALID_URL }, 400);
        }
        if (!c.env.GEMINI_API_KEY) {
            return c.json({ error: 'AI service unavailable', code: ERROR_CODES.INTERNAL_ERROR }, 500);
        }
        // 1. 感情判定
        const emotionResult = await analyzeEmotion(message, c.env.GEMINI_API_KEY);
        // 2. AI応答生成
        const chatResponse = await generateAIResponse(message, emotionResult.emotion, c.env.GEMINI_API_KEY);
        // 統合レスポンス
        return c.json({
            emotion: emotionResult,
            response: chatResponse,
        });
    }
    catch (error) {
        console.error('AI message processing error:', error);
        return c.json({ error: 'Internal server error', code: ERROR_CODES.INTERNAL_ERROR }, 500);
    }
});
// AI問いかけ生成関数
async function generatePrompt(type, emotion, apiKey) {
    if (!apiKey) {
        // APIキーがない場合のフォールバック
        const prompts = {
            morning: '今日はどんな一日にしたいですか？',
            afternoon: 'お疲れさま！午前中はどうでしたか？',
            evening: '一日お疲れさまでした！今日印象的だったことはありますか？',
            'emotion-based': '最近どんなことがありましたか？'
        };
        return prompts[type];
    }
    const genAI = createAIClient(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 100,
        },
    });
    const prompts = {
        morning: '朝の日記プロンプトを1つ生成してください。今日の予定や目標、気持ちについて聞く質問にしてください。',
        afternoon: '午後の日記プロンプトを1つ生成してください。午前中の振り返りや現在の気持ちについて聞く質問にしてください。',
        evening: '夜の日記プロンプトを1つ生成してください。一日の振り返りや印象的な出来事について聞く質問にしてください。',
        'emotion-based': `${emotion}の感情に適した日記プロンプトを1つ生成してください。その感情に寄り添った質問にしてください。`
    };
    const systemInstruction = `あなたは日記を書くきっかけを作るプロンプト生成AIです。

要求：
- 1文の短い質問形式
- 親しみやすく優しい口調
- 具体的で答えやすい内容
- 日本語で出力
- 質問文のみを出力（説明や前置きは不要）

例：
- 今日一番印象に残ったことは何ですか？
- 最近嬉しかった小さな出来事はありますか？
- 今の気持ちを一言で表すとどんな感じですか？`;
    try {
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompts[type] }],
                },
            ],
            systemInstruction: {
                role: 'model',
                parts: [{ text: systemInstruction }],
            },
        });
        return result.response.text().trim();
    }
    catch (error) {
        console.error('AI prompt generation error:', error);
        // フォールバック
        const fallbacks = {
            morning: '今日はどんな気分で始まりましたか？',
            afternoon: '午前中で一番印象に残ったことは何ですか？',
            evening: '今日を振り返って、どんな一日でしたか？',
            'emotion-based': '最近のことで何か話したいことはありますか？'
        };
        return fallbacks[type];
    }
}
// AI問いかけエンドポイント
app.post('/api/ai-prompt', async (c) => {
    const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';
    try {
        // レート制限チェック
        const rateLimitOk = await checkRateLimit(c.env, clientIP);
        if (!rateLimitOk) {
            return c.json({ error: 'Rate limit exceeded', code: ERROR_CODES.RATE_LIMIT }, 429);
        }
        // リクエストボディ解析
        const body = await c.req.json();
        const { type, emotion } = body;
        if (!type || !['morning', 'afternoon', 'evening', 'emotion-based'].includes(type)) {
            return c.json({ error: 'Invalid prompt type', code: ERROR_CODES.INVALID_URL }, 400);
        }
        // AI問いかけ生成
        const prompt = await generatePrompt(type, emotion, c.env.GEMINI_API_KEY);
        return c.json({
            prompt,
            type,
        });
    }
    catch (error) {
        console.error('AI prompt generation error:', error);
        return c.json({ error: 'Internal server error', code: ERROR_CODES.INTERNAL_ERROR }, 500);
    }
});
// 404ハンドラー
app.notFound((c) => {
    return c.json({ error: 'Not found', code: ERROR_CODES.NOT_FOUND }, 404);
});
export default app;
