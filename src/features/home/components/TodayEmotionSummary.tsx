import { View, Text } from '@/components/Themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { emotions } from '@/features/chat/hooks/useChatInputEmotion';

interface Props {
  messages: Array<{
    message: {
      emotion?: string;
    };
  }>;
}

export function TodayEmotionSummary({ messages }: Props) {
  // 感情ごとのカウント
  const emotionCounts = messages.reduce((acc, item) => {
    const emotion = item.message.emotion;
    if (emotion) {
      acc[emotion] = (acc[emotion] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // 最も多い感情を取得
  const dominantEmotion = Object.entries(emotionCounts).reduce(
    (max, [emotion, count]) => (count > max.count ? { emotion, count } : max),
    { emotion: 'normal', count: 0 }
  );

  const emotionData = emotions.find(e => e.slug === dominantEmotion.emotion) || emotions[1];

  if (messages.length === 0) {
    return (
      <View className="bg-white rounded-lg p-4 shadow-sm">
        <Text className="text-gray-500 text-center">今日はまだ日記を書いていません</Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <Text className="text-sm text-gray-600 mb-2">今日の気分</Text>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-3">
          <MaterialCommunityIcons
            name={emotionData.icon}
            size={32}
            color={emotionData.color}
          />
          <View>
            <Text className="text-lg font-semibold text-gray-900">
              {emotionData.name}が多め
            </Text>
            <Text className="text-sm text-gray-500">
              {messages.length}件の記録
            </Text>
          </View>
        </View>
        
        {/* 感情の内訳 */}
        <View className="flex-row space-x-2">
          {emotions.map(emotion => {
            const count = emotion.slug ? (emotionCounts[emotion.slug] || 0) : 0;
            if (count === 0) return null;
            
            return (
              <View key={emotion.slug} className="items-center">
                <MaterialCommunityIcons
                  name={emotion.icon}
                  size={20}
                  color={emotion.color}
                />
                <Text className="text-xs text-gray-600 mt-1">{count}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}