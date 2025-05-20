import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useSupabase } from '@/hooks/useSupabase';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Keyboard } from 'react-native';
import type { Emotion } from '../hooks/useChatInputEmotion';
import { useChatRoomMessageStocks } from '../hooks/useChatRoomMessageStocks';

type SelectedMessage = {
  id: string;
  content: string;
  emotion?: Emotion['slug'];
  replyId?: string;
};

const MessageStockActionContext = createContext<{
  selectedMessage: SelectedMessage | null;
  handleOpenMenu: (message: SelectedMessage) => void;
  handleCancel: () => void;
  handleSaveStock: () => Promise<void>;
  handleDeleteStock: () => Promise<void>;
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
} | null>(null);

export const MessageStockActionProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const { refetch } = useChatRoomMessageStocks();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { currentUser } = useCurrentUser();
  const { api } = useSupabase();
  const [selectedMessage, setSelectedMessage] =
    useState<SelectedMessage | null>(null);

  const handleOpenMenu = useCallback((message: SelectedMessage) => {
    setSelectedMessage(message);
    bottomSheetModalRef.current?.present();
  }, []);

  const handleCancel = () => {
    Keyboard.dismiss();
  };

  const handleSaveStock = async () => {
    if (!selectedMessage?.id || !currentUser?.id) return;

    await api.chatRoomMessageStock.createMessageStock({
      userId: currentUser?.id,
      messageId: selectedMessage.id,
    });
    await refetch();
  };

  const handleDeleteStock = async () => {
    if (!selectedMessage?.id || !currentUser?.id) return;

    await api.chatRoomMessageStock.deleteMessageStock({
      userId: currentUser?.id,
      messageId: selectedMessage.replyId
        ? selectedMessage.replyId
        : selectedMessage.id,
    });
    await refetch();
  };

  return (
    <MessageStockActionContext.Provider
      value={{
        selectedMessage,
        bottomSheetModalRef,
        handleOpenMenu,
        handleCancel,
        handleSaveStock,
        handleDeleteStock,
      }}
    >
      {children}
    </MessageStockActionContext.Provider>
  );
};

export const useMessageStockAction = () => {
  const context = useContext(MessageStockActionContext);
  if (!context) {
    throw new Error(
      'useMessageStockAction must be used within an MessageStockActionProvider',
    );
  }
  return context;
};
