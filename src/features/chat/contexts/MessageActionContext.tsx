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
import { Keyboard, type TextInput } from 'react-native';
import type { Emotion } from '../hooks/useChatInputEmotion';

export type SelectedMessage = {
  id: string;
  content: string;
  emotion?: Emotion['slug'];
};

type WithoutId = Omit<SelectedMessage, 'id'>;

const MessageActionContext = createContext<{
  textInputRef: React.RefObject<TextInput | null>;
  mode: 'edit' | 'reply' | null;
  selectedMessage: SelectedMessage | null;
  handleEditMessage: () => void;
  handleResetMode: () => void;
  handleDeleteMessage: () => Promise<void>;
  handleReplyMessage: () => void;
  handleSaveEdit: ({ content, emotion }: WithoutId) => Promise<void>;
  handleSendReplyMessage: ({ content, emotion }: WithoutId) => Promise<void>;
  handleOpenMenu: (message: SelectedMessage) => void;
  handleCancel: () => void;
  handleSaveStock: () => Promise<void>;
  handleDeleteStock: () => Promise<void>;
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
} | null>(null);

export const MessageActionProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const textInputRef = useRef<TextInput>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { currentUser } = useCurrentUser();
  const { refetchMessages } = useRoomUserMessages({
    userId: currentUser?.id ?? '',
  });
  const { api } = useSupabase();
  const [mode, setMode] = useState<'edit' | 'reply' | null>(null);
  const [selectedMessage, setSelectedMessage] =
    useState<SelectedMessage | null>(null);

  const handleOpenMenu = useCallback((message: SelectedMessage) => {
    setMode(null);

    setSelectedMessage(message);
    bottomSheetModalRef.current?.present();
  }, []);

  const handleEditMessage = () => {
    setMode('edit');
    textInputRef.current?.focus();
  };

  const handleReplyMessage = () => {
    setMode('reply');
    textInputRef.current?.focus();
  };

  const handleResetMode = () => {
    setMode(null);
    setSelectedMessage(null);
  };

  const handleSaveEdit = async ({ content, emotion }: WithoutId) => {
    if (!selectedMessage?.id) return;

    await api.chatRoomMessage.editMessage({
      messageId: selectedMessage.id,
      content: content,
      emotion: emotion,
    });

    handleResetMode();
    await refetchMessages();
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage?.id) return;

    await api.chatRoomMessage.deleteMessage({ messageId: selectedMessage.id });
    await refetchMessages();
  };

  const handleSendReplyMessage = async ({ content, emotion }: WithoutId) => {
    if (!selectedMessage?.id || !currentUser?.id) return;

    await api.chatRoomMessage.replyMessage({
      parentMessageId: selectedMessage.id,
      content: content,
      senderId: currentUser?.id,
      emotion: emotion,
    });

    handleResetMode();
    await refetchMessages();
  };

  const handleCancel = () => {
    handleResetMode();
    Keyboard.dismiss();
  };

  const handleSaveStock = async () => {
    if (!selectedMessage?.id || !currentUser?.id) return;

    await api.chatRoomMessageStock.createMessageStock({
      userId: currentUser?.id,
      messageId: selectedMessage.id,
    });
  };

  const handleDeleteStock = async () => {
    if (!selectedMessage?.id || !currentUser?.id) return;

    await api.chatRoomMessageStock.deleteMessageStock({
      userId: currentUser?.id,
      messageId: selectedMessage.id,
    });
  };

  return (
    <MessageActionContext.Provider
      value={{
        textInputRef,
        mode,
        selectedMessage,
        handleEditMessage,
        handleResetMode,
        handleSaveEdit,
        handleDeleteMessage,
        handleReplyMessage,
        handleSendReplyMessage,
        bottomSheetModalRef,
        handleOpenMenu,
        handleCancel,
        handleSaveStock,
        handleDeleteStock,
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
