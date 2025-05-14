import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  imageUrl: string;
  alt?: string;
  fullWidth?: boolean;
}

export const ChatImage = ({ imageUrl, alt = '', fullWidth = false }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // モーダルを開く
  const openModal = () => {
    setIsModalOpen(true);
    setIsLoading(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 画像読み込み完了時
  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  return (
    <>
      {/* サムネイル表示 */}
      <View className="relative my-2 rounded-lg overflow-hidden bg-gray-50">
        <Image
          source={{ uri: imageUrl }}
          className={`rounded-lg min-h-[200px] ${fullWidth ? 'w-full h-[200px]' : 'w-[200px] h-[200px]'}`}
          resizeMode="cover"
          onLoadEnd={handleLoadEnd}
        />
        {isLoading && (
          <View className="absolute inset-0 justify-center items-center bg-gray-50/50">
            <ActivityIndicator size="small" color="#6366f1" />
          </View>
        )}
        <TouchableOpacity
          onPress={openModal}
          className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full"
          activeOpacity={0.7}
          accessibilityLabel="画像を拡大"
        >
          <Feather name="maximize-2" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* 全画面モーダル */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable
          className="flex-1 bg-black/90 justify-center items-center"
          onPress={closeModal}
        >
          <View className="relative w-full h-full items-center justify-center">
            {isLoading && (
              <View className="absolute z-10 items-center justify-center">
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            )}
            <Image
              source={{ uri: imageUrl }}
              className="w-[90%] h-[70%] max-w-[500px]"
              resizeMode="contain"
              onLoadEnd={handleLoadEnd}
            />
            <TouchableOpacity
              onPress={closeModal}
              className="absolute top-10 right-5 bg-black/50 p-2.5 rounded-full z-20"
              activeOpacity={0.7}
              accessibilityLabel="閉じる"
            >
              <Feather name="x" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
