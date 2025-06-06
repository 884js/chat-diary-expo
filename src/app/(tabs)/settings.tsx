import { IconButton } from '@/components/IconButton';
import { SafeAreaView } from '@/components/SafeAreaView';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useUpdateAvatar } from '@/features/user/hooks/useUpdateAvatar';
import { useStorageImage } from '@/hooks/useStorageImage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { currentUser, currentUserProfile } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const {
    pickImageFromGallery,
    takePhotoFromCamera,
    isLoading: isUpdatingAvatar,
  } = useUpdateAvatar(currentUser?.id || '');

  const avatarPath = currentUserProfile?.avatar_url?.startsWith('http')
    ? null
    : currentUserProfile?.avatar_url || null;

  const { imageUrl: avatarUrl } = useStorageImage({
    imagePath: avatarPath,
    storageName: 'users',
  });

  const displayAvatarUrl = currentUserProfile?.avatar_url?.startsWith('http')
    ? currentUserProfile.avatar_url
    : avatarUrl;

  const handleAvatarPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['キャンセル', 'カメラで撮影', 'ライブラリから選択'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhotoFromCamera();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          }
        },
      );
    } else {
      Alert.alert(
        'プロフィール画像を変更',
        '選択してください',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'カメラで撮影', onPress: takePhotoFromCamera },
          { text: 'ライブラリから選択', onPress: pickImageFromGallery },
        ],
        { cancelable: true },
      );
    }
  };

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
    <SafeAreaView>
      <ScrollView className="flex-1 bg-gray-50">
        {/* ユーザー情報 */}
        <View className="bg-white">
          <View className="px-4 pt-6 pb-4">
            <View className="items-center mb-4">
              <TouchableOpacity
                onPress={handleAvatarPress}
                disabled={isUpdatingAvatar}
                className="relative"
              >
                <View className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full justify-center items-center overflow-hidden border-2 border-gray-200 shadow-sm">
                  {displayAvatarUrl ? (
                    <Image
                      source={{ uri: displayAvatarUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-full justify-center items-center">
                      <MaterialIcons name="person" size={48} color="#60A5FA" />
                    </View>
                  )}
                </View>
                {isUpdatingAvatar && (
                  <View className="absolute inset-0 bg-black/50 rounded-full justify-center items-center">
                    <ActivityIndicator color="white" size="small" />
                  </View>
                )}
                <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2.5 border-2 border-white shadow-lg">
                  <MaterialIcons name="camera-alt" size={16} />
                </View>
              </TouchableOpacity>
            </View>
            
            <View className="items-center">
              <Text className="text-lg font-semibold text-gray-900">
                {currentUserProfile?.display_name || 'ユーザー名未設定'}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {currentUser?.email || 'メールアドレスなし'}
              </Text>
            </View>
          </View>
          
          <View className="border-t border-gray-100 mx-4" />
          
          <TouchableOpacity className="px-4 py-3 flex-row items-center">
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <Text className="flex-1 ml-3 text-gray-700">プロフィール編集</Text>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* メニューアイテム */}
        <View className="mt-6">
          <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider px-4 mb-2">一般設定</Text>
          
          <View className="bg-white">
            <TouchableOpacity className="flex-row items-center px-4 py-3 border-b border-gray-100">
              <View className="w-8 h-8 bg-orange-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="notifications-outline" size={20} color="#F97316" />
              </View>
              <Text className="flex-1 text-gray-700">通知設定</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center px-4 py-3 border-b border-gray-100">
              <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="shield-outline" size={20} color="#3B82F6" />
              </View>
              <Text className="flex-1 text-gray-700">プライバシー設定</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center px-4 py-3">
              <View className="w-8 h-8 bg-purple-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="help-circle-outline" size={20} color="#8B5CF6" />
              </View>
              <Text className="flex-1 text-gray-700">ヘルプ・サポート</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ログアウトボタン */}
        <View className="mt-6 mb-4">
          <View className="bg-white">
            <TouchableOpacity
              onPress={handleSignOut}
              disabled={isLoading}
              className="flex-row items-center px-4 py-3"
            >
              <View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              </View>
              {isLoading ? (
                <ActivityIndicator color="#ef4444" />
              ) : (
                <Text className="flex-1 text-red-500 font-medium">ログアウト</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-4 mt-8 mb-4">
          <Text className="text-center text-gray-400 text-xs">
            バージョン 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
