import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { isSameDay, parseISO } from 'date-fns';
import { useCallback } from 'react';

export const useMessageConverter = () => {
  const getMessagesWithDividers = useCallback(
    ({ messages }: { messages: ChatRoomMessage[] }) => {
      if (!messages || messages.length === 0) return [];

      const result: Array<{
        message: ChatRoomMessage;
        showDateDivider: boolean;
        date: Date | null;
      }> = [];

      // 最後のメッセージは必ず区切りを表示（逆順表示では一番上）
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        const lastDate = lastMsg.created_at
          ? parseISO(lastMsg.created_at)
          : null;

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

        const currentDate = currentMsg.created_at
          ? parseISO(currentMsg.created_at)
          : null;
        const nextDate = nextMsg.created_at
          ? parseISO(nextMsg.created_at)
          : null;

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
    },
    [],
  );

  return { getMessagesWithDividers };
};
