import type { UseChatRoomUserMessages } from '@/features/chat/hooks/useChatRoomUserMessages';
import { formatDate } from '@/lib/date-fns';
import type { ChatRoom } from '@/lib/supabase/api/ChatRoom';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { memo, useCallback, useReducer, useRef } from 'react';
import { View } from 'react-native';
import { useMessageAction } from '../../contexts/MessageActionContext';
import type { Emotion } from '../../hooks/useChatInputEmotion';
import { useChatRoomMessageStocks } from '../../hooks/useChatRoomMessageStocks';
import { ChatMessage as RawChatMessage } from '../ChatMessage';
import { DateDivider } from '../DateDivider';

type Props = {
  chatRoom: ChatRoom;
  isLoading: boolean;
  messages: {
    message: UseChatRoomUserMessages['messages'][number]['message'];
    showDateDivider: boolean;
    date: Date | null;
  }[];
  isPending: boolean;
  sendingMessage?:
    | {
        content: string;
        senderType: 'user' | 'ai';
        imagePath?: string;
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
  const [refreshKey, forceRefresh] = useReducer((s: number) => s + 1, 0);

  const listRef = useRef<FlashList<Props['messages'][number]>>(null);

  const renderItem: ListRenderItem<Props['messages'][number]> = useCallback(
    ({ item }) => {
      const { message: msg, showDateDivider, date: messageDate } = item;
      return (
        <View>
          {showDateDivider && messageDate && (
            <View style={{ backgroundColor: '#f3f4f6' }}>
              <DateDivider
                date={formatDate(messageDate, 'yyyy年M月d日(eee)')}
              />
            </View>
          )}

          <View className="mb-4">
            <ChatMessage
              id={msg.id}
              content={msg.content}
              avatarUrl={chatRoom.owner.avatar_url}
              sender={msg.sender}
              timestamp={formatDate(msg.created_at || '', 'M/d HH:mm')}
              imagePath={msg.image_path}
              emotion={msg.emotion}
              isStocked={stockedMessageIds.includes(msg.id)}
              onRendered={() => forceRefresh()}
              onOpenStockMenu={() =>
                handleOpenMenu({
                  id: msg.id,
                  content: msg.content,
                  emotion: msg.emotion,
                })
              }
            />

            {msg.replies.map((reply) => (
              <View key={reply.id}>
                <View className="items-center">
                  <View className="h-4 w-[2px] bg-gray-300" />
                </View>
                <ChatMessage
                  id={reply.id}
                  avatarUrl={''}
                  content={reply.content}
                  sender={reply.sender}
                  timestamp={formatDate(reply.created_at || '', 'M/d HH:mm')}
                  imagePath={reply.image_path}
                  emotion={reply.emotion}
                  isStocked={stockedMessageIds.includes(reply.id)}
                  onRendered={() => forceRefresh()}
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
    [chatRoom.owner, stockedMessageIds, handleOpenMenu],
  );

  // 送信中メッセージをフッターで描画
  const sendingComponent =
    isPending && sendingMessage ? (
      <View key={sendingMessage.content} style={{ opacity: 0.5 }}>
        <ChatMessage
          id=""
          content={sendingMessage.content}
          avatarUrl={''}
          sender="user"
          timestamp={formatDate(new Date().toISOString(), 'HH:mm')}
          imagePath={sendingMessage.imagePath ?? ''}
          emotion={sendingMessage.emotion}
          isStocked={false}
          onOpenStockMenu={() =>
            handleOpenMenu({
              id: '',
              content: sendingMessage.content,
              emotion: sendingMessage.emotion,
            })
          }
        />
      </View>
    ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <FlashList
        ref={listRef}
        inverted
        extraData={refreshKey}
        data={messages}
        keyExtractor={(item) => item.message.id}
        renderItem={renderItem}
        estimatedItemSize={120} // ★ 必須。大体で OK
        ListFooterComponent={sendingComponent}
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 4 }}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }} // ★ スクロール位置保持
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
