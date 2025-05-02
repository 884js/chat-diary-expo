import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

// スタンプの種類
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥'];

export function ReactionPicker({
  isVisible,
  onSelectEmoji,
  onClose,
}: {
  isVisible: boolean;
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/30 justify-end" onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white p-4 rounded-t-2xl">
            <View className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

            <Text className="text-center font-medium text-gray-700 mb-3">
              リアクションを選択
            </Text>

            <View className="flex-row flex-wrap justify-center">
              {REACTION_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    onSelectEmoji(emoji);
                    onClose();
                  }}
                  className="w-14 h-14 items-center justify-center m-2"
                >
                  <Text className="text-3xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
