import {
  type GenerationConfig,
  GoogleGenerativeAI,
  type Schema,
  SchemaType,
} from '@google/generative-ai';

export async function POST(request: Request) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const { messagesText } = await request.json();

  const generationConfig = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        good: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
        },
        new: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
        },
      },
      required: ['good', 'new'],
    } satisfies Schema,
    temperature: 0.2,
  } satisfies GenerationConfig;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-pro-exp-03-25',
    generationConfig,
  });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: messagesText }],
      },
    ],
    systemInstruction: {
      role: 'model',
      parts: [
        {
          text: `あなたは、個人の日記のような短いメッセージ群から「Good（嬉しかったこと・感謝したこと）」と「New（新しい発見・初体験）」を抽出するAIです。

出力形式は以下のJSON形式で、必ず日本語で出力してください：

{
  "good": [〜〜],
  "new": [〜〜]
}

ルール：

- 各項目は **箇条書き形式の短文**（名詞句または主語述語程度）で記述してください。
- 出力は **それぞれ3〜5件程度** が目安です。少なすぎると意味が薄れます。
- 一文に複数の話題が含まれる場合は、必要に応じて**分割して抽出**してください。
- 存在しない出来事や感情を**推測で追加しない**でください。
- 曖昧な内容は除外してください。
- 「new」は「初めてやったこと」「久しぶりにやったこと」「学び・発見」などを含みます。
- 「good」は「可愛いと感じた」「感謝した」「満足した」「ほっこりした」など主観的な幸福感を含むものを抽出してください。
- 口語は禁止です。「〜だね」「〜かな」などは使わず、整った表現にしてください。
- JSON以外のテキストを絶対に含めないでください。
`,
        },
      ],
    },
  });

  const responseJson = result.response.text(); // JSON文字列

  return new Response(responseJson, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
