import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

type AttachMenuProps = {
  isOpen: boolean;
  isDisabled: boolean;
  isUploading: boolean;
  toggleMenu: () => void;
  onSelectImage: () => void;
  onSelectCamera: () => void;
};

export const AttachMenu = ({
  isOpen,
  isDisabled,
  isUploading,
  toggleMenu,
  onSelectImage,
  onSelectCamera,
}: AttachMenuProps) => {
  // 添付メニューから選択時の処理
  const handleAttachOption = (callback: () => void) => {
    callback();
  };

  if (isDisabled) return null;

  return (
    <View>
      {/* 添付オプションメニュー */}
      {isOpen && (
        <Modal
          visible={isOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={toggleMenu}
        >
          <Pressable
            className="flex-1 bg-black/30 justify-end"
            onPress={toggleMenu}
          >
            <View className="bg-white rounded-t-xl p-4 mb-4 mx-4">
              <Text className="text-lg font-medium text-gray-700 mb-3 text-center">
                添付ファイル
              </Text>

              <TouchableOpacity
                onPress={() => handleAttachOption(onSelectImage)}
                className="flex-row items-center py-3 border-b border-gray-100"
              >
                <Feather
                  name="image"
                  size={22}
                  color="#4b5563"
                  className="mr-3"
                />
                <Text className="text-base text-gray-700">写真を選択</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleAttachOption(onSelectCamera)}
                className="flex-row items-center py-3"
              >
                <Feather
                  name="camera"
                  size={22}
                  color="#4b5563"
                  className="mr-3"
                />
                <Text className="text-base text-gray-700">カメラを起動</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleMenu}
                className="mt-3 py-3 bg-gray-100 rounded-lg items-center"
              >
                <Text className="text-base font-medium text-gray-500">
                  キャンセル
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};
