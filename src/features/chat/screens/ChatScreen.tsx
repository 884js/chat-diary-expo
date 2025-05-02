import { useCurrentUserRoom } from '@/features/user/hooks/useCurrentUserRoom';
import { ActivityIndicator, View } from 'react-native';
import { Text } from 'react-native';
import { ChatHeader } from '../components/ChatHeader';
import { ChatMessages } from '../components/ChatMessages';

export const ChatScreen = () => {
  const { chatRoom, isLoadingRoom } = useCurrentUserRoom();

  if (isLoadingRoom) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

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
