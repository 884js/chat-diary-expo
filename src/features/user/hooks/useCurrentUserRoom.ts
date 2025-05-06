import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';

type Props = {
  userId: string;
};
export const useCurrentUserRoom = ({ userId }: Props) => {
  const { api, supabase } = useSupabase();

  const {
    data: chatRoom,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['room', userId],
    queryFn: async () => {
      if (!userId) return null;

      const defaultChatRoom = await api.chatRoom.getDefaultChatRoom(userId);

      if (!defaultChatRoom) {
        // デフォルトのチャットルームを作成する
        const newChatRoom = await supabase
          .from('rooms')
          .insert({
            user_id: userId,
          })
          .select('id')
          .single();

        if (newChatRoom.error) {
          throw new Error('Failed to create default chat room');
        }

        const newChatRoomData = await api.chatRoom.getChatRoomById({
          id: newChatRoom.data.id,
        });

        return newChatRoomData;
      }
      const chatRoomData = await api.chatRoom.getChatRoomById({
        id: defaultChatRoom.id,
      });
      return chatRoomData;
    },
    enabled: !!userId,
  });

  return {
    chatRoom,
    isLoadingRoom: isLoading,
    isRefetchingRoom: isRefetching,
    refetch,
  };
};
