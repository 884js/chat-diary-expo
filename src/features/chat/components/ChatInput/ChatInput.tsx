import { View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useMessageAction } from '../../contexts/MessageActionContext';
import { useChatImage } from '../../hooks/useChatImage';
import { useChatInputEmotion } from '../../hooks/useChatInputEmotion';
import type { Emotion } from '../../hooks/useChatInputEmotion';
import { AttachMenu } from './AttachMenu';
import { ChatInputEmotion } from './ChatInputEmotion';
import { ErrorMessage } from './ErrorMessage';
import { ImagePreview } from './ImagePreview';
import { ReplyPreview } from './ReplyPreview';
interface ChatInputProps {
  onSend: ({
    imagePath,
    message,
    imageUri,
    emotion,
  }: {
    imagePath?: string;
    message: string;
    imageUri?: string;
    emotion?: Emotion['slug'];
  }) => Promise<void>;
  isDisabled: boolean;
}

export function ChatInput({ onSend, isDisabled }: ChatInputProps) {
  const { selectedMessage, mode } = useMessageAction();
  const { emotions, selectedEmotion, handleSelectEmotion, handleClearEmotion } =
    useChatInputEmotion();
  const [message, setMessage] = useState('');
  const {
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
  } = useChatImage();

  // 入力コンポーネントの参照
  const textInputRef = useRef<TextInput>(null);

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

  // メッセージ送信処理
  const handleSend = async () => {
    if (isButtonDisabled) return;

    setMessage('');
    resetImage();

    try {
      if (selectedImage) {
        // 画像とメッセージを送信
        await onSend({
          imageUri: selectedImage.uri,
          message,
          imagePath: undefined, // サーバー側で設定される
          emotion: selectedEmotion?.slug,
        });
      } else {
        // メッセージのみ送信
        await onSend({
          imagePath: undefined,
          message,
          imageUri: undefined,
          emotion: selectedEmotion?.slug,
        });
      }

      Keyboard.dismiss();
    } catch (error) {
      console.error('Message send error:', error);
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

    return '今、何考えてる？';
  }, [isDisabled, isUploading]);

  return (
    <View className="bg-white p-3 w-full border-t border-gray-200">
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

      {/* 感情選択バー */}
      <ChatInputEmotion
        emotions={emotions}
        selectedEmotion={selectedEmotion}
        onSelectEmotion={handleSelectEmotion}
        onClearEmotion={handleClearEmotion}
      />
      <View className="flex-row items-center">
        {/* 添付ボタン */}
        <TouchableOpacity
          onPress={toggleAttachMenu}
          disabled={isDisabled || isUploading}
          className="px-2 py-2"
        >
          <Feather
            name="plus"
            size={24}
            color={isDisabled || isUploading ? '#ccc' : '#6b7280'}
          />
        </TouchableOpacity>

        {/* テキスト入力エリア */}
        <View className="flex-1 bg-gray-100 overflow-hidden flex-row items-center">
          {selectedEmotion && (
            <View className="ml-2">
              <MaterialCommunityIcons
                name={selectedEmotion.icon}
                size={24}
                color={selectedEmotion.color}
              />
            </View>
          )}
          <TextInput
            ref={textInputRef}
            className="flex-1 px-4 py-2 min-h-[40px] text-base"
            placeholder={placeholder}
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!isDisabled && !isUploading}
          />
        </View>

        {/* 送信ボタン */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={isButtonDisabled}
          className="ml-2 p-2 rounded-full bg-blue-500 items-center justify-center disabled:opacity-50"
          style={{
            opacity: isButtonDisabled ? 0.5 : 1,
          }}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* 添付メニュー */}
      {showAttachMenu && (
        <AttachMenu
          isOpen={showAttachMenu}
          isDisabled={isDisabled}
          isUploading={isUploading}
          toggleMenu={toggleAttachMenu}
          onSelectImage={handleImageSelect}
          onSelectCamera={handleCameraSelect}
        />
      )}
    </View>
  );
}
