import { View, Text } from '@/components/Themed';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { emotions } from '@/features/chat/hooks/useChatInputEmotion';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface Props {
  messages: Array<{
    message: {
      id: string;
      content: string;
      created_at: string;
      emotion?: string;
      image_path?: string | null;
    };
  }>;
}

export function TodayEntries({ messages }: Props) {
  const handleEntryPress = () => {
    // 日記画面に遷移
    router.push('/(tabs)/diary');
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <View>
      <Text className="text-lg font-semibold text-gray-900 mb-3">今日の記録</Text>
      <View className="space-y-3">
        {messages.map(({ message }) => {
          const emotionData = emotions.find(e => e.slug === message.emotion);
          const time = format(new Date(message.created_at), 'HH:mm');
          
          return (
            <TouchableOpacity
              key={message.id}
              onPress={handleEntryPress}
              activeOpacity={0.7}
            >
              <View className="bg-white rounded-lg p-4 shadow-sm">
                <View className="flex-row items-start space-x-3">
                  {emotionData && (
                    <MaterialCommunityIcons
                      name={emotionData.icon}
                      size={24}
                      color={emotionData.color}
                    />
                  )}
                  <View className="flex-1">
                    <Text className="text-gray-900 leading-relaxed">
                      {message.content}
                    </Text>
                    <View className="flex-row items-center mt-2 space-x-2">
                      <Text className="text-xs text-gray-500">{time}</Text>
                      {message.image_path && (
                        <View className="flex-row items-center">
                          <MaterialCommunityIcons
                            name="image"
                            size={12}
                            color="#6b7280"
                          />
                          <Text className="text-xs text-gray-500 ml-1">写真</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}