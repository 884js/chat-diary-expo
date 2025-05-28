import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';
import { useMessageConverter } from './useMessageConverter';

export const useChatRoomMessageStocks = () => {
  const { api } = useSupabase();
  const { currentUser } = useCurrentUser();
  const { getMessagesWithDividers } = useMessageConverter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chatRoomMessageStocks'],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const data = await api.chatRoomMessageStock.getMessageStocks({
        userId: currentUser?.id ?? '',
      });

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const stockedMessageIds = data?.map((item) => item.message_id) ?? [];

  const messagesWithDividers = getMessagesWithDividers({
    messages:
      data?.map((item) => item.message).filter((item) => item !== null) ?? [],
  });

  return {
    data,
    isLoading,
    error,
    messagesWithDividers,
    stockedMessageIds,
    refetch,
  };
};
