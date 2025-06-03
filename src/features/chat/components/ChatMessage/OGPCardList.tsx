import { Image } from '@/components/Image';
import { Text, View } from '@/components/Themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable } from 'react-native';

// 新しいAPIレスポンス型に対応
type OGPResponse = {
  title: string;
  description: string;
  url: string;
  images: string[];
  siteName?: string;
};

// APIエラーレスポンス型
type ErrorResponse = {
  error: string;
  code?: string;
};

type Props = {
  content: string;
};

export const OGPCardList = ({ content }: Props) => {
  const [ogpList, setOgpList] = useState<OGPResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // URL抽出（正規表現を改良）
        const urlRegex =
          /https?:\/\/[^\s\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef]+/g;
        const urls = content.match(urlRegex);

        if (urls && urls.length > 0) {
          // 重複URL除去
          const uniqueUrls = [...new Set(urls)];

          const promises = uniqueUrls.map(async (url) => {
            try {
              // 新しいCloudflare Worker APIエンドポイント
              const apiUrl =
                process.env.EXPO_PUBLIC_OGP_WORKER_URL ||
                'https://chat-diary-ogp-api.mmmr0628.workers.dev';

              // React Nativeでサポートされているタイムアウト実装
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 15000);

              const response = await fetch(`${apiUrl}/api/ogp`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
                signal: controller.signal,
              });

              // タイムアウトをクリア
              clearTimeout(timeoutId);

              if (!response.ok) {
                const errorData: ErrorResponse = await response
                  .json()
                  .catch(() => ({ error: 'Unknown error' }));

                // レート制限エラーの場合は特別な処理
                if (response.status === 429) {
                  console.warn('Rate limit exceeded for URL:', url);
                  return null;
                }

                console.warn(
                  'OGP API error:',
                  errorData.error,
                  'for URL:',
                  url,
                );
                return null;
              }

              const data: OGPResponse = await response.json();

              // 最低限のバリデーション
              if (!data.title || data.title.trim() === '') {
                console.warn('Invalid OGP data (no title) for URL:', url);
                return null;
              }

              return data;
            } catch (err) {
              if (err instanceof Error && err.name === 'AbortError') {
                console.warn('OGP fetch timeout for URL:', url);
              } else {
                console.warn('OGP fetch error for URL:', url, err);
              }
              return null;
            }
          });

          const results = await Promise.all(promises);
          const validResults = results.filter(
            (result): result is OGPResponse => result !== null,
          );

          setOgpList(validResults);
        }
      } catch (err) {
        console.error('OGP processing error:', err);
        setError('リンク情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, [content]);

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error('Failed to open URL:', url, err);
    }
  };

  if (loading) {
    return (
      <View className="flex-row items-center p-2 bg-gray-100 rounded-lg my-1">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="text-xs text-gray-600 ml-2">
          リンク情報を取得中...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-row items-center p-2 bg-red-100 rounded-lg my-1">
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={16}
          color="#f87171"
        />
        <Text className="text-xs text-red-500 ml-1">{error}</Text>
      </View>
    );
  }

  if (ogpList.length === 0) {
    return null;
  }

  return (
    <View className="mt-2 mb-1">
      {ogpList.map((ogp, index) => (
        <Pressable
          key={`${ogp.title}-${ogp.url}-${index}`}
          className="my-1 rounded-lg border border-gray-200 overflow-hidden bg-white"
          onPress={() => handleOpenLink(ogp.url)}
        >
          <View className="flex-row items-center !bg-white">
            {ogp.images && ogp.images.length > 0 && ogp.images[0] ? (
              <View className="w-20 h-20 bg-gray-100">
                <Image
                  source={ogp.images[0]}
                  style={{ width: 80, height: 80 }}
                />
              </View>
            ) : (
              <View className="w-20 h-20 bg-gray-100 justify-center items-center">
                <MaterialCommunityIcons name="link" size={24} color="#9ca3af" />
              </View>
            )}
            <View className="flex-1 p-2 !bg-white">
              <Text
                className="text-sm font-bold mb-0.5"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {ogp.title}
              </Text>
              {ogp.description && (
                <Text
                  className="text-xs text-gray-600 mb-0.5"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {ogp.description}
                </Text>
              )}
              {ogp.siteName && (
                <Text
                  className="text-[10px] text-blue-600 mb-0.5"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {ogp.siteName}
                </Text>
              )}
              <Text
                className="text-[11px] text-gray-500"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {ogp.url}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
};
