import { View } from 'react-native';
import { ChatHeader } from '../components/ChatHeader';
import { ChatMessages } from '../components/ChatMessages';
import { useCurrentUserRoom } from '@/features/user/hooks/useCurrentUserRoom';
import { Text } from 'react-native';
// デモ用のチャットルームデータ
const demoOwner = {
  id: 'user1',
  display_name: 'ユーザー1',
  avatar_url: 'https://placehold.co/200x200', // ダミー画像URL
};

const demoChatRoom = {
  owner: demoOwner,
};

// デモ用のメッセージデータ
const demoMessages = [
  {
    id: '1',
    content: 'こんにちは！ExpoとReactNativeでチャットアプリを作っています。',
    sender: 'user' as const,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1時間前
    reply_to: null,
    image_path: null,
  },
  {
    id: '2',
    content: 'UIをNextJSからExpoに移植することができました。',
    sender: 'ai' as const,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45分前
    reply_to: null,
    image_path: null,
  },
  {
    id: '3',
    content:
      'NativeWindを使ってスタイリングしています。Tailwindと同じ書き方ができて便利ですね！',
    sender: 'user' as const,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分前
    reply_to: {
      id: '2',
      content: 'UIをNextJSからExpoに移植することができました。',
    },
    image_path: null,
  },
  {
    id: '4',
    content: '絵文字リアクションや返信などの機能も実装できました 🎉',
    sender: 'ai' as const,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15分前
    reply_to: null,
    image_path: null,
  },
];

export const ChatScreen = () => {
  const { chatRoom } = useCurrentUserRoom();

  if (!chatRoom) {
    return <Text>チャットルームが見つかりません</Text>;
  }

  return (
    <View className="flex-1">
      <ChatHeader />
      <ChatMessages
        chatRoom={chatRoom}
        isLoading={false}
        messages={chatRoom.chat_room_messages}
        isChatEnded={false}
        isOwner={true}
      />
    </View>
  );
};
