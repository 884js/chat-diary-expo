import { Loader } from '@/components/Loader';
import { View } from '@/components/Themed';
import { useChatRoomUserMessages } from '@/features/chat/hooks/useChatRoomUserMessages';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useCurrentUserRoom } from '@/features/user/hooks/useCurrentUserRoom';
import { useSupabase } from '@/hooks/useSupabase';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { ChatHeader } from '../components/ChatHeader';
import { ChatInput } from '../components/ChatInput';
import { ChatMessageList } from '../components/ChatMessageList/ChatMessageList';
import { useMessageAction } from '../contexts/MessageActionContext';
import type { Emotion } from '../hooks/useChatInputEmotion';
import { useSendMessageWithAI } from '../hooks/useSendMessageWithAI';
export const ChatScreen = () => {
  const { api } = useSupabase();
  const { sendMessage, variables, isPending } = useSendMessageWithAI();
  const { currentUser } = useCurrentUser();
  const { chatRoom, isLoadingRoom } = useCurrentUserRoom({
    userId: currentUser?.id ?? '',
  });
  const { messages, refetchMessages } = useChatRoomUserMessages({
    userId: chatRoom?.user_id,
  });
  const { mode, selectedMessage, handleSaveEdit, handleSendReplyMessage } = useMessageAction();

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

    if (mode === 'edit') {
      // 編集時は既存の感情を保持
      await handleSaveEdit({ content: trimmedMessage, emotion: selectedMessage?.emotion });
      refetchMessages();
      return;
    }

    if (mode === 'reply') {
      // 返信時はnormal固定（将来的にAI判定に変更可能）
      await handleSendReplyMessage({
        content: trimmedMessage,
        emotion: 'normal',
      });
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

      // メッセージ送信（AI感情判定付き）
      await sendMessage({
        content: trimmedMessage,
        imagePath: uploadedImagePath,
        emotion: emotion, // 手動で選択された場合はそれを使用、なければAI判定
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!chatRoom) {
    return <Loader />;
  }

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
        <View className="flex-1 bg-gray-100">
          <ChatHeader />
          <ChatMessageList
            chatRoom={chatRoom}
            isLoading={isLoadingRoom}
            messages={messages}
            isPending={isPending ?? false}
            sendingMessage={variables ? {
              content: variables.content,
              senderType: 'user' as const,
              imagePath: variables.imagePath,
              emotion: variables.emotion,
            } : undefined}
          />
          <ChatInput 
            onSend={handleSendMessage} 
            isDisabled={false}
          />
        </View>
      </KeyboardAvoidingView>
    </>
  );
};
