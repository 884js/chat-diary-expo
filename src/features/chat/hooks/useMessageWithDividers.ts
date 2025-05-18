import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { isSameDay, parseISO } from 'date-fns';
import { useMemo } from 'react';

export const useMessageWithDividers = ({
  messages,
}: { messages: (ChatRoomMessage & { date: string })[] }) => {
  const messagesWithDividers = useMemo(() => {
    if (!messages) return [];

    const result: Array<{
      message: ChatRoomMessage;
      showDateDivider: boolean;
      date: Date | null;
    }> = [];

    let previousDate: Date | null = null;

    for (const msg of messages) {
      const messageDate = msg.date ? parseISO(msg.date) : null;
      let showDateDivider = false;

      if (
        messageDate &&
        (!previousDate || !isSameDay(previousDate, messageDate))
      ) {
        showDateDivider = true;
        previousDate = messageDate;
      }

      result.push({
        message: msg,
        showDateDivider,
        date: messageDate,
      });
    }

    return result;
  }, [messages]);

  return { messagesWithDividers };
};
