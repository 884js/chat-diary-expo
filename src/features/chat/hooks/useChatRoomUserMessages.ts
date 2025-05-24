import { useMessageConverter } from '@/features/chat/hooks/useMessageConverter';
import { useSupabase } from '@/hooks/useSupabase';
import type { ChatRoomMessage } from '@/lib/supabase/api/ChatRoomMessage';
import { useQuery } from '@tanstack/react-query';

type Props = {
  userId: string | undefined;
};

export type ChatRoomMessageWithReplies = ChatRoomMessage & {
  replies: ChatRoomMessage[];
  date: string;
};

export const useChatRoomUserMessages = ({ userId }: Props) => {
  const { api } = useSupabase();
  const { getMessageWithReplies, getMessagesWithDividers } =
    useMessageConverter();

  const {
    data,
    isLoading: isLoadingMessages,
    isRefetching: isRefetchingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['messages', userId],
    queryFn: async () => {
      if (!userId) return [];
      const result = await api.chatRoom.getChatRoomMessages({ userId });
      return result;
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });

  const messagesWithReplies = getMessageWithReplies({ messages: data ?? [] });
  const messagesWithDividers = getMessagesWithDividers({
    messages: messagesWithReplies,
  });

  return {
    messages: messagesWithDividers,
    isLoadingMessages,
    isRefetchingMessages,
    refetchMessages,
  };
};

export type UseChatRoomUserMessages = ReturnType<
  typeof useChatRoomUserMessages
>;
