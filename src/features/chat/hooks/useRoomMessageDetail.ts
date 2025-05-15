import { useSupabase } from '@/hooks/useSupabase';
import { useMutation } from '@tanstack/react-query';

export const useRoomMessageDetail = ({ messageId }: { messageId: string }) => {
  const { api } = useSupabase();

  const { mutateAsync: getMessageDetail, isPending: isLoading } = useMutation({
    mutationKey: ['roomMessageDetail', messageId],
    mutationFn: () => {
      return api.chatRoomMessage.getMessageDetail({
        messageId: messageId,
      });
    },
  });

  return {
    getMessageDetail,
    isLoading,
  };
};
