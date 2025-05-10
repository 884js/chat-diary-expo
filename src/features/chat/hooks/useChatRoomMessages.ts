import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';

// RoomMessageの型定義
export type RoomMessage = {
  id: string;
  owner_id: string;
  sender: 'user' | 'ai';
  content: string;
  image_path: string;
  reply_to_message_id: string | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  userId: string;
  startAt: string;
  endAt: string;
};

export function useChatRoomMessages({ userId, startAt, endAt }: Props) {
  const { supabase } = useSupabase();

  // 月初と月末の日付を取得
  const getMonthRange = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth();

    // 月初日
    const startOfMonth = new Date(year, month, 1);
    // 翌月の0日目 = 月末日
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return {
      start: startOfMonth.toISOString(),
      end: endOfMonth.toISOString(),
    };
  };

  const dateRange = getMonthRange(startAt);

  const {
    data: chatRoomMessages,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['roomMessages', userId, dateRange.start, dateRange.end],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase.rpc(
        'get_room_messages_by_date_range',
        {
          params: {
            user_id: userId,
            start_at: dateRange.start,
            end_at: dateRange.end,
          },
        },
      );

      if (error) {
        console.error('Error fetching room messages:', error);
        throw error;
      }

      return data as RoomMessage[];
    },
    enabled: !!userId,
  });

  return {
    chatRoomMessages: chatRoomMessages || [],
    isLoading,
    isError,
    error,
    refetch,
  };
}
