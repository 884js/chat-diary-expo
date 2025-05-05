import { Text, View } from '@/components/Themed';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { currentUser } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert('ログアウト', 'ログアウトしてもよろしいですか？', [
      {
        text: 'キャンセル',
        style: 'cancel',
      },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          try {
            const { error } = await signOut();
            if (error) {
              console.error('ログアウトエラー:', error);
              Alert.alert('エラー', 'ログアウトに失敗しました');
            }
          } catch (err) {
            console.error('ログアウト中にエラーが発生しました:', err);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* ユーザー情報 */}
        <View className="p-4 mb-4 border-b border-gray-100">
          <Text className="text-lg font-medium mb-2">アカウント情報</Text>
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gray-200 rounded-full justify-center items-center mr-3">
              <MaterialIcons name="person" size={20} color="#666" />
            </View>
            <View className="flex-1">
              <Text className="font-medium">
                {currentUser?.email || "メールアドレスなし"}
              </Text>
              <Text className="text-sm text-gray-500">
                @{currentUser?.user_metadata?.user_name || "ユーザー名なし"}
              </Text>
            </View>
          </View>
        </View>

        {/* メニューアイテム */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-medium mb-2">一般設定</Text>

          <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#333"
              className="mr-3"
            />
            <Text className="flex-1">通知設定</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
            <Ionicons
              name="shield-outline"
              size={22}
              color="#333"
              className="mr-3"
            />
            <Text className="flex-1">プライバシー設定</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
            <Ionicons
              name="help-circle-outline"
              size={22}
              color="#333"
              className="mr-3"
            />
            <Text className="flex-1">ヘルプ・サポート</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* ログアウトボタン */}
        <View className="px-4 mb-4">
          <TouchableOpacity
            onPress={handleSignOut}
            disabled={isLoading}
            className="py-3 px-4 rounded-lg justify-center items-center"
          >
            {isLoading ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <Text className="text-red-500 font-medium">ログアウト</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="p-4 mt-4">
          <Text className="text-center text-gray-400 text-xs">
            バージョン 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
