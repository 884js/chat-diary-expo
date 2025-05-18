import { formatDate } from '@/lib/date-fns';
import type { ChatRoom } from '@/lib/supabase/api/ChatRoom';
import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { memo, useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { useMessageStockAction } from '../../contexts/MessageStockActionContext';
import { ChatMessage as RawChatMessage } from '../ChatMessage';
import { DateDivider } from '../DateDivider';

type Props = {
  chatRoom: ChatRoom;
  messages: {
    message: ChatRoomMessage;
    showDateDivider: boolean;
    date: Date | null;
  }[];
};

const ChatMessage = memo(RawChatMessage);

export const ChatMessageStockList = ({ chatRoom, messages }: Props) => {
  const { handleOpenMenu } = useMessageStockAction();

  const renderItem = useCallback(
    ({ item }: { item: Props['messages'][number] }) => {
      const { message: msg, showDateDivider, date: messageDate } = item;

      return (
        <View key={msg.id} style={{ flex: 1 }}>
          {/* 日付区切り線 */}
          {showDateDivider && messageDate && (
            <View style={{ backgroundColor: '#f3f4f6' }}>
              <DateDivider
                date={formatDate(messageDate, 'yyyy年M月d日(eee)')}
              />
            </View>
          )}

          {/* メッセージ */}
          <ChatMessage
            id={msg.id}
            content={msg.content}
            owner={chatRoom.owner}
            sender={msg.sender}
            replyTo={msg.reply_to}
            timestamp={formatDate(msg.created_at || '', 'yyyy/MM/dd HH:mm')}
            imagePath={msg.image_path}
            emotion={msg.emotion}
            isStocked={false}
            onOpenStockMenu={handleOpenMenu}
          />
        </View>
      );
    },
    [chatRoom.owner, handleOpenMenu],
  );

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.message.id}
      renderItem={renderItem}
      style={{ flex: 1, backgroundColor: '#f3f4f6' }}
      contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 4 }}
      showsVerticalScrollIndicator={false}
      inverted
    />
  );
};
