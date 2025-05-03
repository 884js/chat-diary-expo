import { Feather } from '@expo/vector-icons';
import { useRef } from 'react';
import { Text, View } from 'react-native';

type ReplyPreviewProps = {
  content: string | null;
  replyRef?: any;
};

export const ReplyPreview = ({ content, replyRef }: ReplyPreviewProps) => {
  const viewRef = useRef(null);

  // refをマージする
  if (replyRef) {
    replyRef.current = viewRef.current;
  }

  if (!content) return null;

  return (
    <View className="w-full mb-2" ref={viewRef}>
      <View className="p-2 bg-blue-50 rounded-md flex-row items-start">
        <Feather
          name="corner-up-right"
          size={14}
          color="#2563eb"
          style={{ marginRight: 4, marginTop: 2 }}
        />
        <Text className="text-xs text-blue-600 flex-shrink">{content}</Text>
      </View>
    </View>
  );
};
