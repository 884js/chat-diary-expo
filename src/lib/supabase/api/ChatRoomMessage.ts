import type { Emotion } from '@/features/chat/hooks/useChatInputEmotion';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';
import type { Database } from '../databaseTypes';
import { CalendarApi } from './calendar';

export type ChatRoomMessage = {
  id: string;
  owner_id: string;
  sender: 'user' | 'ai';
  content: string;
  image_path: string | null;
  emotion: string | null;
  reply_to_message_id: string | null;
  created_at: string;
  updated_at: string;
  reply_to: ChatRoomMessage | null;
};

export class ChatRoomMessageApi {
  private calendarApi: CalendarApi;
  constructor(private supabase: SupabaseClient<Database>) {
    this.calendarApi = new CalendarApi(supabase);
  }

  async getRoomMessagesByDateRange({
    userId,
    startAt,
    endAt,
  }: {
    userId: string;
    startAt: string;
    endAt: string;
  }) {
    const { data, error } = await this.supabase
      .rpc('get_room_messages_by_date_range', {
        params: {
          user_id: userId,
          start_at: startAt,
          end_at: endAt,
        },
      })
      .overrideTypes<Array<ChatRoomMessage>, { merge: false }>();

    if (error) {
      console.error('Chat room fetch error:', error);
      throw error;
    }

    return data;
  }

  // チャットルームの全メッセージを取得（タイムスタンプで昇順ソート）
  async getMessages({ chatRoomId }: { chatRoomId: string }) {
    const { data, error } = await this.supabase
      .from('room_messages')
      .select('*')
      .eq('room_id', chatRoomId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Messages fetch error:', error);
      throw error;
    }

    return data;
  }

  async getMessageDetail({ messageId }: { messageId: string }) {
    const { data, error } = await this.supabase
      .from('room_messages')
      .select('*')
      .eq('id', messageId)
      .maybeSingle();

    if (error || !data) {
      console.error('Message detail fetch error:', error);
      throw error;
    }

    return data;
  }

  // トークン付きでメッセージを送信
  async sendMessage({
    content,
    sender,
    senderId,
    imagePath = null,
    emotion,
  }: {
    content: string;
    sender: 'user' | 'ai';
    senderId: string;
    imagePath?: string | null;
    emotion?: Emotion['slug'];
  }) {
    const { data, error } = await this.supabase
      .from('room_messages')
      .insert({
        content,
        sender,
        owner_id: senderId,
        image_path: imagePath,
        emotion,
      })
      .select('*')
      .single();

    if (error || !data || !data.created_at) {
      console.error('Message send error:', error);
      throw error;
    }

    // カレンダーの要約を更新
    await this.calendarApi.upsertCalendarDay(senderId, data.created_at);

    return data;
  }

  // 画像をアップロードしてURLを取得
  async uploadChatImage({
    file,
    userId,
  }: {
    file: { uri: string; type?: string; name?: string };
    userId: string;
  }) {
    try {
      const fileUri = file.uri;
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const arrayBuffer = base64ToArrayBuffer(base64);
      const fileExt = fileUri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const filePath = `/${userId}/${fileName}.${fileExt}`;

      const contentType = file.type || 'image/jpeg';

      // ファイルをアップロード
      const { data, error } = await this.supabase.storage
        .from('chats')
        .upload(filePath, arrayBuffer, {
          upsert: true,
          contentType,
        });

      if (error) {
        console.error('画像アップロードエラー:', error);
        throw error;
      }

      const { data: urlData } = this.supabase.storage
        .from('chats')
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData?.publicUrl || null,
      };
    } catch (error) {
      console.error('Error uploading chat image:', error);
      throw error;
    }
  }

  async deleteMessage({ messageId }: { messageId: string }) {
    const { error } = await this.supabase
      .from('room_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Message delete error:', error);
      throw error;
    }

    return {
      success: true,
    };
  }

  async editMessage({
    messageId,
    content,
    emotion,
  }: { messageId: string; content: string; emotion: Emotion['slug'] }) {
    const { error } = await this.supabase
      .from('room_messages')
      .update({ content, emotion })
      .eq('id', messageId);

    if (error) {
      console.error('Message edit error:', error);
      throw error;
    }

    return {
      success: true,
    };
  }

  async replyMessage({
    parentMessageId,
    content,
    senderId,
    emotion,
  }: {
    parentMessageId: string;
    content: string;
    senderId: string;
    emotion: Emotion['slug'];
  }) {
    const { error } = await this.supabase.from('room_messages').insert({
      content,
      sender: 'user',
      owner_id: senderId,
      reply_to_message_id: parentMessageId,
      emotion,
    });

    if (error) {
      console.error('Message reply error:', error);
      throw error;
    }

    return {
      success: true,
    };
  }
}

const base64ToArrayBuffer = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};
