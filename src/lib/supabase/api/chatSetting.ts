import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../databaseTypes';

export class ChatSettingApi {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getChatSettings(userId: string) {
    const { data, error } = await this.supabase
      .from('room_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Chat setting fetch error:', error);
      throw error;
    }

    return data;
  }
}
