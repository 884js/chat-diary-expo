import { Text, View } from '@/components/Themed';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useAIPrompt } from '../hooks/useAIPrompt';

interface AIPromptSuggestionProps {
  onPromptSelect: (prompt: string) => void;
}

export function AIPromptSuggestion({ onPromptSelect }: AIPromptSuggestionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { prompt, isLoading, refetch, currentTimeType } = useAIPrompt();

  if (!isVisible || isLoading) {
    return null;
  }

  const timeEmoji = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌙',
  };

  const handlePromptPress = () => {
    if (prompt?.prompt) {
      onPromptSelect(prompt.prompt);
      setIsVisible(false);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!prompt?.prompt) {
    return null;
  }

  return (
    <View className="mx-3 mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <View className="flex-row items-center justify-between mb-2 bg-transparent">
        <View className="flex-row items-center bg-transparent">
          <Text className="text-lg mr-2">{timeEmoji[currentTimeType]}</Text>
          <Text className="text-sm font-medium text-blue-700">
            AI問いかけ
          </Text>
        </View>
        <View className="flex-row bg-transparent">
          <TouchableOpacity onPress={handleRefresh} className="p-1 mr-2">
            <Feather name="refresh-cw" size={16} color="#1d4ed8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDismiss} className="p-1">
            <Feather name="x" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity
        onPress={handlePromptPress}
        className="bg-white p-3 rounded border border-blue-100"
        activeOpacity={0.7}
      >
        <Text className="text-gray-800 text-base leading-relaxed">
          {prompt.prompt}
        </Text>
        <View className="mt-2 flex-row items-center bg-transparent">
          <Text className="text-blue-600 text-sm font-medium mr-1">
            タップして入力
          </Text>
          <Feather name="arrow-right" size={14} color="#2563eb" />
        </View>
      </TouchableOpacity>
    </View>
  );
}