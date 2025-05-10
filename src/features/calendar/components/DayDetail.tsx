import { Text, View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import type React from 'react';
interface HighlightItem {
  good?: string[];
  new?: string[];
}

interface DayDetailProps {
  date: string;
  highlights?: HighlightItem;
  onSummarize: () => void;
  isSummarizing?: boolean;
  summaryStatus?: 'none' | 'manual' | 'auto';
}

/**
 * 日付の詳細情報を表示するコンポーネント
 */
export const DayDetail: React.FC<DayDetailProps> = ({
  date,
  highlights,
  onSummarize,
  isSummarizing = false,
  summaryStatus = 'none',
}) => {
  // 日付のフォーマット（例: 2023-01-01 → 1月1日）
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  return (
    <View className="flex-1">
      {/* ヘッダー部分 */}
      <View className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-2">
        <Text className="font-['MPlus1-Medium'] text-lg">
          {formatDisplayDate(date)}
        </Text>
      </View>

      <View className="p-1">
        {/* ハイライト表示 */}
        {highlights &&
        (summaryStatus === 'auto' || summaryStatus === 'manual') ? (
          <View className="overflow-hidden mb-3">
            <View className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-2 py-1">
              <Text className="font-['MPlus1-Medium'] text-sm">
                この日のできごと
              </Text>
            </View>

            <View className="p-1">
              {/* 良かったこと */}
              {highlights.good && highlights.good.length > 0 && (
                <View className="mb-2 mx-1">
                  <View className="flex-row items-center mb-2 mt-2 bg-emerald-100 py-1 px-2 rounded-md">
                    <View className="w-2 h-6 bg-emerald-500 rounded-full mr-2" />
                    <Text className="font-['MPlus1-Medium'] text-base text-emerald-800">
                      良かったこと
                    </Text>
                  </View>
                  <View className="mt-1">
                    {highlights.good.map((item) => (
                      <View
                        key={`good-${item}`}
                        className="bg-emerald-50 rounded-lg p-2.5 mb-1.5 flex-row"
                      >
                        <View className="bg-emerald-100 rounded-full p-1 mr-2 mt-0.5">
                          <Feather
                            name="check-circle"
                            size={14}
                            color="#059669"
                          />
                        </View>
                        <Text className="font-['MPlus1-Regular'] text-sm text-gray-700 flex-1">
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 新しいこと */}
              {highlights.new && highlights.new.length > 0 && (
                <View className="mx-1 mb-2">
                  <View className="flex-row items-center mb-2 mt-2 bg-amber-100 py-1 px-2 rounded-md">
                    <View className="w-2 h-6 bg-amber-500 rounded-full mr-2" />
                    <Text className="font-['MPlus1-Medium'] text-base text-amber-800">
                      新しいこと
                    </Text>
                  </View>
                  <View className="mt-1">
                    {highlights.new.map((item) => (
                      <View
                        key={`new-${item}`}
                        className="bg-amber-50 rounded-lg p-2.5 mb-1.5 flex-row"
                      >
                        <View className="bg-amber-100 rounded-full p-1 mr-2 mt-0.5">
                          <Feather name="star" size={14} color="#d97706" />
                        </View>
                        <Text className="font-['MPlus1-Regular'] text-sm text-gray-700 flex-1">
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View className="p-4 bg-gray-50 rounded-lg mb-3 items-center">
            <Text className="font-['MPlus1-Regular'] text-sm text-gray-500">
              この日の要約はまだありません
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
