import { formatDate } from '@/lib/date-fns';
import type { ChatRoom } from '@/lib/supabase/api/ChatRoom';
import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { ScrollView, View } from 'react-native';
import { ChatMessage } from '../ChatMessage';
import { DateDivider } from '../DateDivider';
import { useMessageStockAction } from '../../contexts/MessageStockActionContext';
import { useEffect } from 'react';

type Props = {
  chatRoom: ChatRoom;
  scrollViewRef: React.RefObject<ScrollView | null>;
  messages: {
    message: ChatRoomMessage;
    showDateDivider: boolean;
    date: Date | null;
  }[];
};

export const ChatMessageStockList = ({
  chatRoom,
  messages,
  scrollViewRef,
}: Props) => {
  const { handleOpenMenu } = useMessageStockAction();

  // メッセージが変更されたら一番下にスクロール
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  }, [messages.length]);

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 !bg-gray-100 px-1"
      contentContainerStyle={{ paddingVertical: 8 }}
    >
      {messages.map((item) => {
        const { message: msg, showDateDivider, date: messageDate } = item;
        return (
          <View key={msg.id} className="flex-1">
            {/* 日付区切り線 */}
            {showDateDivider && messageDate && (
              <View className="!bg-gray-100">
                <DateDivider
                  date={formatDate(messageDate, "yyyy年M月d日(eee)")}
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
              timestamp={formatDate(msg.created_at || "", "yyyy/MM/dd HH:mm")}
              imagePath={msg.image_path}
              emotion={msg.emotion}
              isStocked={false}
              onOpenStockMenu={handleOpenMenu}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};
