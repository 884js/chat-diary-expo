import { View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useMessageStockAction } from '../../contexts/MessageStockActionContext';
import { useChatRoomMessageStocks } from '../../hooks/useChatRoomMessageStocks';

export function MessageContextStockMenu() {
  const {
    bottomSheetModalRef,
    selectedMessage,
    handleSaveStock,
    handleDeleteStock,
  } = useMessageStockAction();
  const { stockedMessageIds } = useChatRoomMessageStocks();
  const snapPoints = useMemo(() => ['35%'], []);

  const isStocked = stockedMessageIds.includes(selectedMessage?.id ?? '');

  const handleClose = () => {
    bottomSheetModalRef.current?.dismiss();
  };

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
        <View className="bg-transparent flex-1">
          <TouchableOpacity
            onPress={() => {
              if (isStocked) {
                handleDeleteStock();
              } else {
                handleSaveStock();
              }
              handleClose();
            }}
            className="flex-row items-center py-4 border-b border-gray-100 active:bg-gray-100"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mr-3">
              <Feather
                name={'archive'}
                size={18}
                color={isStocked ? '' : '#3b82f6'}
              />
            </View>
            <Text className="text-base font-medium text-gray-700">
              {isStocked ? 'ストック解除' : 'ストック'}
            </Text>
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
