import { Text, View } from 'react-native';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { format, getMonth, getYear, addMonths, subMonths } from 'date-fns';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDailyEmotions, type DailyEmotion } from '../hooks/useDailyEmotions';
import { WeekCalendar } from './WeekCalendar';

export function ChatHeader() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(
    format(selectedDate, 'yyyy年M月'),
  );
  const [displayedWeekCenter, setDisplayedWeekCenter] = useState(new Date()); // 表示中の週の中央日

  const { currentUser } = useCurrentUser();
  
  // 前後2ヶ月ずつ、計5ヶ月分の年月を取得（表示中の週の中央日を基準）
  const monthsToLoad = useMemo(() => {
    return [
      subMonths(displayedWeekCenter, 2),
      subMonths(displayedWeekCenter, 1),
      displayedWeekCenter,
      addMonths(displayedWeekCenter, 1),
      addMonths(displayedWeekCenter, 2),
    ];
  }, [displayedWeekCenter]);

  // 各月の感情データを取得
  const emotionResults = monthsToLoad.map(monthDate => {
    const year = getYear(monthDate);
    const month = getMonth(monthDate) + 1;
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDailyEmotions({
      userId: currentUser?.id || '',
      month,
      year,
    });
  });

  // 5ヶ月分のデータを統合
  const dailyEmotionsMap = useMemo(() => {
    const combinedMap: Record<string, DailyEmotion> = {};
    
    for (const result of emotionResults) {
      Object.assign(combinedMap, result.dailyEmotionsMap);
    }
    
    return combinedMap;
  }, [emotionResults]);

  // 週変更時の処理
  const handleWeekChange = useCallback((centerDate: Date) => {
    setDisplayedWeekCenter(centerDate);
    setCurrentMonth(format(centerDate, 'yyyy年M月'));
  }, []);

  // 選択された日付が変わったときに年月表示を更新
  useEffect(() => {
    setCurrentMonth(format(selectedDate, 'yyyy年M月'));
  }, [selectedDate]);

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

      {/* 週カレンダー */}
      <WeekCalendar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        dailyEmotionsMap={dailyEmotionsMap}
        onWeekChange={handleWeekChange}
      />
    </View>
  );
}
