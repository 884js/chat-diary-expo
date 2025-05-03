import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  TextInput,
  TouchableOpacity,
  View,
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
  }: {
    imagePath: string | undefined;
    message: string;
  }) => Promise<void>;
  isDisabled: boolean;
}

export function ChatInput({
  onSend,
  isDisabled,
}: ChatInputProps) {
  const { selectedMessage, mode, replyMessageRef } = useMessageAction();
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  // 入力コンポーネントの参照
  const textInputRef = useRef<TextInput>(null);
  // 画像関連の状態
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  // 送信ボタンの無効状態判定
  const isButtonDisabled =
    (!message.trim() && !selectedImage) || isDisabled || isUploading;

  // 添付メニューの状態を切り替える
  const toggleAttachMenu = () => {
    // キーボードが表示されている場合は閉じる
    // if (isKeyboardVisible) {
    //   Keyboard.dismiss();
    // }
    setShowAttachMenu(!showAttachMenu);
  };

  // 画像プレビューをキャンセル
  const handleCancelImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  // 画像選択処理
  const handleImageSelect = async () => {
    // ここでは実際の画像選択処理は省略
    // 実際の実装ではExpo Image Pickerなどを使用してください
    setShowAttachMenu(false);

    // ダミーイメージを設定
    const dummyImage = 'https://picsum.photos/400/300';
    setSelectedImage(dummyImage);
    setImagePreviewUrl(dummyImage);
  };

  // カメラ起動処理
  const handleCameraSelect = async () => {
    // ここでは実際のカメラ処理は省略
    // 実際の実装ではExpo Camera/Image Pickerを使用してください
    setShowAttachMenu(false);

    // ダミーイメージを設定
    const dummyImage = 'https://picsum.photos/400/300';
    setSelectedImage(dummyImage);
    setImagePreviewUrl(dummyImage);
  };

  // メッセージ送信処理
  const handleSend = async () => {
    if (isButtonDisabled) return;

    try {
      if (selectedImage) {
        setIsUploading(true);
        // ここで実際には画像アップロード処理が必要
        await onSend({ imagePath: selectedImage, message });
      } else {
        await onSend({ imagePath: undefined, message });
      }

      setMessage('');
      setSelectedImage(null);
      setImagePreviewUrl(null);
      Keyboard.dismiss();
    } catch (error) {
      setUploadError('画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  // プレースホルダーテキスト
  const placeholder = useMemo(() => {
    if (isDisabled) {
      return 'チャット送信はできません';
    }

    if (isUploading) {
      return '画像をアップロード中...';
    }

    return 'メッセージを入力...';
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
        <ReplyPreview content={selectedMessage} replyRef={replyMessageRef} />
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
