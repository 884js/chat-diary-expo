import { SupabaseApi } from '@/lib/supabase/api';
import { supabase } from '@/lib/supabase/client';

export const useSupabase = () => {
  const api = new SupabaseApi(supabase);
  return { api, supabase };
};
