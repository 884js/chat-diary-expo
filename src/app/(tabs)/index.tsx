import { MessageActionProvider } from '@/features/chat/contexts/MessageActionContext';
import { ChatScreen } from '@/features/chat/screens/ChatScreen';

export default function Home() {
  return (
    <MessageActionProvider>
      <ChatScreen />
    </MessageActionProvider>
  );
}
