import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useRoomUserMessages } from '@/features/user/hooks/useRoomUserMessages';
import { useSupabase } from '@/hooks/useSupabase';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import type { Emotion } from '../hooks/useChatInputEmotion';

const MessageActionContext = createContext<{
  mode: 'edit' | 'reply' | null;
  messageId: string | null;
  selectedMessage: string | null;
  handleEditMessage: ({
    messageId,
    message,
  }: {
    messageId: string;
    message: string;
  }) => void;
  handleResetMode: () => void;
  handleSaveEdit: ({ message, emotion }: { message: string, emotion: Emotion['slug'] }) => Promise<void>;
  handleDeleteMessage: ({ messageId }: { messageId: string }) => Promise<void>;
  handleReplyMessage: ({
    parentMessageId,
    message,
  }: {
    parentMessageId: string;
    message: string;
  }) => Promise<void>;
  handleSendReplyMessage: ({ message, emotion }: { message: string, emotion: Emotion['slug'] }) => Promise<void>;
  handleOpenMenu: (id: string) => void;
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
} | null>(null);

export const MessageActionProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { currentUser } = useCurrentUser();
  const { refetchMessages } = useRoomUserMessages({
    userId: currentUser?.id ?? '',
  });
  const { api } = useSupabase();
  const [mode, setMode] = useState<'edit' | 'reply' | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const handleOpenMenu = useCallback((id: string) => {
    setMessageId(id);
    bottomSheetModalRef.current?.present();
  }, []);

  const handleEditMessage = ({
    messageId,
    message,
  }: { messageId: string; message: string }) => {
    setMode('edit');
    setMessageId(messageId);
    setSelectedMessage(message);
  };

  const handleResetMode = () => {
    setMode(null);
    setMessageId(null);
    setSelectedMessage(null);
  };

  const handleSaveEdit = async ({ message, emotion }: { message: string, emotion: Emotion['slug'] }) => {
    if (!messageId) return;

    await api.chatRoomMessage.editMessage({
      messageId: messageId,
      content: message,
      emotion: emotion,
    });

    handleResetMode();
    await refetchMessages();
  };

  const handleDeleteMessage = async ({ messageId }: { messageId: string }) => {
    if (!messageId) return;

    await api.chatRoomMessage.deleteMessage({ messageId: messageId });
    await refetchMessages();
  };

  const handleReplyMessage = async ({
    parentMessageId,
    message,
  }: { parentMessageId: string; message: string }) => {
    if (!parentMessageId || !currentUser?.id) return;

    setMode('reply');
    setMessageId(parentMessageId);
    setSelectedMessage(message);
  };

  const handleSendReplyMessage = async ({ message, emotion }: { message: string, emotion: Emotion['slug'] }) => {
    if (!messageId || !currentUser?.id) return;

    await api.chatRoomMessage.replyMessage({
      parentMessageId: messageId,
      content: message,
      senderId: currentUser?.id,
      emotion: emotion,
    });

    handleResetMode();
    await refetchMessages();
  };

  return (
    <MessageActionContext.Provider
      value={{
        mode,
        messageId,
        selectedMessage,
        handleEditMessage,
        handleResetMode,
        handleSaveEdit,
        handleDeleteMessage,
        handleReplyMessage,
        handleSendReplyMessage,
        bottomSheetModalRef,
        handleOpenMenu,
      }}
    >
      {children}
    </MessageActionContext.Provider>
  );
};

export const useMessageAction = () => {
  const context = useContext(MessageActionContext);
  if (!context) {
    throw new Error(
      'useMessageAction must be used within an MessageActionProvider',
    );
  }
  return context;
};
