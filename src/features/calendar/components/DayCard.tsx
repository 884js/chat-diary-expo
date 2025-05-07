import { Text } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

type DayCardProps = {
  day: {
    id: string;
    date: string;
    ai_generated_highlights: {
      good: string[];
      new: string[];
    };
  };
  expandedMessageIds: string[];
  isExpandedDay: boolean;
  onToggleExpandMessage: (messageId: string) => void;
  onToggleExpandDay: (dateKey: string) => void;
  onSummarize: (dateKey: string) => Promise<void>;
};

export const DayCard = ({
  day,
  expandedMessageIds,
  isExpandedDay,
  onToggleExpandMessage,
  onToggleExpandDay,
  onSummarize,
}: DayCardProps) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const dateKey = day.date;
  const formattedDate = format(parseISO(day.date), 'M月d日(eee)', {
    locale: ja,
  });

  const aiGeneratedHighlights = day.ai_generated_highlights || {
    good: [],
    new: [],
  };

  const handleSummarize = async () => {
    setIsGeneratingSummary(true);
    try {
      await onSummarize(dateKey);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const hasHighlights =
    aiGeneratedHighlights.good.length > 0 ||
    aiGeneratedHighlights.new.length > 0;

  return (
    <View className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm mb-4">
      <View className="flex-row justify-between items-center p-3 bg-gray-50 border-b border-gray-100">
        <Text className="text-base font-medium text-gray-700">
          {formattedDate}
        </Text>
        <TouchableOpacity
          className="py-1.5 px-3 rounded-full bg-white border border-gray-200 active:bg-gray-100"
          onPress={handleSummarize}
          disabled={isGeneratingSummary}
        >
          <Text className="text-xs text-gray-600">
            {isGeneratingSummary
              ? '実行中...'
              : hasHighlights
                ? '再実行'
                : 'まとめる'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="p-4">
        {hasHighlights && (
          <View className="mb-5">
            <Text className="text-sm font-medium text-indigo-600 mb-2.5">
              この日のできごと
            </Text>

            {aiGeneratedHighlights.good.length > 0 && (
              <View className="p-3 mb-2.5 bg-green-50 rounded-lg border border-green-100">
                <View className="flex-row items-center mb-2">
                  <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center mr-1.5">
                    <Feather name="check" size={12} color="#ffffff" />
                  </View>
                  <Text className="text-sm font-medium text-green-700">
                    良かったこと
                  </Text>
                </View>
                {aiGeneratedHighlights.good.map((item, index) => (
                  <View
                    key={`good-${item.substring(0, 10)}-${index}`}
                    className="ml-3 mb-1.5"
                  >
                    <Text className="text-sm text-gray-700">• {item}</Text>
                  </View>
                ))}
              </View>
            )}

            {aiGeneratedHighlights.new.length > 0 && (
              <View className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <View className="flex-row items-center mb-2">
                  <View className="w-5 h-5 rounded-full bg-blue-500 items-center justify-center mr-1.5">
                    <Feather name="star" size={12} color="#ffffff" />
                  </View>
                  <Text className="text-sm font-medium text-blue-700">
                    新しいこと
                  </Text>
                </View>
                {aiGeneratedHighlights.new.map((item, index) => (
                  <View
                    key={`new-${item.substring(0, 10)}-${index}`}
                    className="ml-3 mb-1.5"
                  >
                    <Text className="text-sm text-gray-700">• {item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};
