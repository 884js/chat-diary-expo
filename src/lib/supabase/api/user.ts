import type { SupabaseClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';
import type { Database } from '../databaseTypes';

export interface QuestionItem {
  id: string;
  question_label: string;
  input_type: 'text' | 'select';
  is_required: boolean;
  options: string[];
  display_order: number;
}

interface RoomSettings {
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export type GetUserResponse = Database['public']['Tables']['users']['Row'] & {
  room_settings: RoomSettings;
};

export class UserApi {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getCurrentUser() {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      return null;
    }
    const currentUser = await this.getUser(data.user.id);
    return currentUser;
  }

  async getUser(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*, room_settings(*)')
      .eq('id', id)
      .maybeSingle()
      .overrideTypes<GetUserResponse>();

    if (error) {
      throw error;
    }

    return data;
  }

  async getUserProfile({ userId }: { userId: string }) {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, display_name, avatar_url, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('User profile fetch error:', error);
      throw error;
    }

    return data;
  }

  async getChatSettings(userId: string) {
    const { data, error } = await this.supabase
      .from('room_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      .overrideTypes<RoomSettings>();

    if (error) {
      console.error('Chat settings fetch error:', error);
      throw error;
    }

    return data;
  }

  async updateUserProfile({
    userId,
    displayName,
    avatarUrl,
  }: {
    userId: string;
    displayName?: string;
    avatarUrl?: string;
  }) {
    const updates: Partial<Database['public']['Tables']['users']['Update']> =
      {};

    if (displayName !== undefined) {
      updates.display_name = displayName;
    }

    if (avatarUrl !== undefined) {
      updates.avatar_url = avatarUrl;
    }

    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('User profile update error:', error);
      throw error;
    }

    return data;
  }

  async uploadAvatar({
    userId,
    file,
  }: {
    userId: string;
    file: { uri: string; type?: string };
  }) {
    try {
      const fileUri = file.uri;
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const arrayBuffer = base64ToArrayBuffer(base64);
      const fileExt = 'jpg';
      const fileName = `avatar-${Date.now()}`;
      const filePath = `${userId}/${fileName}.${fileExt}`;

      const contentType = file.type || 'image/jpeg';

      // ファイルをアップロード
      const { error } = await this.supabase.storage
        .from('users')
        .upload(filePath, arrayBuffer, {
          upsert: true,
          contentType,
        });

      if (error) {
        console.error('アバターアップロードエラー:', error);
        throw error;
      }

      const { data: urlData } = this.supabase.storage
        .from('users')
        .getPublicUrl(filePath);

      return {
        path: filePath,
        publicUrl: urlData?.publicUrl || null,
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
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
