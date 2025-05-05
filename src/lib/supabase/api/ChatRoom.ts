import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../databaseTypes';
import type { ChatRoomMessage } from './ChatRoomMessage';

export type ChatRoom = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  owner: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
};

export type ChatRoomWithMessages = ChatRoom & {
  chat_room_messages: ChatRoomMessage[];
};

export class ChatRoomApi {
  constructor(private supabase: SupabaseClient<Database>) {}

  async createChatRoom({ userId }: { userId: string }) {
    try {
      const { data: chatRoomData, error: chatRoomError } = await this.supabase
        .from('rooms')
        .insert({
          user_id: userId,
        })
        .select()
        .single();

      if (chatRoomError) {
        console.error('Chat room creation error:', chatRoomError);
        throw chatRoomError;
      }

      return chatRoomData;
    } catch (error) {
      console.error('Error in createChatRoom:', error);
      throw error;
    }
  }

  async getChatRoomMessages({ userId }: { userId: string }) {
    // メッセージを古い順に取得
    const { data: messages, error: messagesError } = await this.supabase
      .from('room_messages')
      .select(
        'id, owner_id, content, sender, created_at, image_path, reply_to:reply_to_message_id (id, content, sender)',
      )
      .eq('owner_id', userId)
      .order('created_at', { ascending: true })
      .overrideTypes<Array<ChatRoomMessage>, { merge: false }>();

    if (messagesError) {
      console.error('Message fetch error:', messagesError);
      throw messagesError;
    }

    return messages;
  }

  // IDでチャットルームのデータを取得
  async getChatRoomById({ id }: { id: string }) {
    const { data: chatRoom, error: roomError } = await this.supabase
      .from('rooms')
      .select('*, owner:users(*)')
      .eq('id', id)
      .maybeSingle()
      .overrideTypes<ChatRoom, { merge: false }>();

    if (roomError || !chatRoom) {
      console.error('Chat room fetch error:', roomError);
      throw roomError;
    }

    return chatRoom;
  }

  // ユーザーのデフォルトチャットルームを取得
  async getDefaultChatRoom(userId: string) {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Default chat room fetch error:', error);
      throw error;
    }

    return data;
  }
}
