import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../databaseTypes';

type Stamp = Database['public']['Tables']['stamps']['Row'];

type CreateStamp = Database['public']['Tables']['stamps']['Insert'];

export class StampApi {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getStamps({ room_id }: { room_id?: string }) {
    const query = this.supabase.from('stamps').select('*');

    if (room_id) {
      query.eq('room_id', room_id);
    }

    query.or('room_id.is.null');

    const { data, error } = await query;

    if (error) {
      console.error('Stamp fetch error:', error);
      throw error;
    }

    return data;
  }

  async createStamp(stamp: CreateStamp) {
    const { data, error } = await this.supabase
      .from('stamps')
      .insert(stamp)
      .select()
      .single();

    if (error) {
      console.error('Stamp create error:', error);
      throw error;
    }

    return data;
  }
}
