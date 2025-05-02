import { formatDate, isSameDay, parseISO } from '@/lib/date-fns';
import type { ChatRoom } from '@/lib/supabase/api/ChatRoom';
import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { ChatMessage } from './ChatMessage';

type Props = {
  chatRoom: ChatRoom;
  isLoading: boolean;
  messages: ChatRoomMessage[];
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

export const ChatMessages = ({
  chatRoom,
  isLoading,
  messages,
  isOwner,
}: Props) => {
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleScrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  };

  // メッセージを日付とインデックスでグループ化
  const messagesWithDividers = useMemo(() => {
    const result: Array<{
      message: ChatRoomMessage;
      showDateDivider: boolean;
      date: Date | null;
    }> = [];

    let previousDate: Date | null = null;
    // 各メッセージを処理
    messages.forEach((msg) => {
      const messageDate = msg.created_at ? parseISO(msg.created_at) : null;
      let showDateDivider = false;

      if (messageDate) {
        // 日付が変わる場合（最初のメッセージか、前のメッセージと日付が異なる場合）
        if (!previousDate || !isSameDay(previousDate, messageDate)) {
          // すべての日付変更で区切り線を表示（今日を含む）
          showDateDivider = true;
          // 日付を更新
          previousDate = messageDate;
        }
      }

      result.push({
        message: msg,
        showDateDivider,
        date: messageDate,
      });
    });

    return result;
  }, [messages]);

  // メッセージが変更されたら一番下にスクロール
  useEffect(() => {
    handleScrollToBottom();
  }, [messages.length]);

  if (isLoading) {
    return (
      <View className="justify-center items-center min-h-[200px] bg-ivory-50">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View className="items-center justify-center py-10 bg-ivory-50">
        <Text className="text-gray-500">まだメッセージはありません。</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 bg-ivory-50"
      contentContainerStyle={{ paddingVertical: 8 }}
    >
      {/* チャットメッセージ */}
      {messagesWithDividers.map((item) => {
        const { message: msg, showDateDivider, date: messageDate } = item;

        // 表示処理を単純化: isOwnerとmsg.senderに基づいてisFromReceiverを判定
        let isFromReceiver: boolean;

        if (isOwner) {
          // オーナー視点: senderがreceiverかsystemなら自分から送信（反転した形で処理）
          isFromReceiver = msg.sender !== 'user' && msg.sender !== 'ai';
        } else {
          // 送信者視点: senderがreceiverかsystemなら相手から送信（そのまま処理）
          isFromReceiver = msg.sender === 'user' || msg.sender === 'ai';
        }

        return (
          <View key={msg.id}>
            {/* 日付区切り線 */}
            {showDateDivider && messageDate && (
              <DateDivider
                date={formatDate(messageDate, 'yyyy年M月d日(eee)')}
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
              timestamp={formatDate(msg.created_at || '', 'HH:mm')}
              imagePath={msg.image_path}
              onScrollToBottom={handleScrollToBottom}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};
