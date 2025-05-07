import { formatDate } from '@/lib/date-fns';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '../databaseTypes';

export class CalendarApi {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * カレンダー用に、その月の投稿日情報を取得
   */
  async getCalendarDays(userId: string, startAt: string, endAt: string) {
    const { data, error } = await this.supabase
      .from('calendar_days')
      .select('*')
      .eq('owner_id', userId)
      .eq('has_posts', true)
      .gte('date', startAt)
      .lte('date', endAt)
      .order('date', { ascending: true });

    if (error) {
      console.error('Calendar days fetch error:', error);
      throw error;
    }

    return data;
  }

  async updateCalendarSummary(userId: string, dateKey: string, json: Json) {
    const { error } = await this.supabase
      .from('calendar_days')
      .update({
        ai_generated_highlights: json,
        summary_status: 'manual',
        updated_at: new Date().toISOString(),
      })
      .eq('owner_id', userId)
      .eq('date', dateKey);

    if (error) {
      console.error('Calendar days update error:', error);
      throw error;
    }

    return { success: true };
  }

  /**
   * 指定した日付の投稿一覧を取得
   */
  async getMessagesByDate(userId: string, date: string) {
    const { data, error } = await this.supabase.rpc(
      'get_room_messages_by_date_range',
      {
        params: {
          user_id: userId,
          start_at: `${date}T00:00:00.000Z`,
          end_at: `${date}T23:59:59.999Z`,
        },
      },
    );

    if (error) {
      console.error('Room messages fetch error:', error);
      throw error;
    }

    return data;
  }

  async upsertCalendarDay(
    userId: string,
    createdAt: string, // 例: '2025-04-27T14:00:00.000Z'
  ) {
    const dateOnly = formatDate(createdAt, 'yyyy-MM-dd');

    // calendar_daysを探す
    const { data, error } = await this.supabase
      .from('calendar_days')
      .select('id, has_posts')
      .eq('owner_id', userId)
      .eq('date', dateOnly)
      .maybeSingle();

    if (error) {
      console.error('calendar_days fetch error:', error);
      throw error;
    }

    if (!data) {
      // レコードがなければ作成
      const { error: insertError } = await this.supabase
        .from('calendar_days')
        .insert({
          owner_id: userId,
          date: dateOnly,
          has_posts: true,
        });

      if (insertError) {
        console.error('calendar_days insert error:', insertError);
        throw insertError;
      }
    } else if (data.has_posts === false) {
      // レコードがあるがhas_postsがfalseならtrueに更新
      const { error: updateError } = await this.supabase
        .from('calendar_days')
        .update({ has_posts: true })
        .eq('id', data.id);

      if (updateError) {
        console.error('calendar_days update error:', updateError);
        throw updateError;
      }
    }
  }
}
