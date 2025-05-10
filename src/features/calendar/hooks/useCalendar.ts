'use client';

import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';

export type CalendarDay = {
  id: string;
  owner_id: string;
  date: string; // 'YYYY-MM-DD'
  has_posts: boolean;
  ai_generated_highlights: {
    good: string[];
    new: string[];
  };
  summary_status: 'none' | 'manual' | 'auto';
  created_at: string;
  updated_at: string;
};

type Props = {
  userId: string;
  startAt: string; // ISO形式
  endAt: string; // ISO形式
};

export function useCalendarDays({ userId, startAt, endAt }: Props) {
  const { api } = useSupabase();

  const {
    data: calendarDays,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['calendarDays', userId, startAt, endAt],
    queryFn: async () => {
      if (!userId || !startAt || !endAt) return [];
      const data = await api.calendar.getCalendarDays(userId, startAt, endAt);

      if (error) {
        console.error('Error fetching calendar days:', error);
        throw error;
      }

      return data as CalendarDay[];
    },
    enabled: !!userId && !!startAt && !!endAt,
  });

  return {
    calendarDays: calendarDays || [],
    isLoading,
    isError,
    error,
    refetch,
  };
}
