import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { emotions } from '../hooks/useChatInputEmotion';
import type { DailyEmotion } from '../hooks/useDailyEmotions';

type Props = {
  date: DateData;
  state?: string;
  dailyEmotion?: DailyEmotion;
  selected?: boolean;
  onPress?: (date: DateData) => void;
};

export const CalendarDayWithEmotion = ({
  date,
  state,
  dailyEmotion,
  selected,
  onPress,
}: Props) => {
  // 今日かどうかの判定
  const isToday = state === 'today';

  // 主要感情のアイコン情報
  const primaryEmotion = dailyEmotion?.primaryEmotion
    ? emotions.find((e) => e.slug === dailyEmotion.primaryEmotion)
    : undefined;

  // 選択状態のグラデーション
  const selectedGradient = ['#ffffff', '#f8fafc'] as const;
  const defaultGradient = ['#ffffff', '#f8fafc'] as const;

  const textColor = selected ? '#1f2937' : isToday ? '#6b7280' : '#1f2937';

  const containerStyle = {
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: isToday && !selected ? 11 : selected ? 11 : 12, // 境界線1px分を調整
    height: 56,
    width: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: selected ? 0.25 : isToday ? 0.12 : 0.08,
    shadowRadius: selected ? 8 : isToday ? 6 : 4,
    elevation: selected ? 6 : isToday ? 3 : 2,
    borderWidth: (isToday && !selected) || selected ? 1 : 0,
    borderColor: selected
      ? '#d1d5db'
      : isToday && !selected
        ? '#e5e7eb'
        : 'transparent',
  };

  const dayContent = (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* 日付 */}
      <Text
        style={{
          color: textColor,
          fontSize: 16,
          fontWeight: selected ? '600' : '500',
          marginBottom: primaryEmotion ? 2 : 0,
        }}
      >
        {date.day}
      </Text>

      {/* 主要感情アイコン */}
      {primaryEmotion && (
        <MaterialCommunityIcons
          name={primaryEmotion.icon}
          size={18}
          color={primaryEmotion.color}
        />
      )}
    </View>
  );

  if (selected) {
    return (
      <LinearGradient
        colors={selectedGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={containerStyle}
      >
        {dayContent}
      </LinearGradient>
    );
  }

  // 今日と通常の日付は白背景で統一（今日は境界線で区別）
  return (
    <LinearGradient
      colors={defaultGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        ...containerStyle,
        shadowOpacity: isToday ? 0.12 : 0.08,
        opacity: 1,
      }}
    >
      {dayContent}
    </LinearGradient>
  );
};