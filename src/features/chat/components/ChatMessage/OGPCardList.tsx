import { Image } from '@/components/Image';
import { Text, View } from '@/components/Themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable } from 'react-native';

// --- util -------------------------------------------------------------
const URL_REGEX =
  /https?:\/\/[^\s\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef]+/g;
// ---------------------------------------------------------------------

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
  onRendered?: () => void;
};

export const OGPCardList = ({ content, onRendered }: Props) => {
  const [ogpList, setOgpList] = useState<OGPResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // content から URL を抽出して重複排除。memo で不要な再計算を防ぐ
  const urls = useMemo<string[]>(() => {
    const match = content.match(URL_REGEX);
    return match ? [...new Set(match)] : [];
  }, [content]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // URL が無い：即座にリセットして描画完了を通知
    if (urls.length === 0) {
      setOgpList([]);
      setError(null);
      setLoading(false);
      onRendered?.();
      return;
    }

    // フェッチ用 AbortController を URL ごとに保持
    const controllers: AbortController[] = [];
    let cancelled = false;

    const fetchOgp = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled(
          urls.map((url) => {
            const controller = new AbortController();
            controllers.push(controller);
            const apiUrl =
              process.env.EXPO_PUBLIC_OGP_WORKER_URL ??
              'https://chat-diary-ogp-api.mmmr0628.workers.dev';

            return fetch(`${apiUrl}/api/ogp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url }),
              signal: controller.signal,
            }).then(async (res) => {
              if (!res.ok) return null;
              const data: OGPResponse = await res.json();
              if (!data.title?.trim()) return null;
              return data;
            });
          }),
        );

        if (cancelled) return;

        const valid = results
          .filter(
            (r): r is PromiseFulfilledResult<OGPResponse | null> =>
              r.status === 'fulfilled',
          )
          .map((r) => r.value)
          .filter((v): v is OGPResponse => v !== null);

        setOgpList(valid);
      } catch (e) {
        if (!cancelled) {
          console.error('OGP processing error:', e);
          setError('リンク情報の取得に失敗しました');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          onRendered?.();
        }
      }
    };

    fetchOgp();

    // クリーンアップ：未完了フェッチを中断
    return () => {
      cancelled = true;
      for (const c of controllers) {
        c.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls]);

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error('Failed to open URL:', url, err);
    }
  };

  if (loading) {
    // URLが含まれている場合のみ、小さなローディング表示
    if (urls.length === 0) return null;

    return (
      <View
        className="flex-row items-center justify-center p-1 my-1"
        style={{ minHeight: 80 }}
      >
        <ActivityIndicator size="small" color="#9ca3af" />
        <Text className="text-[10px] text-gray-500 ml-1">
          リンク読み込み中...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="flex-row items-center p-2 bg-red-100 rounded-lg my-1"
        style={{ minHeight: 32 }}
      >
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
