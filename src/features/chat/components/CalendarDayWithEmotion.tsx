import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  // 日付が現在の月のものでない場合は薄い色で表示
  const isDisabled = state === 'disabled';
  const isToday = state === 'today';

  const textColor = isDisabled
    ? '#d1d5db'
    : selected
      ? '#ffffff'
      : isToday
        ? '#3498db'
        : '#1f2937';

  const backgroundColor = selected ? '#3498db' : 'transparent';

  // 主要感情のアイコン情報
  const primaryEmotion = dailyEmotion?.primaryEmotion
    ? emotions.find((e) => e.slug === dailyEmotion.primaryEmotion)
    : undefined;
  return (
    <View
      style={{
        backgroundColor,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        height: 38,
      }}
    >
      {/* 日付 */}
      <Text style={{ color: textColor, fontSize: 14 }}>{date.day}</Text>

      {/* 主要感情アイコン */}
      {primaryEmotion && (
        <MaterialCommunityIcons
          name={primaryEmotion.icon}
          size={16}
          color={selected ? '#ffffff' : primaryEmotion.color}
          style={{ marginTop: 2 }}
        />
      )}
    </View>
  );
};
