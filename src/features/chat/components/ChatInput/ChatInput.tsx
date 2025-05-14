import { View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useMessageAction } from '../../contexts/MessageActionContext';
import { AttachMenu } from './AttachMenu';
import { ErrorMessage } from './ErrorMessage';
import { ImagePreview } from './ImagePreview';
import { ReplyPreview } from './ReplyPreview';

// 画像タイプ定義
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

interface ChatInputProps {
  onSend: ({
    imagePath,
    message,
    imageUri,
  }: {
    imagePath?: string;
    message: string;
    imageUri?: string;
  }) => Promise<void>;
  isDisabled: boolean;
}

export function ChatInput({ onSend, isDisabled }: ChatInputProps) {
  const { selectedMessage, mode } = useMessageAction();
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  // 入力コンポーネントの参照
  const textInputRef = useRef<TextInput>(null);
  // 画像関連の状態
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 選択されたメッセージがある場合
  useEffect(() => {
    if (selectedMessage) {
      switch (mode) {
        case 'edit':
          setMessage(selectedMessage);
          break;
        case 'reply':
          setMessage('');
          break;
      }
    }
  }, [selectedMessage, mode]);

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

  // 送信ボタンの無効状態判定
  const isButtonDisabled =
    (!message.trim() && !selectedImage) || isDisabled || isUploading;

  // 添付メニューの状態を切り替える
  const toggleAttachMenu = () => {
    // キーボードが表示されている場合は閉じる
    Keyboard.dismiss();
    setShowAttachMenu(!showAttachMenu);
  };

  // 画像プレビューをキャンセル
  const handleCancelImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  // 画像選択処理
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

  // カメラ起動処理
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

  // メッセージ送信処理
  const handleSend = async () => {
    if (isButtonDisabled) return;

    try {
      setIsUploading(true);
      if (selectedImage) {
        // 画像とメッセージを送信
        await onSend({
          imageUri: selectedImage.uri,
          message,
          imagePath: undefined, // サーバー側で設定される
        });
      } else {
        // メッセージのみ送信
        await onSend({
          imagePath: undefined,
          message,
          imageUri: undefined,
        });
      }

      // 送信後は状態をリセット
      setMessage('');
      setSelectedImage(null);
      setImagePreviewUrl(null);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Message send error:', error);
      setUploadError('メッセージの送信に失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  // プレースホルダーテキスト
  const placeholder = useMemo(() => {
    if (isDisabled) {
      return '';
    }

    if (isUploading) {
      return '画像をアップロード中...';
    }

    return 'なにか良いことあった？';
  }, [isDisabled, isUploading]);

  return (
    <View className="bg-white p-3 w-full">
      {/* エラーメッセージ */}
      {uploadError && <ErrorMessage message={uploadError} />}

      {/* 画像プレビュー */}
      {imagePreviewUrl && (
        <ImagePreview imageUrl={imagePreviewUrl} onCancel={handleCancelImage} />
      )}

      {/* 返信プレビュー */}
      {mode === 'reply' && selectedMessage && (
        <ReplyPreview content={selectedMessage} />
      )}

      {/* 入力エリア */}
      <View className="flex-row items-center">
        {/* 添付ボタン */}
        <TouchableOpacity
          onPress={toggleAttachMenu}
          disabled={isDisabled || isUploading}
          className="p-2 mr-2"
        >
          <Feather
            name="paperclip"
            size={22}
            color={isDisabled || isUploading ? '#9ca3af' : '#4b5563'}
          />
        </TouchableOpacity>

        {/* テキスト入力 */}
        <TextInput
          ref={textInputRef}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          multiline
          className="flex-1 bg-white rounded-lg py-2 px-3 mr-2 border border-slate-300 min-h-[40px] max-h-[150px]"
          editable={!isDisabled && !isUploading}
        />

        {/* 送信ボタン */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={isButtonDisabled}
          className={`rounded-full w-10 h-10 items-center justify-center ${
            isButtonDisabled ? 'bg-slate-300' : 'bg-indigo-500'
          }`}
          accessibilityLabel="メッセージを送信"
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Feather name="send" size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>

      {/* 添付メニュー */}
      <AttachMenu
        isOpen={showAttachMenu}
        isDisabled={isDisabled}
        isUploading={isUploading}
        toggleMenu={toggleAttachMenu}
        onSelectImage={handleImageSelect}
        onSelectCamera={handleCameraSelect}
      />
    </View>
  );
}
