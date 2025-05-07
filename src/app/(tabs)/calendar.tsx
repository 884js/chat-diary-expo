import { addMonths } from '@/lib/date-fns';
import { useState } from 'react';
import { View } from '@/components/Themed';

import { CalendarHeader } from '@/features/calendar/components/CalendarHeader';
import { CalendarGrid } from '@/features/calendar/components/CalendarGrid';
import { EmptyCalendar } from '@/features/calendar/components/EmptyCalendar';
import { useCalendarDays } from '@/features/calendar/hooks/useCalendar';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { Loader } from '@/components/Loader';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { TZDate } from '@date-fns/tz';

// メインのカレンダー画面
export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new TZDate());
  const [expandedMessageIds, setExpandedMessageIds] = useState<string[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([])
  const { currentUser } = useCurrentUser();

  // 月の開始日と終了日の取得
  const startAt = startOfMonth(currentDate).toISOString();
  const endAt = endOfMonth(currentDate).toISOString();
  const {
    calendarDays,
    isLoading,
    isError,
    refetch
  } = useCalendarDays({
    userId: currentUser?.id ?? '',
    startAt,
    endAt
  });

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const toggleExpandMessage = (messageId: string) => {
    setExpandedMessageIds((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const toggleExpandDay = (dateKey: string) => {
    setExpandedDays((prev) =>
      prev.includes(dateKey)
        ? prev.filter((date) => date !== dateKey)
        : [...prev, dateKey]
    );
  };

  const handleSummarize = async (dateKey: string) => {
    // 実装時は実際のAI生成処理を呼び出す
    console.log(`Summarizing ${dateKey}`);
    // ダミーの遅延
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // 完了後に再取得
    refetch();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="shadow-sm z-10">
        <CalendarHeader
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />
      </View>
      
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Loader />
        </View>
      ) : calendarDays.length > 0 ? (
        <CalendarGrid
          calendarDays={calendarDays}
          expandedMessageIds={expandedMessageIds}
          expandedDays={expandedDays}
          onToggleExpandMessage={toggleExpandMessage}
          onToggleExpandDay={toggleExpandDay}
          onSummarize={handleSummarize}
        />
      ) : (
        <View className="flex-1 p-4">
          <EmptyCalendar />
        </View>
      )}
    </View>
  );
}
