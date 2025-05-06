'use client';

import { useSupabase } from '@/hooks/useSupabase';
import type { Json } from '@/lib/supabase/databaseTypes';
import { useMutation } from '@tanstack/react-query';

type UpdateCalendarSummaryParams = {
  userId: string;
  dateKey: string; // 'yyyy-MM-dd' 形式
  json: Json;
};

export function useUpdateCalendarSummary() {
  const { api } = useSupabase();
  const {
    mutateAsync: updateCalendarSummary,
    data,
    error,
    isPending,
    isError,
    reset,
  } = useMutation<void, Error, UpdateCalendarSummaryParams>({
    mutationFn: async ({ userId, dateKey, json }) => {
      const result = await api.calendar.updateCalendarSummary(
        userId,
        dateKey,
        json,
      );

      if (!result.success) {
        throw new Error('カレンダーの要約保存に失敗しました');
      }
    },
  });

  return {
    updateCalendarSummary,
    isPending,
    isError,
    error,
    reset,
  };
}
