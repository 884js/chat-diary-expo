import { View, Text } from '@/components/Themed';
import { ScrollView } from 'react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useChatRoomUserMessages } from '@/features/chat/hooks/useChatRoomUserMessages';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { TodayEmotionSummary } from '../components/TodayEmotionSummary';
import { TodayEntries } from '../components/TodayEntries';
import { DailyPrompt } from '../components/DailyPrompt';
import { QuickEntry } from '../components/QuickEntry';

export function HomeScreen() {
  const { currentUser } = useCurrentUser();
  const { messages } = useChatRoomUserMessages({
    userId: currentUser?.id,
  });

  const today = new Date();
  const formattedDate = format(today, 'M月d日(E)', { locale: ja });

  // 今日のメッセージをフィルタリング
  const todayMessages = messages.filter(item => {
    const messageDate = new Date(item.message.created_at);
    return format(messageDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  });

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View className="bg-white px-4 py-6 border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">{formattedDate}</Text>
          <Text className="text-sm text-gray-500 mt-1">今日の日記</Text>
        </View>

        {/* 今日の感情サマリー */}
        <View className="px-4 py-4">
          <TodayEmotionSummary messages={todayMessages} />
        </View>

        {/* 今日のプロンプト */}
        <View className="px-4 pb-4">
          <DailyPrompt />
        </View>

        {/* 今日のエントリー */}
        <View className="px-4">
          <TodayEntries messages={todayMessages} />
        </View>
      </ScrollView>

      {/* クイック入力 */}
      <QuickEntry />
    </View>
  );
}