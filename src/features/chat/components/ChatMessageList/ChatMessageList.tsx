import { formatDate } from '@/lib/date-fns';
import type { ChatRoom } from '@/lib/supabase/api/ChatRoom';
import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { memo, useCallback, useRef } from 'react';
import { FlatList, View } from 'react-native';
import { useMessageAction } from '../../contexts/MessageActionContext';
import type { Emotion } from '../../hooks/useChatInputEmotion';
import { useChatRoomMessageStocks } from '../../hooks/useChatRoomMessageStocks';
import { ChatMessage as RawChatMessage } from '../ChatMessage';
import { DateDivider } from '../DateDivider';

type Props = {
  chatRoom: ChatRoom;
  isLoading: boolean;
  messages: {
    message: ChatRoomMessage;
    showDateDivider: boolean;
    date: Date | null;
  }[];
  isPending: boolean;
  sendingMessage?:
    | {
        content: string;
        senderType: 'user' | 'ai';
        imagePath?: string | undefined;
        emotion?: Emotion['slug'];
      }
    | undefined;
};

const ChatMessage = memo(RawChatMessage);

export const ChatMessageList = ({
  chatRoom,
  messages,
  isPending,
  sendingMessage,
}: Props) => {
  const { stockedMessageIds } = useChatRoomMessageStocks();
  const { handleOpenMenu } = useMessageAction();
  const flatListRef = useRef<FlatList>(null);

  const renderItem = useCallback(
    ({ item }: { item: Props['messages'][number] }) => {
      const { message: msg, showDateDivider, date: messageDate } = item;

      return (
        <View key={msg.id} style={{ flex: 1 }}>
          {showDateDivider && messageDate && (
            <View style={{ backgroundColor: '#f3f4f6' }}>
              <DateDivider
                date={formatDate(messageDate, 'yyyy年M月d日(eee)')}
              />
            </View>
          )}
          <ChatMessage
            id={msg.id}
            content={msg.content}
            owner={chatRoom.owner}
            sender={msg.sender}
            replyTo={msg.reply_to}
            timestamp={formatDate(msg.created_at || '', 'HH:mm')}
            imagePath={msg.image_path}
            emotion={msg.emotion}
            isStocked={stockedMessageIds.includes(msg.id)}
            onOpenStockMenu={handleOpenMenu}
          />
        </View>
      );
    },
    [chatRoom.owner, stockedMessageIds, handleOpenMenu],
  );

  // 送信中メッセージをフッターで描画
  const sendingComponent =
    isPending && sendingMessage ? (
      <View key={sendingMessage.content} style={{ flex: 1, opacity: 0.5 }}>
        <ChatMessage
          id=""
          content={sendingMessage.content}
          owner={chatRoom.owner}
          sender="user"
          replyTo={null}
          timestamp={formatDate(new Date().toISOString(), 'HH:mm')}
          imagePath={sendingMessage.imagePath ?? ''}
          emotion={sendingMessage.emotion}
          isStocked={false}
          onOpenStockMenu={handleOpenMenu}
        />
      </View>
    ) : null;

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.message.id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 4 }}
      ListFooterComponent={sendingComponent}
      initialNumToRender={20}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: '#f3f4f6' }}
      inverted
    />
  );
};
