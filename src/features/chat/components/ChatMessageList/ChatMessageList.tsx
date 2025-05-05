import { formatDate } from '@/lib/date-fns';
import type { ChatRoom } from '@/lib/supabase/api/ChatRoom';
import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { ChatMessage } from '../ChatMessage';
import { DateDivider } from './DateDivider';

type Props = {
  chatRoom: ChatRoom;
  isLoading: boolean;
  messages: {
    message: ChatRoomMessage;
    showDateDivider: boolean;
    date: Date | null;
  }[];
  isChatEnded: boolean;
  isOwner: boolean;
};

export const ChatMessageList = ({ chatRoom, messages, isOwner }: Props) => {
  const scrollViewRef = React.useRef<ScrollView>(null);

  // メッセージが変更されたら一番下にスクロール
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  }, [messages.length]);

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1"
      contentContainerStyle={{ paddingVertical: 8 }}
      onContentSizeChange={() => {
        if (scrollViewRef) {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      }}
    >
      {/* チャットメッセージ */}
      {messages.map((item) => {
        const { message: msg, showDateDivider, date: messageDate } = item;

        // 表示処理を単純化: isOwnerとmsg.senderに基づいてisFromReceiverを判定
        let isFromReceiver: boolean;

        if (isOwner) {
          // オーナー視点: senderがreceiverかsystemなら自分から送信（反転した形で処理）
          isFromReceiver = msg.sender !== "user" && msg.sender !== "ai";
        } else {
          // 送信者視点: senderがreceiverかsystemなら相手から送信（そのまま処理）
          isFromReceiver = msg.sender === "user" || msg.sender === "ai";
        }

        return (
          <View key={msg.id} className="flex-1">
            {/* 日付区切り線 */}
            {showDateDivider && messageDate && (
              <DateDivider
                date={formatDate(messageDate, "yyyy年M月d日(eee)")}
              />
            )}

            {/* メッセージ */}
            <ChatMessage
              id={msg.id}
              content={msg.content}
              owner={chatRoom.owner}
              sender={msg.sender}
              replyTo={msg.reply_to}
              isFromReceiver={isFromReceiver}
              isOwner={isOwner}
              timestamp={formatDate(msg.created_at || "", "HH:mm")}
              imagePath={msg.image_path}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};
