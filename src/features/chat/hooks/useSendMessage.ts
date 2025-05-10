import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useSupabase } from '@/hooks/useSupabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSendMessage = () => {
  const { api } = useSupabase();
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const {
    mutateAsync: sendMessage,
    isPending,
    variables,
  } = useMutation({
    mutationFn: async ({
      senderType,
      content,
      imagePath,
    }: {
      senderType: 'user' | 'ai';
      content: string;
      imagePath?: string;
    }) => {
      return api.chatRoomMessage.sendMessage({
        content: content,
        sender: senderType,
        senderId: currentUser?.id ?? '',
        imagePath,
      });
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ['messages', currentUser?.id],
      }),
  });

  return {
    sendMessage,
    isPending,
    variables,
  };
};
