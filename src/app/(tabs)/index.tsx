import { SafeAreaView } from '@/components/SafeAreaView';
import { MessageContextMenu } from '@/features/chat/components/ChatMessage/MessageContextMenu';
import { ChatScreen } from '@/features/chat/screens/ChatScreen';

export default function Home() {
  return (
    <SafeAreaView>
      <ChatScreen />
      <MessageContextMenu />
    </SafeAreaView>
  );
}
