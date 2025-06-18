import { View, Text } from '@/components/Themed';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useAIPrompt } from '@/features/chat/hooks/useAIPrompt';
import { router } from 'expo-router';

export function DailyPrompt() {
  const [isVisible, setIsVisible] = useState(true);
  const { prompt, isLoading, refetch, currentTimeType } = useAIPrompt(isVisible);

  if (!isVisible || isLoading || !prompt) {
    return null;
  }

  const timeEmoji = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌙',
  };

  const handlePromptPress = () => {
    // チャット画面に遷移してプロンプトを設定
    router.push({
      pathname: '/(tabs)/diary',
      params: { prompt: prompt.prompt },
    });
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <View className="bg-blue-50 rounded-lg p-4 border border-blue-100">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center">
          <Text className="text-lg mr-2">{timeEmoji[currentTimeType]}</Text>
          <Text className="text-sm font-medium text-blue-700">
            今日のテーマ
          </Text>
        </View>
        <TouchableOpacity onPress={handleDismiss} className="p-1">
          <Feather name="x" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        onPress={handlePromptPress}
        activeOpacity={0.7}
      >
        <Text className="text-gray-800 leading-relaxed mb-2">
          {prompt.prompt}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-blue-600 text-sm">
            このテーマで書く
          </Text>
          <Feather name="arrow-right" size={14} color="#2563eb" className="ml-1" />
        </View>
      </TouchableOpacity>
    </View>
  );
}