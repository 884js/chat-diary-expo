import { View } from '@/components/Themed';
import { MessageContextMenu } from '@/features/chat/components/ChatMessage/MessageContextMenu';
import { ChatScreen } from '@/features/chat/screens/ChatScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const insets = useSafeAreaInsets();
  const top = typeof insets.top === 'number' ? insets.top : 0;
  const left = typeof insets.left === 'number' ? insets.left : 0;
  const right = typeof insets.right === 'number' ? insets.right : 0;

  return (
    <View
      style={{
        flex: 1,
        paddingTop: top,
        paddingLeft: left,
        paddingRight: right,
      }}
    >
      <ChatScreen />
      <MessageContextMenu />
    </View>
  );
}
