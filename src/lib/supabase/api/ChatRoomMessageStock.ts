import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../databaseTypes';
import type { ChatRoomMessage } from './ChatRoomMessage';

export type ChatRoomMessageStock = {
  id: string;
  user_id: string;
  message_id: string;
  created_at: string;
  message: ChatRoomMessage | null;
};

export class ChatRoomMessageStockApi {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getMessageStocks({ userId }: { userId: string }) {
    const { data, error } = await this.supabase
      .from('room_message_stocks')
      .select(
        '*, message:room_messages (id, content, created_at, sender, room_id, owner_id, image_path, emotion, replies:room_message_replies (id, content, created_at, sender, room_message_id, owner_id, image_path, emotion))',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .overrideTypes<ChatRoomMessageStock[]>();

    if (error) {
      console.error('Messages fetch error:', error);
      throw error;
    }

    return data;
  }

  async createMessageStock({
    userId,
    messageId,
  }: { userId: string; messageId: string }) {
    const { data, error } = await this.supabase
      .from('room_message_stocks')
      .insert({ user_id: userId, message_id: messageId })
      .select()
      .single();

    if (error) {
      console.error('Message stock create error:', error);
      throw error;
    }

    return data;
  }

  async deleteMessageStock({
    userId,
    messageId,
  }: { userId: string; messageId: string }) {
    const { error } = await this.supabase
      .from('room_message_stocks')
      .delete()
      .eq('user_id', userId)
      .eq('message_id', messageId);

    if (error) {
      console.error('Message stock delete error:', error);
      throw error;
    }

    return true;
  }
}
