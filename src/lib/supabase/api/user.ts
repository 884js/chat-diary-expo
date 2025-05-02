import type { SupabaseClient } from '@supabase/supabase-js';
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
}
