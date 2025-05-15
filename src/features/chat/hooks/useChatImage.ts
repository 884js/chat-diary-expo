import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';

export const useChatImage = () => {
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // カメラ・ギャラリーへのアクセス許可を要求
  const verifyPermissions = async (mediaType: 'camera' | 'library') => {
    if (mediaType === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'アクセス許可が必要です',
          'アプリがカメラにアクセスするには許可が必要です',
          [{ text: 'OK' }],
        );
        return false;
      }
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'アクセス許可が必要です',
          'アプリが写真ライブラリにアクセスするには許可が必要です',
          [{ text: 'OK' }],
        );
        return false;
      }
    }
    return true;
  };

  const handleCancelImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  const handleImageSelect = async () => {
    const hasPermission = await verifyPermissions('library');
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const { uri } = result.assets[0];
        const manipulator = ImageManipulator.manipulate(uri);

        manipulator.resize({
          width: 1080,
        });

        const renderImage = await manipulator.renderAsync();

        const resizeImage = await renderImage.saveAsync({
          format: SaveFormat.JPEG,
          compress: 0.8,
          base64: true,
        });

        setSelectedImage(resizeImage);
        setImagePreviewUrl(resizeImage.uri);
      } else {
        alert('画像が選択されていません');
      }
    } catch (error) {
      console.error('Image selection error:', error);
      setUploadError('画像の選択に失敗しました');
    } finally {
      setShowAttachMenu(false);
    }
  };

  const handleCameraSelect = async () => {
    const hasPermission = await verifyPermissions('camera');
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const { uri } = result.assets[0];
        const manipulator = ImageManipulator.manipulate(uri);
        manipulator.resize({
          width: 1080,
        });

        const renderImage = await manipulator.renderAsync();

        const resizeImage = await renderImage.saveAsync({
          format: SaveFormat.JPEG,
          compress: 0.8,
          base64: true,
        });

        setSelectedImage(resizeImage);
        setImagePreviewUrl(resizeImage.uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setUploadError('カメラの起動に失敗しました');
    } finally {
      setShowAttachMenu(false);
    }
  };

  const toggleAttachMenu = () => {
    // キーボードが表示されている場合は閉じる
    Keyboard.dismiss();
    setShowAttachMenu(!showAttachMenu);
  };

  const resetImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  return {
    showAttachMenu,
    selectedImage,
    imagePreviewUrl,
    isUploading,
    uploadError,
    handleImageSelect,
    handleCameraSelect,
    handleCancelImage,
    toggleAttachMenu,
    resetImage,
  };
};
