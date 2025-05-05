import { View, Text } from "@/components/Themed";

export const DateDivider = ({ date }: { date: string }) => (
  <View className="flex-row items-center my-4">
    <View className="flex-grow h-px bg-gray-200" />
    <View className="mx-4">
      <Text className="text-xs text-gray-500 font-medium bg-ivory-50 px-2 py-1 rounded-full border border-gray-200">
        {date}
      </Text>
    </View>
    <View className="flex-grow h-px bg-gray-200" />
  </View>
);
