import { formatDate } from '@/lib/date-fns';
import type { ChatRoom } from '@/lib/supabase/api/ChatRoom';
import { memo, useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { useMessageStockAction } from '../../contexts/MessageStockActionContext';
import { ChatMessage as RawChatMessage } from '../ChatMessage';
import { DateDivider } from '../DateDivider';
import type { ChatRoomMessageWithReplies } from '../../hooks/useChatRoomUserMessages';

type Props = {
  chatRoom: ChatRoom;
  messages: {
    message: ChatRoomMessageWithReplies;
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
            <View style={{ backgroundColor: "#f3f4f6" }}>
              <DateDivider
                date={formatDate(messageDate, "yyyy年M月d日(eee)")}
              />
            </View>
          )}

          {/* メッセージ */}
          <View className="mb-4">
            <ChatMessage
              id={msg.id}
              content={msg.content}
              owner={chatRoom.owner}
              sender={msg.sender}
              timestamp={formatDate(msg.created_at || "", "M/d HH:mm")}
              imagePath={msg.image_path}
              emotion={msg.emotion}
              isStocked={false}
              onOpenStockMenu={() =>
                handleOpenMenu({
                  id: msg.id,
                  replyId: msg.reply_to_message_id ?? undefined,
                  content: msg.content,
                  emotion: msg.emotion,
                })
              }
            />
            {msg.replies &&
              msg.replies.length > 0 &&
              msg.replies.map((reply, i) => (
                <View key={reply.id}>
                  <View className="items-center">
                    <View className="h-4 w-[2px] bg-gray-300" />
                  </View>
                  <ChatMessage
                    id={msg.id}
                    owner={null}
                    content={reply.content}
                    sender={reply.sender}
                    timestamp={formatDate(reply.created_at || "", "M/d HH:mm")}
                    imagePath={reply.image_path}
                    emotion={reply.emotion}
                    isStocked={false}
                    onOpenStockMenu={() =>
                      handleOpenMenu({
                        id: msg.id,
                        replyId: reply.id,
                        content: reply.content,
                        emotion: reply.emotion,
                      })
                    }
                  />
                </View>
              ))}
          </View>
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
