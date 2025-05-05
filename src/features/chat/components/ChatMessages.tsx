import { formatDate } from '@/lib/date-fns';
import type { ChatRoom } from '@/lib/supabase/api/ChatRoom';
import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ChatMessage } from './ChatMessage';

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

// 日付区切り線コンポーネント
const DateDivider = ({ date }: { date: string }) => (
  <View className="flex-row items-center my-4">
    <View className="flex-grow h-px bg-gray-200" />
    <View className="mx-4">
      <Text className="text-xs text-gray-500 font-medium bg-ivory-50 px-2 py-1 rounded-full border border-gray-200">
        {date}
      </Text>
    </View>
    <View className="flex-grow h-px bg-gray-200" />
  </View>
);

export const ChatMessages = ({ chatRoom, messages, isOwner }: Props) => {
  const scrollViewRef = React.useRef<ScrollView>(null);

  // メッセージが変更されたら一番下にスクロール
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <View className="items-center justify-center py-10">
        <Text className="text-gray-500">まだメッセージはありません。</Text>
      </View>
    );
  }

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
