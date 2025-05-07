import { View } from '@/components/Themed';
import { addMonths, formatDate } from '@/lib/date-fns';
import { useState } from 'react';

import { Loader } from '@/components/Loader';
import { CalendarGrid } from '@/features/calendar/components/CalendarGrid';
import { CalendarHeader } from '@/features/calendar/components/CalendarHeader';
import { EmptyCalendar } from '@/features/calendar/components/EmptyCalendar';
import { useCalendarDays } from '@/features/calendar/hooks/useCalendar';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
// メインのカレンダー画面
export default function CalendarScreen() {
  const TIME_ZONE = "Asia/Tokyo";
  const now = toZonedTime(new Date(), TIME_ZONE);
  const japanTime = now.getTime() + 9 * 60 * 60 * 1000;
  const today = new Date(japanTime);
  const [currentDate, setCurrentDate] = useState(today);
  const [expandedMessageIds, setExpandedMessageIds] = useState<string[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const { currentUser } = useCurrentUser();

  // 月の開始日と終了日の取得
  const startAt = formatInTimeZone(
    startOfMonth(currentDate),
    TIME_ZONE,
  "yyyy-MM-dd"
);
  const endAt = formatInTimeZone(
    endOfMonth(currentDate),
    TIME_ZONE,
    "yyyy-MM-dd"
  );

  const { calendarDays, isLoading, isError, refetch } = useCalendarDays({
    userId: currentUser?.id ?? '',
    startAt,
    endAt,
  });

  const handlePreviousMonth = () => {
    const prev = subMonths(currentDate, 1);
    setCurrentDate(prev);
  };

  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1);
    setCurrentDate(next);
  };

  const toggleExpandMessage = (messageId: string) => {
    setExpandedMessageIds((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId],
    );
  };

  const toggleExpandDay = (dateKey: string) => {
    setExpandedDays((prev) =>
      prev.includes(dateKey)
        ? prev.filter((date) => date !== dateKey)
        : [...prev, dateKey],
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
