import { View, Text } from 'react-native';
import { CalendarProvider, ExpandableCalendar, WeekCalendar } from 'react-native-calendars';
import '@/lib/react-native-calendars/locale';

import { format } from 'date-fns';
import { useState, useEffect } from 'react';

// MarkedDatesの型定義
type MarkedDateItem = {
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
};

type MarkedDates = {
  [date: string]: MarkedDateItem;
};

type Props = {
  onScrollToDate: (date: Date) => void;
};

export function ChatHeader({ onScrollToDate }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(
    format(selectedDate, "yyyy年M月")
  );
  const [markedDates, setMarkedDates] = useState<MarkedDates>({
    [format(selectedDate, "yyyy-MM-dd")]: {
      selected: true,
      marked: true,
      selectedColor: "#3498db",
    },
  });

  // 選択された日付が変わったときに年月表示を更新
  useEffect(() => {
    setCurrentMonth(format(selectedDate, "yyyy年M月"));
  }, [selectedDate]);

  return (
    <View style={{ maxHeight: 110, flex: 1 }}>
      {/* 年月表示 */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#1e293b",
            textAlign: "center",
          }}
        >
          {currentMonth}
        </Text>
      </View>

      <CalendarProvider
        date={format(selectedDate, "yyyy-MM-dd")}
        disableAutoDaySelection={[
          ExpandableCalendar.navigationTypes.WEEK_SCROLL,
        ]}
        theme={{
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#64748b",
          selectedDayBackgroundColor: "#3498db",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#3498db",
          dayTextColor: "#1e293b",
          dotColor: "#3498db",
          selectedDotColor: "#ffffff",
          arrowColor: "#3498db",
          monthTextColor: "#1e293b",
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
      >
        <WeekCalendar
          current={format(selectedDate, "yyyy-MM-dd")}
          markedDates={markedDates}
          onDayPress={(day) => {
            const newSelectedDate = new Date(day.timestamp);
            setSelectedDate(newSelectedDate);
            onScrollToDate(newSelectedDate);
            setMarkedDates({
              [day.dateString]: {
                selected: true,
                marked: true,
                selectedColor: "#3498db",
              },
            });
          }}
          hideArrows={false}
          allowShadow={false}
          firstDay={1} // 月曜始まり
        />
      </CalendarProvider>
    </View>
  );
}
