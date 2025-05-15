import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import type { Emotion } from '../../hooks/useChatInputEmotion';

type Props = {
  emotions: Emotion[];
  selectedEmotion: Emotion | null;
  handleSelectEmotion: (emotion: Emotion) => void;
  handleClearEmotion: () => void;
};

export const ChatInputEmotion = ({
  emotions,
  selectedEmotion,
  handleSelectEmotion,
  handleClearEmotion,
}: Props) => {
  return (
    <View className="flex-row items-center">
      <Text className="text-gray-500 text-sm mx-2">気分</Text>
      <View className="flex-row space-x-3">
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion.id}
            onPress={() => handleSelectEmotion(emotion)}
            className={`items-center justify-center p-2 rounded-full ${
              selectedEmotion?.id === emotion.id ? 'bg-gray-100' : ''
            }`}
          >
            <MaterialCommunityIcons
              name={emotion.icon}
              size={28}
              color={emotion.color}
            />
          </TouchableOpacity>
        ))}
        {selectedEmotion && (
          <TouchableOpacity
            onPress={handleClearEmotion}
            className="items-center justify-center p-2"
          >
            <Feather name="x" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
