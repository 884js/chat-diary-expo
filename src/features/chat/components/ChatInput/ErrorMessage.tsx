import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type ErrorMessageProps = {
  message: string | null;
};

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;

  return (
    <View className="w-full mb-2">
      <View className="p-2 bg-red-50 rounded-md flex-row items-start">
        <Feather
          name="alert-circle"
          size={14}
          color="#dc2626"
          className="mr-1 mt-0.5"
        />
        <Text className="text-xs text-red-600 flex-shrink">{message}</Text>
      </View>
    </View>
  );
};
