import { View } from '@/components/Themed';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useCurrentUserRoom } from '@/features/user/hooks/useCurrentUserRoom';
import { useRoomUserMessages } from '@/features/user/hooks/useRoomUserMessages';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import {
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChatHeader } from '../components/ChatHeader';
import { ChatInput } from '../components/ChatInput';
import { ChatMessageList } from "../components/ChatMessageList/ChatMessageList";
import { useMessageAction } from '../contexts/MessageActionContext';
import { useSendMessage } from '../hooks/useSendMessage';
import { Loader } from "@/components/Loader";

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

  if (isLoadingRoom) {
    return <Loader />;
  }

  if (!chatRoom) {
    return <Loader />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View className="flex-1">
        <ChatHeader />
        <ChatMessageList
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
