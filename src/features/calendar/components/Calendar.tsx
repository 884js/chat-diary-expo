import { Ionicons } from '@expo/vector-icons';
import { formatInTimeZone } from 'date-fns-tz';
import type React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Calendar, type DateData, LocaleConfig } from 'react-native-calendars';
import type { Theme } from 'react-native-calendars/src/types';
import type { CalendarHeaderProps } from 'react-native-calendars/src/calendar/header';

// 日本語ロケール設定
LocaleConfig.locales.ja = {
  monthNames: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  monthNamesShort: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  dayNames: [
    '日曜日',
    '月曜日',
    '火曜日',
    '水曜日',
    '木曜日',
    '金曜日',
    '土曜日',
  ],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: '今日',
};

LocaleConfig.defaultLocale = 'ja';

// カレンダーのテーマ設定
const calendarTheme: Theme = {
  backgroundColor: '#ffffff',
  calendarBackground: '#ffffff',
  textSectionTitleColor: '#4b5563',
  selectedDayBackgroundColor: '#6366f1',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#6366f1',
  dayTextColor: '#1f2937',
  textDisabledColor: '#d1d5db',
  dotColor: '#6366f1',
  selectedDotColor: '#ffffff',
  arrowColor: '#6366f1',
  monthTextColor: '#1f2937',
  textDayFontFamily: 'MPlus1-Regular',
  textMonthFontFamily: 'MPlus1-Medium',
  textDayHeaderFontFamily: 'MPlus1-Regular',
  textDayFontSize: 16,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 14,
};

// マークされた日付の型
interface MarkedDate {
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
}

interface CalendarViewProps {
  currentDate: Date;
  markedDates?: Record<string, MarkedDate>;
  onDateChange: (date: Date) => void;
  onDayPress: (day: DateData) => void;
  onMonthChange: (month: DateData) => void;
}

/**
 * カスタマイズされたカレンダービューコンポーネント
 */
export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  markedDates = {},
  onDateChange,
  onDayPress,
  onMonthChange,
}) => {
  const TIME_ZONE = 'Asia/Tokyo';
  const formattedDate = formatInTimeZone(currentDate, TIME_ZONE, 'yyyy-MM-dd');

  // カスタムヘッダーコンポーネント
  const CustomHeader = (props: CalendarHeaderProps) => {
    const headerDate = new Date(props.current || '');
    const year = headerDate.getFullYear();
    const month = headerDate.getMonth() + 1;

    return (
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-slate-100">
        <TouchableOpacity
          className="p-2 rounded-full bg-slate-50"
          onPress={() => props.addMonth?.(-1)}
        >
          <Ionicons name="chevron-back" size={24} color="#6366f1" />
        </TouchableOpacity>
        <View className="flex-row items-baseline">
          <Text className="font-['MPlus1-Regular'] text-base text-gray-500 mr-1">
            {year}年
          </Text>
          <Text className="font-['MPlus1-Medium'] text-2xl text-gray-800">
            {month}月
          </Text>
        </View>
        <TouchableOpacity
          className="p-2 rounded-full bg-slate-50"
          onPress={() => props.addMonth?.(1)}
        >
          <Ionicons name="chevron-forward" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="bg-white rounded-xl overflow-hidden shadow-sm m-2">
      <Calendar
        current={formattedDate}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        monthFormat={"yyyy MM"}
        hideExtraDays={false}
        showSixWeeks
        firstDay={0} // 日曜始まり
        hideDayNames={false}
        showWeekNumbers={false}
        disableMonthChange={false}
        markedDates={markedDates}
        enableSwipeMonths
        theme={calendarTheme}
        customHeader={CustomHeader}
        style={{ borderRadius: 12 }}
      />
    </View>
  );
};

// 日付にマーク（ドット）を付けるためのヘルパー関数
export const generateMarkedDates = (
  dates: string[],
  selectedDate?: string,
): Record<string, MarkedDate> => {
  const marked: Record<string, MarkedDate> = {};

  // 各日付にドットマークを追加
  for (const date of dates) {
    marked[date] = {
      marked: true,
      dotColor: '#6366f1',
    };
  }

  // 選択された日付があれば、それに選択スタイルを適用
  if (selectedDate) {
    marked[selectedDate] = {
      ...(marked[selectedDate] || {}),
      selected: true,
      selectedColor: '#6366f1',
      selectedTextColor: '#ffffff',
    };
  }

  return marked;
};
