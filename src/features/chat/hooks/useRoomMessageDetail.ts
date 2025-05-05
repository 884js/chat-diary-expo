import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';

export const useRoomMessageDetail = ({ messageId }: { messageId: string }) => {
  const { api } = useSupabase();

  const { data: messageDetail, isLoading } = useQuery({
    queryKey: ['roomMessageDetail', messageId],
    queryFn: () => {
      return api.chatRoomMessage.getMessageDetail({
        messageId: messageId,
      });
    },
    enabled: !!messageId,
  });

  return {
    messageDetail,
    isLoading,
  };
};
