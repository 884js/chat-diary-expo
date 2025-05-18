import { formatDate } from '@/lib/date-fns';
import type { ChatRoom } from '@/lib/supabase/api/ChatRoom';
import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { ScrollView, View } from 'react-native';
import type { Emotion } from '../../hooks/useChatInputEmotion';
import { ChatMessage } from '../ChatMessage';
import { DateDivider } from '../DateDivider';
import { useChatRoomMessageStocks } from '../../hooks/useChatRoomMessageStocks';
import { useMessageAction } from '../../contexts/MessageActionContext';
import { format } from "date-fns";
import { useEffect } from 'react';

type Props = {
  chatRoom: ChatRoom;
  isLoading: boolean;
  scrollViewRef: React.RefObject<ScrollView | null>;
  messages: {
    message: ChatRoomMessage;
    showDateDivider: boolean;
    date: Date | null;
  }[];
  listItemRefs: React.RefObject<Record<string, View>>;
  isPending: boolean;
  sendingMessage:
    | {
        content: string;
        senderType: 'user' | 'ai';
        imagePath?: string | undefined;
        emotion?: Emotion['slug'];
      }
    | undefined;
};

export const ChatMessageList = ({
  chatRoom,
  messages,
  isPending,
  sendingMessage,
  scrollViewRef,
  listItemRefs,
}: Props) => {
  const { stockedMessageIds } = useChatRoomMessageStocks();
  const { handleOpenMenu } = useMessageAction();

  const callbackRef = (messageDate: Date) => (node: View) => {
    const key = format(messageDate || "", "yyyy-MM-dd");
    if (node) {
      listItemRefs.current[key] = node;
    } else {
      delete listItemRefs.current[key];
    }
  };

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
      onContentSizeChange={() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }}
    >
      {/* チャットメッセージ */}
      {messages.map((item) => {
        const { message: msg, showDateDivider, date: messageDate } = item;
        return (
          <View key={msg.id} className="flex-1">
            {showDateDivider && messageDate && (
              <View ref={callbackRef(messageDate)} className="!bg-gray-100">
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
              timestamp={formatDate(msg.created_at || "", "HH:mm")}
              imagePath={msg.image_path}
              emotion={msg.emotion}
              isStocked={stockedMessageIds.includes(msg.id)}
              onOpenStockMenu={handleOpenMenu}
            />
          </View>
        );
      })}
      <View key={sendingMessage?.content} className="flex-1 opacity-50">
        {isPending && (
          <ChatMessage
            id={""}
            content={sendingMessage?.content ?? ""}
            owner={chatRoom.owner}
            sender={"user"}
            replyTo={null}
            timestamp={formatDate(new Date().toISOString(), "HH:mm")}
            imagePath={sendingMessage?.imagePath ?? ""}
            emotion={sendingMessage?.emotion}
            isStocked={false}
            onOpenStockMenu={handleOpenMenu}
          />
        )}
      </View>
    </ScrollView>
  );
};
