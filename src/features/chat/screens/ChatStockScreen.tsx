import { Loader } from "@/components/Loader";
import { View } from "@/components/Themed";
import { useCurrentUser } from "@/features/user/hooks/useCurrentUser";
import { useCurrentUserRoom } from "@/features/user/hooks/useCurrentUserRoom";
import { MessageContextStockMenu } from "../components/ChatMessage/MessageContextStockMenu";
import { useChatRoomMessageStocks } from "../hooks/useChatRoomMessageStocks";
import { ChatMessageStockList } from "../components/ChatMessageStockList";

export const ChatStockScreen = () => {
  const { currentUser } = useCurrentUser();

  const { chatRoom } = useCurrentUserRoom({
    userId: currentUser?.id ?? "",
  });
  const { messagesWithDividers } = useChatRoomMessageStocks();

  if (!chatRoom) {
    return <Loader />;
  }

  return (
    <View className="flex-1 bg-gray-100">
      <ChatMessageStockList
        chatRoom={chatRoom}
        messages={messagesWithDividers}
      />
      <MessageContextStockMenu />
    </View>
  );
};
