
import { Feather } from "@expo/vector-icons";
import { View, TouchableOpacity, Text } from "react-native";

type Props = {
  onEdit: () => void;
  onReply: () => void;
  onDelete: () => void;
};

export function MessageContextMenu({
  onEdit,
  onReply,
  onDelete,
}: Props) {
  return (
    <View className="absolute right-0 top-8 z-20 bg-white shadow-md rounded-md py-1 min-w-[120px] border border-gray-200">
      <TouchableOpacity
        onPress={onEdit}
        className="flex-row items-center px-4 py-2"
      >
        <Feather name="edit" size={14} className="mr-2" color="#6b7280" />
        <Text className="text-sm text-gray-700">編集</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onReply}
        className="flex-row items-center px-4 py-2"
      >
        <Feather
          name="corner-up-right"
          size={14}
          className="mr-2"
          color="#6b7280"
        />
        <Text className="text-sm text-gray-700">返信</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDelete}
        className="flex-row items-center px-4 py-2"
      >
        <Feather name="trash" size={14} className="mr-2" color="#e11d48" />
        <Text className="text-sm text-red-600">削除</Text>
      </TouchableOpacity>
    </View>
  );
}
