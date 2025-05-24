import { useCallback, useRef, useState } from 'react';
import { View, FlatList, Text, Pressable, Dimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { format } from 'date-fns';
import type { DailyEmotion } from '../hooks/useDailyEmotions';
import { CalendarDayWithEmotion } from './CalendarDayWithEmotion';
import {
  getWeekdayLabels,
  getMultipleWeeks,
  prependWeeks,
  appendWeeks,
  type WeekDay,
} from '../utils/dateUtils';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = screenWidth;

type Props = {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  dailyEmotionsMap: Record<string, DailyEmotion>;
  onWeekChange?: (centerDate: Date) => void; // 週変更時のコールバック
};

type WeekItemProps = {
  week: WeekDay[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  dailyEmotionsMap: Record<string, DailyEmotion>;
};

const WeekItem = ({
  week,
  selectedDate,
  onDateSelect,
  dailyEmotionsMap,
}: WeekItemProps) => {
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

  return (
    <View
      style={{
        width: ITEM_WIDTH,
        flexDirection: 'row',
        paddingHorizontal: 8,
      }}
    >
      {week.map((day) => (
        <View
          key={day.dateString}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 4,
          }}
        >
          <Pressable
            onPress={() => onDateSelect(day.date)}
            style={{
              width: '100%',
              alignItems: 'center',
            }}
          >
            <CalendarDayWithEmotion
              date={{
                dateString: day.dateString,
                day: day.day,
                month: day.date.getMonth() + 1,
                year: day.date.getFullYear(),
                timestamp: day.date.getTime(),
              }}
              state={
                day.isToday
                  ? 'today'
                  : !day.isCurrentMonth
                    ? 'disabled'
                    : undefined
              }
              selected={day.dateString === selectedDateString}
              dailyEmotion={dailyEmotionsMap[day.dateString]}
              onPress={() => onDateSelect(day.date)}
            />
          </Pressable>
        </View>
      ))}
    </View>
  );
};

export const WeekCalendar = ({
  selectedDate,
  onDateSelect,
  dailyEmotionsMap,
  onWeekChange,
}: Props) => {
  const flatListRef = useRef<FlatList<WeekDay[]>>(null);
  const [baseDate] = useState(selectedDate); // 基準日（変更しない）
  
  // 週データをstateで管理（初期は1年分）
  const [weeks, setWeeks] = useState<WeekDay[][]>(() => 
    getMultipleWeeks(baseDate, baseDate, 104) // 2年分（104週）で開始
  );
  const [currentWeekIndex, setCurrentWeekIndex] = useState(52); // 2年分の中央を初期位置に

  // 前方向にデータを追加する関数（過去の週）- 真の無限スクロール
  const loadEarlierWeeks = useCallback(() => {
    setWeeks(currentWeeks => {
      const newWeeks = prependWeeks(currentWeeks, 52); // 1年分追加
      return newWeeks;
    });
    
    // インデックスを調整（新しいデータが前に追加されたため）
    setCurrentWeekIndex(prev => prev + 52);
  }, []);

  // 後方向にデータを追加する関数（未来の週）- 真の無限スクロール
  const loadLaterWeeks = useCallback(() => {
    setWeeks(currentWeeks => {
      const newWeeks = appendWeeks(currentWeeks, 52); // 1年分追加
      return newWeeks;
    });
  }, []);

  // スクロール終了時のハンドラー
  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
    setCurrentWeekIndex(index);
    
    // 現在表示中の週の中央日付をコールバックで通知
    if (onWeekChange && weeks[index]) {
      const currentWeek = weeks[index];
      const centerDate = currentWeek[Math.floor(currentWeek.length / 2)].date;
      onWeekChange(centerDate);
    }
    
    // 無限スクロールのトリガー（端に近づいたら追加データを読み込み）
    if (index < 26) {
      // 前方向のデータ追加（半年以内になったら1年分追加）
      loadEarlierWeeks();
    } else if (index > weeks.length - 26) {
      // 後方向のデータ追加（半年以内になったら1年分追加）
      loadLaterWeeks();
    }
  }, [onWeekChange, weeks, loadEarlierWeeks, loadLaterWeeks]);

  // 週データの描画
  const renderWeek = useCallback(
    ({ item: week }: { item: WeekDay[] }) => (
      <WeekItem
        week={week}
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        dailyEmotionsMap={dailyEmotionsMap}
      />
    ),
    [selectedDate, onDateSelect, dailyEmotionsMap]
  );

  const getItemLayout = useCallback(
    (data: ArrayLike<WeekDay[]> | null | undefined, index: number) => ({
      length: ITEM_WIDTH,
      offset: ITEM_WIDTH * index,
      index,
    }),
    []
  );

  return (
    <View style={{ backgroundColor: 'white' }}>
      {/* 曜日ラベル */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        }}
      >
        {getWeekdayLabels().map((label) => (
          <View
            key={label}
            style={{
              flex: 1,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: '#64748b',
                fontWeight: '500',
              }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* 週カレンダー */}
      <FlatList<WeekDay[]>
        ref={flatListRef}
        data={weeks}
        renderItem={renderWeek}
        keyExtractor={(_, index) => `week-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        initialScrollIndex={currentWeekIndex}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
        style={{
          maxHeight: 60,
        }}
      />
    </View>
  );
}; 