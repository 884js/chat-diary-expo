import { Text } from '@/components/Themed';
import { AntDesign } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { TouchableOpacity, View } from 'react-native';

type CalendarHeaderProps = {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

export const CalendarHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeaderProps) => {
  const currentYearMonth = format(currentDate, 'yyyy年M月', { locale: ja });

  return (
    <View className="flex-row justify-between items-center px-4 py-5 bg-white shadow-sm border-b border-gray-100">
      <TouchableOpacity
        onPress={onPreviousMonth}
        className="flex-row items-center p-2 rounded-full bg-gray-50"
      >
        <AntDesign name="arrowleft" size={18} color="#6366f1" />
        <Text className="text-indigo-500 font-medium ml-1 mr-1">前月</Text>
      </TouchableOpacity>

      <Text className="text-xl font-semibold text-gray-800">
        {currentYearMonth}
      </Text>

      <TouchableOpacity
        onPress={onNextMonth}
        className="flex-row items-center p-2 rounded-full bg-gray-50"
      >
        <Text className="text-indigo-500 font-medium ml-1 mr-1">次月</Text>
        <AntDesign name="arrowright" size={18} color="#6366f1" />
      </TouchableOpacity>
    </View>
  );
};
