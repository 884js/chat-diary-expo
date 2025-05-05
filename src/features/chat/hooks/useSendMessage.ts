import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useSupabase } from '@/hooks/useSupabase';
import { useMutation } from '@tanstack/react-query';

export const useSendMessage = () => {
  const { api } = useSupabase();
  const { currentUser } = useCurrentUser();

  const mutation = useMutation({
    mutationFn: ({
      senderType,
      content,
      imagePath,
    }: {
      senderType: 'user' | 'ai';
      content: string;
      imagePath: string | undefined;
    }) => {
      return api.chatRoomMessage.sendMessage({
        content: content,
        sender: senderType,
        senderId: currentUser?.id ?? "",
        imagePath: imagePath,
      });
    },
  });

  return {
    sendMessage: mutation.mutateAsync,
  };
};
