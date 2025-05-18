import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../databaseTypes';
import { ChatRoomApi } from './ChatRoom';
import { ChatRoomMessageApi } from './ChatRoomMessage';
import { CalendarApi } from './calendar';
import { ChatSettingApi } from './chatSetting';
import { UserApi } from './user';
import { ChatRoomMessageStockApi } from './ChatRoomMessageStock';

export class SupabaseApi {
  private readonly supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
    this.user = new UserApi(this.supabase);
    this.chatSetting = new ChatSettingApi(this.supabase);
    this.chatRoom = new ChatRoomApi(this.supabase);
    this.calendar = new CalendarApi(this.supabase);
    this.chatRoomMessage = new ChatRoomMessageApi(this.supabase);
    this.chatRoomMessageStock = new ChatRoomMessageStockApi(this.supabase);
  }

  public readonly user: UserApi;
  public readonly chatSetting: ChatSettingApi;
  public readonly chatRoom: ChatRoomApi;
  public readonly calendar: CalendarApi;
  public readonly chatRoomMessage: ChatRoomMessageApi;
  public readonly chatRoomMessageStock: ChatRoomMessageStockApi;
}
