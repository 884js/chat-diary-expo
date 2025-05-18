import { Text, View } from 'react-native';
import {
  CalendarProvider,
  ExpandableCalendar,
  WeekCalendar,
} from 'react-native-calendars';
import '@/lib/react-native-calendars/locale';

import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { format, getMonth, getYear } from 'date-fns';
import { useEffect, useState } from 'react';
import type { DateData } from 'react-native-calendars';
import { useDailyEmotions } from '../hooks/useDailyEmotions';
import { CalendarDayWithEmotion } from './CalendarDayWithEmotion';

// MarkedDatesの型定義
type MarkedDateItem = {
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
};

type MarkedDates = {
  [date: string]: MarkedDateItem;
};

export function ChatHeader() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(
    format(selectedDate, 'yyyy年M月'),
  );

  const { currentUser } = useCurrentUser();
  const year = getYear(selectedDate);
  const month = getMonth(selectedDate) + 1; // getMonth()は0始まり

  // 現在表示中の月の日ごとの感情データを取得
  const { dailyEmotionsMap } = useDailyEmotions({
    userId: currentUser?.id || '',
    month,
    year,
  });

  // 選択した日付
  const selectedDateFormatted = format(selectedDate, 'yyyy-MM-dd');

  // 選択された日付が変わったときに年月表示を更新
  useEffect(() => {
    setCurrentMonth(format(selectedDate, 'yyyy年M月'));
  }, [selectedDate]);

  // カスタムdayComponentのレンダー関数
  const renderDayComponent = (props: { date?: DateData; state?: string }) => {
    const { date, state } = props;

    if (!date) return null;

    return (
      <CalendarDayWithEmotion
        date={date}
        state={state}
        selected={date.dateString === selectedDateFormatted}
        dailyEmotion={dailyEmotionsMap[date.dateString]}
        onPress={(day) => {
          const newSelectedDate = new Date(day.timestamp);
          setSelectedDate(newSelectedDate);
        }}
      />
    );
  };

  return (
    <View style={{ maxHeight: 120, flex: 1 }}>
      {/* 年月表示 */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#1e293b',
            textAlign: 'center',
          }}
        >
          {currentMonth}
        </Text>
      </View>

      <CalendarProvider
        date={format(selectedDate, 'yyyy-MM-dd')}
        disableAutoDaySelection={[
          ExpandableCalendar.navigationTypes.WEEK_SCROLL,
        ]}
        theme={{
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#64748b',
          selectedDayBackgroundColor: '#3498db',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#3498db',
          dayTextColor: '#1e293b',
          dotColor: '#3498db',
          selectedDotColor: '#ffffff',
          arrowColor: '#3498db',
          monthTextColor: '#1e293b',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
      >
        <WeekCalendar
          current={format(selectedDate, 'yyyy-MM-dd')}
          dayComponent={renderDayComponent}
          onDayPress={(day) => {
            const newSelectedDate = new Date(day.timestamp);
            setSelectedDate(newSelectedDate);
          }}
          hideArrows={false}
          allowShadow={false}
          firstDay={1} // 月曜始まり
        />
      </CalendarProvider>
    </View>
  );
}
