import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { isSameDay, parseISO } from 'date-fns';
import { useCallback } from 'react';
import type { ChatRoomMessageWithReplies } from './useChatRoomUserMessages';

export const useMessageConverter = () => {

  const getMessagesWithDividers = useCallback(({messages}: {messages: ChatRoomMessageWithReplies[]}) => {
    if (!messages || messages.length === 0) return [];

    const result: Array<{
      message: ChatRoomMessage & { date: string; replies: ChatRoomMessage[] };
      showDateDivider: boolean;
      date: Date | null;
    }> = [];

    // 最後のメッセージは必ず区切りを表示（逆順表示では一番上）
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const lastDate = lastMsg.date ? parseISO(lastMsg.date) : null;

      result.unshift({
        message: lastMsg,
        showDateDivider: true,
        date: lastDate,
      });
    }

    // 残りのメッセージを処理（末尾から先頭へ）
    for (let i = messages.length - 2; i >= 0; i--) {
      const currentMsg = messages[i];
      const nextMsg = messages[i + 1];

      const currentDate = currentMsg.date ? parseISO(currentMsg.date) : null;
      const nextDate = nextMsg.date ? parseISO(nextMsg.date) : null;

      // 日付が次のメッセージと異なれば区切りを表示
      const showDateDivider = !!(
        currentDate &&
        nextDate &&
        !isSameDay(currentDate, nextDate)
      );

      result.unshift({
        message: currentMsg,
        showDateDivider,
        date: currentDate,
      });
    }

    return result;
  }, []);

  const getMessageWithReplies = useCallback(({messages}: {messages: ChatRoomMessage[]}) => {
    if (!messages) return [];

    type ExtendedMessage = ChatRoomMessage & {
      replies: ChatRoomMessage[];
      date: string;
    };

    const messageMap = new Map(
      messages.map((msg) => [
        msg.id,
        { ...msg, replies: [] as ChatRoomMessage[], date: msg.created_at },
      ]),
    );

    const roots: ExtendedMessage[] = [];

    for (const msg of messages) {
      const current = messageMap.get(msg.id);
      if (!current) continue;

      if (msg.reply_to_message_id && messageMap.has(msg.reply_to_message_id)) {
        const parent = messageMap.get(msg.reply_to_message_id);
        if (parent) {
          parent.replies.unshift(msg);
        }
      } else {
        roots.push(current);
      }
    }

    return roots;
  }, []);

  return { getMessagesWithDividers, getMessageWithReplies };
};
