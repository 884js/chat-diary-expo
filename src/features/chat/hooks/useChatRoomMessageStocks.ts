import { useCurrentUser } from "@/features/user/hooks/useCurrentUser";
import { useSupabase } from "@/hooks/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { useMessageWithDividers } from "./useMessageWithDividers";

export const useChatRoomMessageStocks = () => {
  const { api } = useSupabase();
  const { currentUser } = useCurrentUser();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chatRoomMessageStocks'],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const data = await api.chatRoomMessageStock.getMessageStocks({
        userId: currentUser?.id ?? "",
      });

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const messages = data?.map((item) => {
    if (!item.message) {
      return null;
    }

    return {
      ...item.message,
      date: item.created_at || '',
    }
  }).filter((item) => item !== null) ?? [];

  const stockedMessageIds = data?.map((item) => item.message_id) ?? [];

  const { messagesWithDividers } = useMessageWithDividers({ messages });

  return { data, isLoading, error, messagesWithDividers, stockedMessageIds, refetch };
};