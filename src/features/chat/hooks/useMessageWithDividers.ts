import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { isSameDay, parseISO } from 'date-fns';
import { useMemo } from 'react';

export const useMessageWithDividers = ({
  messages,
}: { messages: (ChatRoomMessage & { date: string })[] }) => {
  const messagesWithDividers = useMemo(() => {
    if (!messages || messages.length === 0) return [];

    const result: Array<{
      message: ChatRoomMessage;
      showDateDivider: boolean;
      date: Date | null;
    }> = [];

    // FlatListはinverted=trueで表示されるため、
    // 日付区切りは「次のメッセージが異なる日付」のときに表示する

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
  }, [messages]);

  return { messagesWithDividers };
};
