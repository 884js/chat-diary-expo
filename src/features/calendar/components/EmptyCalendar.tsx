import { Text } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';

export const EmptyCalendar = () => {
  return (
    <View className="flex-1 justify-center items-center m-4 bg-white rounded-xl border border-gray-100 shadow-sm p-8">
      <View className="bg-indigo-50 p-5 rounded-full mb-6">
        <Feather name="calendar" size={64} color="#818cf8" />
      </View>
      <Text className="text-xl font-semibold text-gray-800 mb-3">
        この月の投稿はありません
      </Text>
      <Text className="text-gray-500 text-center max-w-xs">
        別の月を選択するか、新しく書き始めましょう
      </Text>
    </View>
  );
};
