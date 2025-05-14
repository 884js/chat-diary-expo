import { Text, View } from '@/components/Themed';

export const DateDivider = ({ date }: { date: string }) => {
  return (
    <View className="flex-row items-center my-4">
      <View className="flex-grow h-px" />
      <View className="mx-4 rounded-full border border-gray-200 px-2 py-1">
        <Text className="text-xs font-medium">{date}</Text>
      </View>
      <View className="flex-grow h-px" />
    </View>
  );
};
