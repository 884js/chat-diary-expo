import { Feather } from '@expo/vector-icons';
import { Image, TouchableOpacity, View } from 'react-native';

type ImagePreviewProps = {
  imageUrl: string | null;
  onCancel: () => void;
};

export const ImagePreview = ({ imageUrl, onCancel }: ImagePreviewProps) => {
  if (!imageUrl) return null;

  return (
    <View className="w-full mb-2">
      <View className="relative h-32 rounded-md border border-slate-300 overflow-hidden">
        <Image
          source={{ uri: imageUrl }}
          className="h-full w-full"
          resizeMode="contain"
          accessibilityLabel="プレビュー画像"
        />
        <TouchableOpacity
          onPress={onCancel}
          className="absolute right-2 top-2 rounded-full bg-black/50 p-1"
          accessibilityLabel="画像選択をキャンセル"
        >
          <Feather name="x" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
