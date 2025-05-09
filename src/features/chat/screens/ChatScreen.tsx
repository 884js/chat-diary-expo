import { Loader } from '@/components/Loader';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useCurrentUserRoom } from '@/features/user/hooks/useCurrentUserRoom';
import { useRoomUserMessages } from '@/features/user/hooks/useRoomUserMessages';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { ChatHeader } from '../components/ChatHeader';
import { ChatInput } from '../components/ChatInput';
import { ChatMessageList } from '../components/ChatMessageList/ChatMessageList';
import { useMessageAction } from '../contexts/MessageActionContext';
import { useSendMessage } from '../hooks/useSendMessage';
import {
  KeyboardAvoidingView,
} from "react-native-keyboard-controller";
import { Platform } from 'react-native';
import { View } from '@/components/Themed';

export const ChatScreen = () => {
  const { sendMessage, variables, isPending } = useSendMessage();
  const { currentUser } = useCurrentUser();
  const { chatRoom, isLoadingRoom } = useCurrentUserRoom({
    userId: currentUser?.id ?? '',
  });
  const { messages, refetchMessages } = useRoomUserMessages({
    userId: chatRoom?.user_id,
  });
  const isOwner = chatRoom ? chatRoom.id === chatRoom?.user_id : false;
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
  };

  if (!chatRoom) {
    return <Loader />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flexGrow: 1 }}
      behavior={"padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 25}
    >
      <View className="flex-1">
        <ChatHeader />
        <ChatMessageList
          chatRoom={chatRoom}
          isLoading={isLoadingRoom}
          messages={messages}
          isChatEnded={false}
          isOwner={true}
          isPending={isPending ?? false}
          sendingMessage={variables}
        />
        <ChatInput onSend={handleSendMessage} isDisabled={false} />
      </View>
    </KeyboardAvoidingView>
  );
};
