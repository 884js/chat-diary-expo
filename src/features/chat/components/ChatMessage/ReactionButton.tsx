import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

// ReactionButton コンポーネント
export function ReactionButton({ onClick }: { onClick: () => void }) {
  return (
    <TouchableOpacity
      onPress={onClick}
      className="p-1 rounded-full"
      accessibilityLabel="リアクションを追加"
    >
      <Feather name="smile" size={16} color="#6b7280" />
    </TouchableOpacity>
  );
}
