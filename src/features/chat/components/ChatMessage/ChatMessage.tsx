import { Image } from '@/components/Image';
import { Text, View } from '@/components/Themed';
import { useStorageImage } from '@/hooks/useStorageImage';
import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, Easing, Pressable } from 'react-native';
import type { SelectedMessage } from '../../contexts/MessageActionContext';
import { useMessageAction } from '../../contexts/MessageActionContext';
import { type Emotion, emotions } from '../../hooks/useChatInputEmotion';
import { ChatImage } from './ChatImage';

export interface MessageProps {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  replyTo: ChatRoomMessage | null;
  owner: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
  timestamp: string;
  imagePath?: string | null;
  emotion?: Emotion['slug'];
  isStocked: boolean;
  onOpenStockMenu: (message: SelectedMessage) => void;
}

export function ChatMessage({
  id,
  content,
  timestamp,
  imagePath = null,
  owner,
  replyTo,
  emotion,
  isStocked,
  onOpenStockMenu,
}: MessageProps) {
  const { selectedMessage } = useMessageAction();

  // アニメーション用の値
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgColorAnim = useRef(new Animated.Value(0)).current;

  // アバター画像のURL
  const avatarUrl = owner.avatar_url;
  const displayName = owner.display_name;
  const { imageUrl: storageImageUrl, isLoading: isLoadingImage } =
    useStorageImage({
      imagePath,
      storageName: 'chats',
    });

  const isSelected = selectedMessage?.id === id;

  // 該当するemotionを検索
  const emotionData = emotion ? emotions.find((e) => e.slug === emotion) : null;

  // タップ時のアニメーション
  const startPressAnimation = () => {
    // アニメーションをリセット
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bgColorAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  // タップ解除時のアニメーション
  const startReleaseAnimation = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.elastic(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(bgColorAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  // プレス状態の処理
  const handlePressIn = () => {
    startPressAnimation();
  };

  const handlePressOut = () => {
    startReleaseAnimation();
  };

  // 背景色の補間
  const interpolatedBgColor = bgColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0)', 'rgba(230, 230, 230, 0.5)'],
  });

  // emotionに基づくボーダースタイル
  const messageBorderStyle = emotionData
    ? {
        borderWidth: 1,
        borderColor: emotionData.color,
        borderRadius: 8,
      }
    : {};

  return (
    <View className="flex-row mb-2 py-1 w-full p-2 !bg-gray-100">
      {/* プロフィール画像 */}
      <View className="w-10 h-10 rounded-md overflow-hidden mr-3">
        {avatarUrl ? (
          <Image source={avatarUrl} style={{ width: 40, height: 40 }} />
        ) : (
          <View className="w-full h-full items-center justify-center bg-gray-300">
            <Text className="text-gray-500 text-sm font-medium">
              {displayName.charAt(0)}
            </Text>
          </View>
        )}
      </View>

      {/* メッセージコンテンツ */}
      <View
        className="flex-1 min-w-0 relative p-2 rounded-lg"
        style={messageBorderStyle}
      >
        {/* メッセージ内容部分 */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            borderRadius: 8,
          }}
        >
          <Pressable
            onLongPress={() => onOpenStockMenu({ id, content, emotion })}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            delayLongPress={150}
            style={({ pressed }) => ({
              borderRadius: 8,
              padding: 8,
              overflow: 'hidden',
            })}
          >
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: interpolatedBgColor,
                borderRadius: 8,
              }}
            />

            <View
              className={`flex-1 bg-transparent ${
                isSelected ? 'bg-gray-100' : ''
              }`}
            >
              {replyTo && (
                <View className="mb-2 pb-2 border-b border-gray-200 bg-transparent">
                  <Text className="text-xs !text-gray-500">
                    {replyTo.content}
                  </Text>
                </View>
              )}

              <View className="flex-row items-center">
                {content && <Text className="flex-1">{content}</Text>}
              </View>

              {storageImageUrl ? (
                <View className="mt-2 w-full bg-transparent">
                  <ChatImage imageUrl={storageImageUrl} fullWidth={true} />
                </View>
              ) : null}

              {/* タイムスタンプと感情アイコン */}
              <View className="flex-row justify-end items-center bg-transparent mt-1 gap-1">
                {emotionData && (
                  <View className="ml-1">
                    <MaterialCommunityIcons
                      name={emotionData.icon}
                      size={16}
                      color={emotionData.color}
                    />
                  </View>
                )}
                {isStocked && (
                  <View className="mr-1">
                    <MaterialCommunityIcons
                      name="archive"
                      size={16}
                      color="#3B82F6"
                    />
                  </View>
                )}
                <Text className="text-xs text-gray-500">{timestamp}</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
