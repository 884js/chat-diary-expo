import { Image } from '@/components/Image';
import { Text, View } from '@/components/Themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable } from 'react-native';

type OGP = {
  ogTitle: string;
  ogType: string;
  ogUrl: string;
  ogDescription: string;
  ogImage: {
    height: string;
    type: string;
    url: string;
    width: string;
  }[];
  charset: string;
  requestUrl: string;
  success: boolean;
};

type Props = {
  content: string;
};

export const OGPCardList = ({ content }: Props) => {
  const [ogpList, setOgpList] = useState<OGP[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const ogps = content.match(/https?:\/\/[^\s]+/g);
        if (ogps && ogps.length > 0) {
          const promises = ogps.map(async (ogp) => {
            try {
              const response = await fetch(`/get-ogp?url=${ogp}`);
              if (response.status >= 500) {
                return null;
              }
              if (!response.ok) {
                return null;
              }
              const data = await response.json();
              return data;
            } catch (err) {
              return null;
            }
          });

          const results = await Promise.all(promises);
          setOgpList(results.filter(Boolean));
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    })();
  }, [content]);

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (err) {}
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
          key={`${ogp.ogTitle}-${index}`}
          className="my-1 rounded-lg border border-gray-200 overflow-hidden bg-white"
          onPress={() => handleOpenLink(ogp.ogUrl)}
        >
          <View className="flex-row items-center !bg-white">
            {ogp.ogImage && ogp.ogImage.length > 0 && ogp.ogImage[0]?.url ? (
              <View className="w-20 h-20 bg-gray-100">
                <Image
                  source={ogp.ogImage[0].url}
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
                {ogp.ogTitle || 'タイトルなし'}
              </Text>
              {ogp.ogDescription && (
                <Text
                  className="text-xs text-gray-600 mb-0.5"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {ogp.ogDescription}
                </Text>
              )}
              <Text
                className="text-[11px] text-gray-500"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {ogp.ogUrl}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
};
