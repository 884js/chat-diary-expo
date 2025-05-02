import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '@/hooks/useSupabase';

export const useCurrentUserRoom = () => {
  const { api, supabase } = useSupabase();
  // const { currentUser } = useCurrentUser();

  const currentUser = {
    id: '3096ab0c-a88d-4126-b297-3ad80870aed4',
  };

  const {
    data: chatRoom,
    isLoading,
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
    refetchRoom: refetch,
  };
};
