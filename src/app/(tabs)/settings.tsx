import { Text, View } from '@/components/Themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WindScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <MaterialCommunityIcons size={48} name="tailwind" color="#1AB3BA" />
      <Text className="text-4xl font-bold underline">Hello, NativeWind!</Text>
    </View>
  );
}
