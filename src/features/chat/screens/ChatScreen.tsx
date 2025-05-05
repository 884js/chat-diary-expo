import { Text, View } from '@/components/Themed';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useCurrentUserRoom } from '@/features/user/hooks/useCurrentUserRoom';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChatHeader } from '../components/ChatHeader';
import { ChatInput } from '../components/ChatInput';
import { ChatMessages } from '../components/ChatMessages';
import { useMessageAction } from '../contexts/MessageActionContext';
import { useSendMessage } from '../hooks/useSendMessage';
import { useRoomUserMessages } from '@/features/user/hooks/useRoomUserMessages';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';

export const ChatScreen = () => {
  const { chatRoom, isLoadingRoom } = useCurrentUserRoom();
  const { messages, refetchMessages } = useRoomUserMessages({
    userId: chatRoom?.user_id,
  });
  const { sendMessage } = useSendMessage();
  const { currentUser } = useCurrentUser();
  const isOwner = currentUser ? currentUser.id === chatRoom?.user_id : false;
  const { mode, handleSaveEdit, handleSendReplyMessage } = useMessageAction();

  useRefreshOnFocus(refetchMessages);

  // メッセージ送信処理
  const handleSendMessage = async ({
    imagePath,
    message,
  }: {
    imagePath: string | undefined;
    message: string;
  }) => {
    if (!chatRoom?.id || !currentUser?.id) return;

    const trimmedMessage = message.trim();

    const senderType = isOwner ? 'user' : 'ai';

    if (mode === 'edit') {
      await handleSaveEdit({ message: trimmedMessage });
      refetchMessages();
      return;
    }

    if (mode === 'reply') {
      await handleSendReplyMessage({ message: trimmedMessage });
      refetchMessages();
      return;
    }

    await sendMessage({
      senderType,
      content: trimmedMessage,
      imagePath,
    });
    refetchMessages();
  };

  if (isLoadingRoom || !chatRoom || !messages) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

  if (chatRoom && messages.length === 0) {
    return (
      <View className="items-center justify-center py-10">
        <Text className="text-gray-500">まだメッセージはありません。</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View className="flex-1">
        <ChatHeader />
        <ChatMessages
          chatRoom={chatRoom}
          isLoading={isLoadingRoom}
          messages={messages}
          isChatEnded={false}
          isOwner={true}
        />
      </View>
      <ChatInput onSend={handleSendMessage} isDisabled={false} />
    </KeyboardAvoidingView>
  );
};
