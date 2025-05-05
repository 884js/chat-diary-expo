import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';

export const useCurrentUserRoom = () => {
  const { api, supabase } = useSupabase();
  const { currentUser } = useCurrentUser();

  const {
    data: chatRoom,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['room', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;

      const defaultChatRoom = await api.chatRoom.getDefaultChatRoom(
        currentUser.id,
      );

      if (!defaultChatRoom) {
        // デフォルトのチャットルームを作成する
        const newChatRoom = await supabase
          .from('rooms')
          .insert({
            user_id: currentUser.id,
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
    enabled: !!currentUser?.id,
  });

  return {
    chatRoom,
    isLoadingRoom: isLoading,
    isRefetchingRoom: isRefetching,
    refetch,
  };
};
