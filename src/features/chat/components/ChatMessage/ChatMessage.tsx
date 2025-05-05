import { Text, View } from '@/components/Themed';
import { useStorageImage } from '@/hooks/useStorageImage';
import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useMessageAction } from '../../contexts/MessageActionContext';
import { ReactionPicker } from './ReactionPicker';
// リアクション型定義
type Reaction = {
  emoji: string;
  count: number;
  users: string[]; // リアクションしたユーザーのID
};

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
  isFromReceiver: boolean;
  timestamp: string;
  imagePath?: string | null;
  isOwner: boolean;
}

export function ChatMessage({
  id,
  content,
  timestamp,
  imagePath = null,
  owner,
  replyTo,
}: MessageProps) {
  const { messageId } = useMessageAction();
  const router = useRouter();

  // アバター画像のURL
  const avatarUrl = owner.avatar_url;
  const displayName = owner.display_name;
  const { imageUrl: storageImageUrl, isLoading: isLoadingImage } =
    useStorageImage({
      imagePath,
      storageName: 'chats',
    });

  // スタンプ選択ピッカーの表示状態
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);

  // メッセージに対するリアクション状態（本来はAPIから取得）
  const [reactions, setReactions] = useState<Reaction[]>([
    { emoji: '👍', count: 2, users: ['user1', 'user2'] },
    { emoji: '❤️', count: 1, users: ['user3'] },
  ]);

  // 現在のユーザーID（仮の値、実際には認証コンテキストなどから取得）
  const currentUserId = 'user1';

  // コンテキストメニューを開く
  const handleLongPress = () => {
    router.navigate(`/(chat)/message-context-menu?messageId=${id}`);
  };

  // リアクション追加/削除処理
  const handleReaction = (emoji: string) => {
    // 既存のリアクションを確認
    const existingReaction = reactions.find((r) => r.emoji === emoji);

    if (existingReaction) {
      // ユーザーが既にリアクションしているか確認
      const userReacted = existingReaction.users.includes(currentUserId);

      if (userReacted) {
        // リアクション削除
        if (existingReaction.count === 1) {
          // リアクション自体を削除
          setReactions(reactions.filter((r) => r.emoji !== emoji));
        } else {
          // カウントを減らし、ユーザーを削除
          setReactions(
            reactions.map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.count - 1,
                    users: r.users.filter((id) => id !== currentUserId),
                  }
                : r,
            ),
          );
        }
      } else {
        // リアクション追加
        setReactions(
          reactions.map((r) =>
            r.emoji === emoji
              ? { ...r, count: r.count + 1, users: [...r.users, currentUserId] }
              : r,
          ),
        );
      }
    } else {
      // 新しいリアクションを追加
      setReactions([...reactions, { emoji, count: 1, users: [currentUserId] }]);
    }
  };

  return (
    <View
      className={`flex-row mb-2 transition-all px-2 py-1 w-full ${
        messageId === id ? "bg-gray-100" : ""
      }`}
    >
      {/* プロフィール画像 */}
      <View className="w-10 h-10 rounded-md overflow-hidden mr-3">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-full h-full rounded-md"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-gray-300">
            <Text className="text-gray-500 text-sm font-medium">
              {displayName.charAt(0)}
            </Text>
          </View>
        )}
      </View>

      {/* メッセージコンテンツ */}
      <View className="flex-1 min-w-0 relative">
        {/* メッセージ内容部分 */}
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={handleLongPress}
          delayLongPress={300}
        >
          <View className="flex-1 text-gray-500">
            {replyTo && (
              <View>
                <Text className="text-xs text-gray-500">{replyTo.content}</Text>
                <View className="border-b border-gray-200 pt-2 rounded-md" />
              </View>
            )}

            {content && <Text>{content}</Text>}

            {/* 画像があれば表示する */}
            {isLoadingImage ? (
              <View className="h-[200px] justify-center items-center mt-2">
                <ActivityIndicator size="small" color="#888" />
              </View>
            ) : storageImageUrl ? (
              <View className="mt-2">
                <Image
                  source={{ uri: storageImageUrl }}
                  style={{ width: "100%", height: 200, borderRadius: 12 }}
                  resizeMode="cover"
                />
              </View>
            ) : null}

            {/* リアクション表示エリア */}
            {/* <View className="mt-2 flex-row items-center">
              <View className="flex-row flex-wrap">
                {reactions.length > 0 &&
                  reactions.map((reaction) => (
                    <MessageReaction
                      key={reaction.emoji}
                      emoji={reaction.emoji}
                      count={reaction.count}
                      isActive={reaction.users.includes(currentUserId)}
                      onClick={() => handleReaction(reaction.emoji)}
                    />
                  ))}
              </View>
              <View className="ml-2">
                <ReactionButton onClick={() => setIsReactionPickerOpen(true)} />
              </View>
            </View> */}

            {/* タイムスタンプ */}
            <View className="flex-row justify-end">
              <Text className="text-xs text-gray-500 mt-1">{timestamp}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* リアクションピッカーモーダル */}
      <ReactionPicker
        isVisible={isReactionPickerOpen}
        onSelectEmoji={handleReaction}
        onClose={() => setIsReactionPickerOpen(false)}
      />
    </View>
  );
}
