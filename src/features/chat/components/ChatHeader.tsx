import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { addMonths, getMonth, getYear, subMonths } from 'date-fns';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { type DailyEmotion, useDailyEmotions } from '../hooks/useDailyEmotions';
import { WeekCalendar } from './WeekCalendar';

export function ChatHeader() {
  const [selectedDate, setSelectedDate] = useState(new Date());
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
  const emotionResults = monthsToLoad.map((monthDate) => {
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

  return (
    <View
      style={{
        maxHeight: 180,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <WeekCalendar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        dailyEmotionsMap={dailyEmotionsMap}
        onWeekChange={(centerDate) => setDisplayedWeekCenter(centerDate)}
      />
    </View>
  );
}