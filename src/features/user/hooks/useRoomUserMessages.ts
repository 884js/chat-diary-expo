import { useMessageWithDividers } from '@/features/chat/hooks/useMessageWithDividers';
import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';

type Props = {
  userId: string | undefined;
};
export const useRoomUserMessages = ({ userId }: Props) => {
  const { api } = useSupabase();

  const {
    data,
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

  const messages = data?.map((item) => {
    return {
      ...item,
      date: item.created_at,
    };
  });

  const { messagesWithDividers } = useMessageWithDividers({
    messages: messages ?? [],
  });

  return {
    messages: messagesWithDividers,
    isLoadingMessages,
    isRefetchingMessages,
    refetchMessages,
  };
};
