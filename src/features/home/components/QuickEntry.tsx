import { View, Text } from '@/components/Themed';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export function QuickEntry() {
  const handlePress = () => {
    router.push('/(tabs)/diary');
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
      <TouchableOpacity
        onPress={handlePress}
        className="bg-blue-500 rounded-full py-3 px-6 flex-row items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Feather name="edit-3" size={20} color="white" />
        <Text className="text-white font-medium ml-2">日記を書く</Text>
      </TouchableOpacity>
    </View>
  );
}