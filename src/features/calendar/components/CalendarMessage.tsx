import { format, parseISO } from 'date-fns';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';

type CalendarMessageProps = {
  message: {
    id: string;
    content: string | null;
    created_at: string;
    image_path?: string | null;
  };
  isExpanded: boolean;
  onToggleExpand: (messageId: string) => void;
  isLast: boolean;
};

export const CalendarMessage = ({
  message,
  isExpanded,
  onToggleExpand,
  isLast,
}: CalendarMessageProps) => {
  const messageTime = format(parseISO(message.created_at), 'HH:mm');
  const content = message.content || '（無題）';

  return (
    <View className="mb-3">
      <View className="mb-1">
        <Text className="text-gray-500 text-xs font-medium mb-1">{messageTime}</Text>
        <Text
          className={`text-gray-700 leading-5 ${isExpanded ? '' : 'line-clamp-3'}`}
          numberOfLines={isExpanded ? undefined : 3}
        >
          {content}
        </Text>
      </View>

      {content.length > 100 && (
        <TouchableOpacity
          onPress={() => onToggleExpand(message.id)}
          className="mt-1.5 flex-row items-center"
        >
          <Text className="text-xs text-indigo-500 mr-1">
            {isExpanded ? '閉じる' : '続きを読む'}
          </Text>
          <Feather 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={14} 
            color="#6366f1" 
          />
        </TouchableOpacity>
      )}

      {message.image_path && (
        <View className="flex-row items-center mt-1.5">
          <Feather name="image" size={14} color="#6366f1" />
          <Text className="text-xs text-indigo-500 ml-1">画像あり</Text>
        </View>
      )}

      {!isLast && <View className="h-px w-full bg-gray-100 my-3" />}
    </View>
  );
};
