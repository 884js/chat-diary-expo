import { View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useCallback, useMemo } from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';
import { useMessageAction } from '../../contexts/MessageActionContext';
import { useRoomMessageDetail } from '../../hooks/useRoomMessageDetail';

export function MessageContextMenu() {
  const { bottomSheetModalRef, messageId, handleEditMessage, handleReplyMessage, handleDeleteMessage } = useMessageAction();

  // スナップポイントを定義
  const snapPoints = useMemo(() => ['35%'], []);

  const { messageDetail } = useRoomMessageDetail({
    messageId: messageId as string,
  });

  const handleClose = () => {
    bottomSheetModalRef.current?.dismiss();
  };

  const handleEdit = () => {
    if (!messageDetail?.id || !messageDetail?.content) {
      console.error("messageDetail is undefined");
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
      console.error("messageDetail is undefined");
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
      console.error("messageDetail is undefined");
      return;
    }

    Alert.alert(
      "メッセージを削除",
      "このメッセージを本当に削除しますか？削除後は元に戻すことはできません。",
      [
        {
          text: "キャンセル",
          style: "cancel",
        },
        {
          text: "削除する",
          style: "destructive",
          onPress: async () => {
            console.log("削除する");
            await handleDeleteMessage({ messageId: messageDetail?.id });
            handleClose();
          },
        },
      ]
    );
  };

  // カスタムバックドロップコンポーネント
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ width: 40, backgroundColor: '#cbd5e1' }}
    >
      <BottomSheetView className="flex-1 px-4 pt-2 pb-6">
        <View className="bg-transparent">
          <TouchableOpacity
            onPress={() => {
              handleEdit();
              handleClose();
            }}
            className="flex-row items-center py-4 border-b border-gray-100 active:bg-gray-100"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
              <Feather name="edit" size={18} color="#3b82f6" />
            </View>
            <Text className="text-base font-medium text-gray-700">編集</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleReply();
              handleClose();
            }}
            className="flex-row items-center py-4 border-b border-gray-100 active:bg-gray-100"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mr-3">
              <Feather name="corner-up-right" size={18} color="#22c55e" />
            </View>
            <Text className="text-base font-medium text-gray-700">返信</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleDelete();
              handleClose();
            }}
            className="flex-row items-center py-4 border-b border-gray-100 active:bg-gray-100"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mr-3">
              <Feather name="trash-2" size={18} color="#ef4444" />
            </View>
            <Text className="text-base font-medium text-red-500">削除</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="mt-6 py-3.5 bg-gray-200 rounded-xl items-center"
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Text className="text-base font-medium text-gray-700">
            キャンセル
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
