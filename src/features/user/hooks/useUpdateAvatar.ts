import { useSupabase } from '@/hooks/useSupabase';
import { UserApi } from '@/lib/supabase/api/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

export const useUpdateAvatar = (userId: string) => {
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const userApi = new UserApi(supabase);

  const updateAvatarMutation = useMutation({
    mutationFn: async (imageUri: string) => {
      // 画像をリサイズ（新しいAPIを使用）
      const manipulator = ImageManipulator.manipulate(imageUri);
      manipulator.resize({ width: 400 });
      
      const renderImage = await manipulator.renderAsync();
      const resizedImage = await renderImage.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.8,
      });

      // アバターをアップロード（FileSystemを使用）
      const { path } = await userApi.uploadAvatar({
        userId,
        file: { uri: resizedImage.uri, type: 'image/jpeg' },
      });

      // プロフィールを更新（pathを保存）
      const updatedProfile = await userApi.updateUserProfile({
        userId,
        avatarUrl: path,
      });

      return updatedProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    onError: (error) => {
      console.error('Avatar update error:', error);
      Alert.alert('エラー', 'アバターの更新に失敗しました');
    },
  });

  const pickImageFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('権限エラー', 'ギャラリーへのアクセス権限が必要です');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setIsLoading(true);
      try {
        await updateAvatarMutation.mutateAsync(result.assets[0].uri);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const takePhotoFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('権限エラー', 'カメラへのアクセス権限が必要です');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setIsLoading(true);
      try {
        await updateAvatarMutation.mutateAsync(result.assets[0].uri);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    pickImageFromGallery,
    takePhotoFromCamera,
    isLoading: isLoading || updateAvatarMutation.isPending,
  };
};
