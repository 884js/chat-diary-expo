import { Text, View } from "@/components/Themed";
import { useCurrentUser } from "@/features/user/hooks/useCurrentUser";
import { useCurrentUserRoom } from "@/features/user/hooks/useCurrentUserRoom";
import { useSupabase } from "@/hooks/useSupabase";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ChatHeader } from "../components/ChatHeader";
import { ChatInput } from "../components/ChatInput";
import { ChatMessages } from "../components/ChatMessages";
import { useMessageAction } from "../contexts/MessageActionContext";

export const ChatScreen = () => {
  const { api } = useSupabase();
  const { chatRoom, isLoadingRoom, refetchRoom } = useCurrentUserRoom();
  const { currentUser } = useCurrentUser();
  const isOwner = currentUser ? currentUser.id === chatRoom?.user_id : false;
  const { mode, handleSaveEdit, handleSendReplyMessage } = useMessageAction();

  if (isLoadingRoom) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

  if (!chatRoom) {
    return <Text>チャットルームが見つかりません</Text>;
  }

  // メッセージ送信処理
  const handleSendMessage = async ({
    imagePath,
    message,
  }: {
    imagePath: string | undefined;
    message: string;
  }) => {
    if (!chatRoom?.id || !currentUser?.id) return;

    const trimmedMessage = message.trim();

    const senderType = isOwner ? "user" : "ai";

    if (mode === "edit") {
      await handleSaveEdit({ message: trimmedMessage });
      refetchRoom();
      return;
    }

    if (mode === "reply") {
      await handleSendReplyMessage({ message: trimmedMessage });
      refetchRoom();
      return;
    }

    try {
      await api.chatRoomMessage.sendMessage({
        content: trimmedMessage,
        sender: senderType,
        imagePath: imagePath,
        senderId: currentUser.id,
      });
      refetchRoom();
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={60}
    >
      <View className="flex-1">
        <ChatHeader />
        <ChatMessages
          chatRoom={chatRoom}
          isLoading={false}
          messages={chatRoom.chat_room_messages}
          isChatEnded={false}
          isOwner={true}
        />
        <ChatInput onSend={handleSendMessage} isDisabled={false} />
      </View>
    </KeyboardAvoidingView>
  );
};
