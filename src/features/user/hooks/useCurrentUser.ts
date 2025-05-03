import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';

export const useCurrentUser = () => {
  const { api } = useSupabase();
  // const { user, isLoading } = useAuth();
  const user = {
    id: '3096ab0c-a88d-4126-b297-3ad80870aed4',
  };
  const isLoading = false;

  const { data: userProfile } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => api.user.getUserProfile({ userId: user?.id || '' }),
    enabled: !!user?.id,
  });

  // デフォルトチャットルームの情報を取得
  const { data: defaultChatRoom } = useQuery({
    queryKey: ['defaultChatRoom', user?.id],
    queryFn: () => api.chatRoom.getDefaultChatRoom(user?.id || ''),
    enabled: !!user?.id,
  });

  return {
    currentUser: user,
    currentUserProfile: userProfile,
    defaultChatRoom,
    isLoading,
    isLoggedIn: !!user,
  };
};
