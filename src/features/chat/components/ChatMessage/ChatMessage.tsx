import { Image } from '@/components/Image';
import { Text, View } from '@/components/Themed';
import { useStorageImage } from '@/hooks/useStorageImage';
import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { Pressable } from 'react-native';
import { useMessageAction } from '../../contexts/MessageActionContext';
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
  const { messageId, bottomSheetModalRef, handleOpenMenu } = useMessageAction();

  // アバター画像のURL
  const avatarUrl = owner.avatar_url;
  const displayName = owner.display_name;
  const { imageUrl: storageImageUrl, isLoading: isLoadingImage } =
    useStorageImage({
      imagePath,
      storageName: 'chats',
    });

  const isSelected = messageId === id;
  const backgroundClassName = isSelected ? '!bg-gray-100' : '';

  return (
    <View
      className={`flex-row mb-2 transition-all py-1 w-full ${backgroundClassName} p-2 rounded-md`}
    >
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
      <View className="flex-1 min-w-0 relative">
        {/* メッセージ内容部分 */}
        <Pressable
          onLongPress={() => handleOpenMenu(id)}
          delayLongPress={200}
          style={({ pressed }) => [
            {
              borderRadius: 8,
              padding: 6,
              backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
            },
          ]}
        >
          <View className={`flex-1 ${backgroundClassName}`}>
            {replyTo && (
              <View className="mb-2 pb-2 border-b border-gray-200">
                <Text className="text-xs !text-gray-500">
                  {replyTo.content}
                </Text>
              </View>
            )}

            {content && <Text>{content}</Text>}

            {storageImageUrl ? (
              <View className="mt-2 w-full">
                <ChatImage imageUrl={storageImageUrl} fullWidth={true} />
              </View>
            ) : null}

            {/* タイムスタンプ */}
            <View className={`flex-row justify-end ${backgroundClassName}`}>
              <Text className="text-xs text-gray-500 mt-1">{timestamp}</Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
