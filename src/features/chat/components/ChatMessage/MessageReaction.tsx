import { TouchableOpacity, Text } from "react-native";

export function MessageReaction({
  emoji,
  count,
  isActive,
  onClick,
}: {
  emoji: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onClick}
      className={`flex-row items-center px-2 py-1 rounded-full mr-1 mb-1 border ${
        isActive ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200"
      }`}
    >
      <Text className="mr-1">{emoji}</Text>
      <Text>{count}</Text>
    </TouchableOpacity>
  );
}
