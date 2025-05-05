import { Text } from '@/components/Themed';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { FontAwesome6 } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { signInWithX, signInWithGoogle, isAuthLoading } = useAuth();

  return (
    <View className="flex-1 justify-center items-center px-6">
      <TouchableOpacity
        onPress={signInWithX}
        className="bg-black rounded-lg py-4 px-6 flex-row items-center mb-4"
      >
        <FontAwesome6
          name="x-twitter"
          size={22}
          color="#FFFFFF"
          style={{ marginRight: 12 }}
        />
        <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16 }}>
          Xでログイン
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={signInWithGoogle}
        className="bg-[#4285F4] rounded-lg py-4 px-6 flex-row items-center"
        disabled={isAuthLoading}
      >
        <FontAwesome6
          name="google"
          size={22}
          color="#FFFFFF"
          style={{ marginRight: 12 }}
        />
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
          Googleでログイン
        </Text>
      </TouchableOpacity>
    </View>
  );
}
