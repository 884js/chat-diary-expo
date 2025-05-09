import { Text, View } from '@/components/Themed';
import { endOfMonth, startOfMonth } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { useState } from 'react';

import { Loader } from '@/components/Loader';
import {
  CalendarView,
  generateMarkedDates,
} from '@/features/calendar/components/Calendar';
import { DayDetail } from '@/features/calendar/components/DayDetail';
import { EmptyCalendar } from '@/features/calendar/components/EmptyCalendar';
import { useCalendarDays } from '@/features/calendar/hooks/useCalendar';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import type { DateData } from 'react-native-calendars';

interface MessageItem {
  id: string;
  content: string;
  createdAt: string;
  isExpanded?: boolean;
}

// メインのカレンダー画面
export default function CalendarScreen() {
  const TIME_ZONE = 'Asia/Tokyo';
  const now = toZonedTime(new Date(), TIME_ZONE);
  const japanTime = now.getTime() + 9 * 60 * 60 * 1000;
  const today = new Date(japanTime);
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();

  // 月の開始日と終了日の取得
  const startAt = formatInTimeZone(
    startOfMonth(currentDate),
    TIME_ZONE,
    'yyyy-MM-dd',
  );
  const endAt = formatInTimeZone(
    endOfMonth(currentDate),
    TIME_ZONE,
    'yyyy-MM-dd',
  );

  const { calendarDays, isLoading, isError, refetch } = useCalendarDays({
    userId: currentUser?.id ?? '',
    startAt,
    endAt,
  });

  const handleSummarize = async (dateKey: string) => {
    // 実装時は実際のAI生成処理を呼び出す
    console.log(`Summarizing ${dateKey}`);
    // ダミーの遅延
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // 完了後に再取得
    refetch();
  };

  // 日付クリック処理
  const handleDayPress = (day: DateData) => {
    const dateKey = day.dateString;
    setSelectedDate(dateKey);
  };

  // 月変更処理
  const handleMonthChange = (month: DateData) => {
    const newDate = new Date(month.timestamp);
    setCurrentDate(newDate);
  };

  // マークする日付の作成
  const getDatesWithMessages = () => {
    return calendarDays.map((day) => day.date);
  };

  // 表示用のデータ準備
  const markedDates = generateMarkedDates(
    getDatesWithMessages(),
    selectedDate || undefined,
  );

  // 選択された日付のみを表示
  const selectedDayData = selectedDate
    ? calendarDays.find((day) => day.date === selectedDate)
    : null;

  return (
    <View className="flex-1 bg-gray-50">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Loader />
        </View>
      ) : (
        <View className="flex-1">
          {/* カレンダー表示 */}
          <CalendarView
            currentDate={currentDate}
            markedDates={markedDates}
            onDateChange={setCurrentDate}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
          />
          {/* 選択中の日付の詳細表示 */}
          {selectedDayData && (
            <DayDetail
              key={selectedDayData.date}
              date={selectedDayData.date}
              highlights={selectedDayData.ai_generated_highlights}
              summaryStatus={selectedDayData.summary_status}
              onSummarize={() => handleSummarize(selectedDayData.date)}
            />
          )}

          {/* 日付が選択されていない場合 */}
          {!selectedDayData && calendarDays.length > 0 && (
            <View className="p-4 flex-1 justify-center items-center">
              <Text className="font-['MPlus1-Medium'] text-gray-500 text-center">
                日付を選択してください
              </Text>
            </View>
          )}

          {/* データが存在しない場合 */}
          {calendarDays.length === 0 && (
            <View className="flex-1 p-4">
              <EmptyCalendar />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
