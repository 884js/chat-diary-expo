import { ScrollView, Text, View } from '@/components/Themed';
import { endOfMonth, isSameDay, startOfMonth } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { useEffect, useState } from 'react';

import { Loader } from '@/components/Loader';
import {
  CalendarView,
  generateMarkedDates,
} from '@/features/calendar/components/Calendar';
import { DayDetail } from '@/features/calendar/components/DayDetail';
import { EmptyCalendar } from '@/features/calendar/components/EmptyCalendar';
import { useCalendarDays } from '@/features/calendar/hooks/useCalendar';
import { useSummarize } from '@/features/calendar/hooks/useSummarize';
import { useUpdateCalendarSummary } from '@/features/calendar/hooks/useUpdateCalendarSummary';
import { useChatRoomMessages } from '@/features/chat/hooks/useChatRoomMessages';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { formatDate } from '@/lib/date-fns';
import type { DateData } from 'react-native-calendars';

// メインのカレンダー画面
export default function CalendarScreen() {
  const { summarize, isPending: isSummarizing } = useSummarize();
  const { updateCalendarSummary } = useUpdateCalendarSummary();

  const TIME_ZONE = 'Asia/Tokyo';
  const now = toZonedTime(new Date(), TIME_ZONE);
  const japanTime = now.getTime() + 9 * 60 * 60 * 1000;
  const today = new Date(japanTime);

  const [currentDate, setCurrentDate] = useState(today);
  // 月の開始日と終了日の取得
  const formattedNow = formatDate(now, 'yyyy-MM-dd');

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

  const [selectedDate, setSelectedDate] = useState<string>(
    formatDate(new Date(now), 'yyyy-MM-dd'),
  );
  const { currentUser } = useCurrentUser();

  const { chatRoomMessages, isLoading: isMessagesLoading } =
    useChatRoomMessages({
      userId: currentUser?.id || '',
      startAt,
      endAt,
    });

  const todayMessages = chatRoomMessages.filter((m) => {
    const messageDate = formatDate(new Date(m.created_at), 'yyyy-MM-dd');
    return isSameDay(messageDate, selectedDate);
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // 今日の日付をYYYY-MM-DD形式で取得
    const todayFormatted = formatDate(new Date(now), 'yyyy-MM-dd');
    setSelectedDate(todayFormatted);
  }, []);

  const { calendarDays, isLoading, isError, refetch } = useCalendarDays({
    userId: currentUser?.id ?? '',
    startAt,
    endAt,
  });

  const handleSummarize = async (dateKey: string) => {
    const messagesText = todayMessages
      .map((m) => m.content?.trim())
      .filter((c) => c && c.length > 0)
      .join('\n');

    const result = await summarize({
      messagesText,
    });

    await updateCalendarSummary({
      userId: currentUser?.id || '',
      dateKey,
      json: result,
    });

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // MEMO: 今日の日付を選択した場合は要約を作成しない
    if (selectedDate === formattedNow) {
      return;
    }

    // 要約が存在する場合は要約を作成しない
    if (selectedDayData?.summary_status !== 'none') {
      return;
    }

    // メッセージが存在する場合は要約を作成
    if (todayMessages.length > 0) {
      handleSummarize(selectedDate);
    }
  }, [selectedDate, todayMessages, selectedDayData]);

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
            <ScrollView className="rounded-xl mx-2 flex-1">
              <DayDetail
                key={selectedDayData.date}
                date={selectedDayData.date}
                highlights={selectedDayData.ai_generated_highlights}
                summaryStatus={selectedDayData.summary_status}
                onSummarize={() => handleSummarize(selectedDayData.date)}
              />
            </ScrollView>
          )}

          {/* 日付が選択されていない場合 */}
          {!selectedDayData && (
            <View className="p-4 flex-1 justify-center items-center">
              <Text className="font-['MPlus1-Medium'] text-gray-500 text-center">
                この日の要約はまだありません
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
