import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  isVisible: boolean;
  onEdit: () => void;
  onReply: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function MessageContextMenu({
  isVisible,
  onEdit,
  onReply,
  onDelete,
  onClose,
}: Props) {
  // アニメーション用の値
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 表示・非表示に合わせてアニメーションを実行
  useEffect(() => {
    if (isVisible) {
      // 表示時は下から上へスライド（滑らかなイージング）
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      // 非表示時は上から下へスライド（やや早く）
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  // 画面の高さを取得（アニメーション計算用）
  const { height } = Dimensions.get('window');

  // translateYの計算（0→1の値を高さに変換）
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
    extrapolate: 'clamp',
  });

  // 透明度のアニメーション
  const opacity = slideAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.7, 1],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Animated.View
          className="bg-white rounded-t-3xl pb-8"
          style={{
            transform: [{ translateY }],
            opacity,
          }}
        >
          <View className="w-10 h-1.5 bg-gray-200 rounded-full self-center mt-3 mb-4" />

          <View className="px-4">
            <TouchableOpacity
              onPress={() => {
                onEdit();
                onClose();
              }}
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              <Feather
                name="edit"
                size={20}
                className="mr-3 w-6"
                color="#6b7280"
              />
              <Text className="text-base text-gray-600">編集</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onReply();
                onClose();
              }}
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              <Feather
                name="corner-up-right"
                size={20}
                className="mr-3 w-6"
                color="#6b7280"
              />
              <Text className="text-base text-gray-600">返信</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onDelete();
                onClose();
              }}
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              <Feather
                name="trash"
                size={20}
                className="mr-3 w-6"
                color="#e11d48"
              />
              <Text className="text-base text-red-600">削除</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="mt-3 mx-4 py-3.5 bg-gray-50 rounded-lg items-center"
            onPress={onClose}
          >
            <Text className="text-base font-medium text-gray-500">
              キャンセル
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
