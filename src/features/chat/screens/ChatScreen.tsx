import { useCurrentUserRoom } from '@/features/user/hooks/useCurrentUserRoom';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { Text } from 'react-native';
import { ChatHeader } from '../components/ChatHeader';
import { ChatInput } from '../components/ChatInput';
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={60}
    >
      <View className="flex-1">
        <ChatHeader />
        <ChatMessages
          chatRoom={chatRoom}
          isLoading={false}
          messages={chatRoom.chat_room_messages}
          isChatEnded={false}
          isOwner={true}
        />
        <ChatInput
          onSend={() => {}}
          isDisabled={false}
          onHeightChange={() => {}}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
