import { Loader } from '@/components/Loader';
import { View } from '@/components/Themed';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useCurrentUserRoom } from '@/features/user/hooks/useCurrentUserRoom';
import { useRoomUserMessages } from '@/features/user/hooks/useRoomUserMessages';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { useSupabase } from '@/hooks/useSupabase';
import { format } from 'date-fns';
import type { View as ViewType } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { ChatHeader } from '../components/ChatHeader';
import { ChatInput } from '../components/ChatInput';
import { ChatMessageList } from '../components/ChatMessageList/ChatMessageList';
import { useMessageAction } from '../contexts/MessageActionContext';
import { useChatScrollToDate } from '../hooks/useChatScrollToDate';
import { useSendMessage } from '../hooks/useSendMessage';
import type { Emotion } from '../hooks/useChatInputEmotion';

export const ChatScreen = () => {
  const { api } = useSupabase();
  const { sendMessage, variables, isPending } = useSendMessage();
  const { currentUser } = useCurrentUser();
  const { chatRoom, isLoadingRoom } = useCurrentUserRoom({
    userId: currentUser?.id ?? '',
  });
  const { listItemRefs, scrollRef, handleScrollToDate } = useChatScrollToDate();
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
    imageUri,
    emotion,
  }: {
    imagePath?: string;
    message: string;
    imageUri?: string;
    emotion?: Emotion['slug'];
  }) => {
    if (!chatRoom?.id || !currentUser?.id) return;

    const trimmedMessage = message.trim();

    const senderType = isOwner ? 'user' : 'ai';

    if (mode === 'edit') {
      await handleSaveEdit({ message: trimmedMessage, emotion: emotion });
      refetchMessages();
      return;
    }

    if (mode === 'reply') {
      await handleSendReplyMessage({ message: trimmedMessage, emotion: emotion });
      refetchMessages();
      return;
    }

    try {
      let uploadedImagePath = imagePath;

      // 画像がある場合はアップロード処理
      if (imageUri) {
        const result = await api.chatRoomMessage.uploadChatImage({
          file: { uri: imageUri, type: 'image/jpeg' },
          userId: currentUser.id,
        });
        uploadedImagePath = result.path;
      }

      // メッセージ送信
      await sendMessage({
        senderType,
        content: trimmedMessage,
        imagePath: uploadedImagePath,
        emotion: emotion,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!chatRoom) {
    return <Loader />;
  }

  const messagesWithRefs = messages.map((message) => ({
    ...message,
    ref: (node: ViewType) => {
      const key = format(message.date || '', 'yyyy-MM-dd');
      if (node) {
        listItemRefs.current[key] = node;
      } else {
        delete listItemRefs.current[key];
      }
    },
  }));

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
        <View className="flex-1 bg-gray-100">
          <ChatHeader onScrollToDate={handleScrollToDate} />
          <ChatMessageList
            scrollViewRef={scrollRef}
            chatRoom={chatRoom}
            isLoading={isLoadingRoom}
            messages={messagesWithRefs}
            isChatEnded={false}
            isOwner={true}
            isPending={isPending ?? false}
            sendingMessage={variables}
          />
          <ChatInput onSend={handleSendMessage} isDisabled={false} />
        </View>
      </KeyboardAvoidingView>
    </>
  );
};
