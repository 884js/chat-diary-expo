import { useSupabase } from '@/hooks/useSupabase';
import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { useQuery } from '@tanstack/react-query';
import { isSameDay, parseISO } from 'date-fns';
import { useMemo } from 'react';

type Props = {
  userId: string | undefined;
};
export const useRoomUserMessages = ({ userId }: Props) => {
  const { api } = useSupabase();

  const {
    data: messages,
    isLoading: isLoadingMessages,
    isRefetching: isRefetchingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['messages', userId],
    queryFn: async () => {
      if (!userId) return null;
      const result = await api.chatRoom.getChatRoomMessages({
        userId,
      });
      return result;
    },
    enabled: !!userId,
  });

  const messagesWithDividers = useMemo(() => {
    if (!messages) return [];

    const result: Array<{
      message: ChatRoomMessage;
      showDateDivider: boolean;
      date: Date | null;
    }> = [];

    let previousDate: Date | null = null;

    for (const msg of messages) {
      const messageDate = msg.created_at ? parseISO(msg.created_at) : null;
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

  return {
    messages: messagesWithDividers,
    isLoadingMessages,
    isRefetchingMessages,
    refetchMessages,
  };
};
