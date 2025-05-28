import { useMessageConverter } from '@/features/chat/hooks/useMessageConverter';
import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';

type Props = {
  userId: string | undefined;
};

export const useChatRoomUserMessages = ({ userId }: Props) => {
  const { api } = useSupabase();
  const { getMessagesWithDividers } = useMessageConverter();

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

  const messagesWithDividers = getMessagesWithDividers({
    messages: data ?? [],
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
