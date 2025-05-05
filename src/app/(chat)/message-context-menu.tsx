import { useMessageAction } from '@/features/chat/contexts/MessageActionContext';
import { useRoomMessageDetail } from '@/features/chat/hooks/useRoomMessageDetail';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { Alert } from 'react-native';

export default function MessageContextMenuScreen() {
  const { handleDeleteMessage, handleEditMessage, handleReplyMessage } =
    useMessageAction();

  const router = useRouter();
  const { messageId } = useLocalSearchParams();
  const { messageDetail } = useRoomMessageDetail({
    messageId: messageId as string,
  });

  const handleClose = () => {
    router.back();
  };

  const handleEdit = () => {
    if (!messageDetail?.id || !messageDetail?.content) {
      console.error('messageDetail is undefined');
      return;
    }

    handleEditMessage({
      messageId: messageDetail?.id,
      message: messageDetail?.content,
    });
    handleClose();
  };

  const handleReply = () => {
    if (!messageDetail?.id || !messageDetail?.content) {
      console.error('messageDetail is undefined');
      return;
    }

    handleReplyMessage({
      parentMessageId: messageDetail?.id,
      message: messageDetail?.content,
    });
    handleClose();
  };

  const handleDelete = () => {
    if (!messageDetail?.id) {
      console.error('messageDetail is undefined');
      return;
    }

    Alert.alert(
      'メッセージを削除',
      'このメッセージを本当に削除しますか？削除後は元に戻すことはできません。',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            console.log('削除する');
            await handleDeleteMessage({ messageId: messageDetail?.id });
            handleClose();
          },
        },
      ],
    );
  };

  return (
    <View className="bg-white pb-8">
      <View className="w-10 h-1.5 bg-gray-300 rounded-full self-center mt-3 mb-4" />
      <View className="px-4">
        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-gray-100"
          onPress={handleEdit}
        >
          <Feather
            name="edit"
            size={20}
            style={{ marginRight: 12, width: 24 }}
            color="#6b7280"
          />
          <Text className="text-base text-gray-600">編集</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-gray-100"
          onPress={handleReply}
        >
          <Feather
            name="corner-up-right"
            size={20}
            style={{ marginRight: 12, width: 24 }}
            color="#6b7280"
          />
          <Text className="text-base text-gray-600">返信</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-gray-100"
          onPress={handleDelete}
        >
          <Feather
            name="trash"
            size={20}
            style={{ marginRight: 12, width: 24 }}
            color="#e11d48"
          />
          <Text className="text-base text-red-600">削除</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-gray-100"
          onPress={handleClose}
        >
          <Text className="text-base text-gray-600">キャンセル</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
