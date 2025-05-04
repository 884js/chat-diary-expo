import { Feather } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function MessageContextMenuScreen() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <View className="bg-white pb-8">
      <View className="w-10 h-1.5 bg-gray-300 rounded-full self-center mt-3 mb-4" />
      <View className="px-4">
        <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
          <Feather
            name="edit"
            size={20}
            style={{ marginRight: 12, width: 24 }}
            color="#6b7280"
          />
          <Text className="text-base text-gray-600">編集</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
          <Feather
            name="corner-up-right"
            size={20}
            style={{ marginRight: 12, width: 24 }}
            color="#6b7280"
          />
          <Text className="text-base text-gray-600">返信</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
          <Feather
            name="trash"
            size={20}
            style={{ marginRight: 12, width: 24 }}
            color="#e11d48"
          />
          <Text className="text-base text-red-600">削除</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100" onPress={handleClose}>
          <Text className="text-base text-gray-600">キャンセル</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
