import React from 'react';
import { View, Text } from 'react-native';
import { formatDate } from '@/lib/date-fns';

export function ChatHeader() {
  return (
    <View className="bg-white shadow-sm py-3 px-2 z-10">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <Text className="text-slate-800">📅 今日：{formatDate(new Date(), 'yyyy年M月dd日')}</Text>
        </View>
      </View>
    </View>
  );
}
