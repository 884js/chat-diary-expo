-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  recipient_id Text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ルーム設定テーブル
CREATE TABLE IF NOT EXISTS public.room_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ルームテーブル
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ルームメッセージテーブル
CREATE TABLE IF NOT EXISTS public.room_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- 送信者ID
  sender TEXT CHECK (sender IN ('user', 'ai')),
  content TEXT,
  image_path TEXT DEFAULT '',
  emotion TEXT CHECK (
    emotion IS NULL OR
    emotion IN ('normal', 'happy', 'sad', 'angry', 'confused')
  ),
  reply_to_message_id UUID REFERENCES public.room_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (blocked_by_user_id, blocked_user_id)
);

-- カレンダーテーブル
CREATE TABLE IF NOT EXISTS public.calendar_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- 誰のカレンダーか
  date DATE NOT NULL, -- 対象日
  has_posts BOOLEAN DEFAULT FALSE, -- その日に投稿があったか
  ai_generated_highlights JSONB DEFAULT NULL,
  summary_status TEXT DEFAULT 'none' CHECK (summary_status IN ('none', 'manual', 'auto')), -- 要約ステータス
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (owner_id, date) -- 同じユーザーの同じ日に複数レコード作らせない
);

-- スタンプテーブル
CREATE TABLE IF NOT EXISTS public.stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE, -- NULL = グローバル
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  slug TEXT NOT NULL,
  image_path TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_stamp_per_scope UNIQUE (room_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_stamps_room_id ON public.stamps(room_id);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_room_messages_owner_id_created_at
ON public.room_messages(owner_id, created_at);

-- auth.usersが作成されたとき、自動的にpublic.usersも作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url, recipient_id, created_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.email),
    -- _normalを削除して高解像度のプロフィール画像URLに変換
    REPLACE(COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''), '_normal', ''),
    NEW.raw_user_meta_data->>'sub',
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- public.usersレコード作成時にroom_settingsも自動的に作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_profile() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.room_settings (user_id, created_at)
  VALUES (
    NEW.id, 
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成または置換
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_profile();

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- usersテーブルのupdated_atを自動更新
DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- room_settingsテーブルのupdated_atを自動更新
DROP TRIGGER IF EXISTS room_settings_updated_at ON public.room_settings;
CREATE TRIGGER room_settings_updated_at
  BEFORE UPDATE ON public.room_settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- roomsテーブルのupdated_atを自動更新
DROP TRIGGER IF EXISTS rooms_updated_at ON public.rooms;
CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- RLSの設定
-- チャットルームのRLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "自分のチャットルームのみ読み取れる"
  ON public.rooms FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "自分のチャットルームのみ作成できる"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "自分のチャットルームのみ更新できる"
  ON public.rooms FOR UPDATE
  USING (auth.uid() = user_id);

-- usersテーブルのRLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ログインユーザーのみユーザー情報を閲覧できる"
  ON public.users FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "自分のユーザー情報のみ更新できる"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- room_settingsテーブルのRLS
ALTER TABLE public.room_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "自分のルーム設定のみ閲覧できる"
  ON public.room_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "自分のルーム設定のみ更新できる"
  ON public.room_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- room_messagesテーブルのRLS
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "自分のメッセージのみ読み取れる"
  ON public.room_messages FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "ログインユーザーのみメッセージを作成できる"
  ON public.room_messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

create policy "自分のメッセージのみ更新できる"
  on public.room_messages for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

CREATE POLICY "自分のメッセージだけ削除できる"
  ON public.room_messages
  FOR DELETE
  USING (auth.uid() = owner_id);

-- user_blocksテーブルのRLS
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "自分のブロックリストのみ閲覧できる"
  ON public.user_blocks FOR SELECT
  USING (auth.uid() = blocked_by_user_id);

CREATE POLICY "自分のブロックリストのみ更新できる"
  ON public.user_blocks FOR UPDATE
  USING (auth.uid() = blocked_by_user_id);

CREATE POLICY "ログインユーザーのみブロックリストを作成できる"
  ON public.user_blocks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "自分のブロックリストのみ削除できる"
  ON public.user_blocks
  FOR DELETE
  USING (auth.uid() = blocked_by_user_id);


-- calendar_daysテーブルのRLS
ALTER TABLE public.calendar_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "自分のカレンダーのみ閲覧できる"
  ON public.calendar_days FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "自分のカレンダーのみ更新できる"
  ON public.calendar_days FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "ログインユーザーのみカレンダーを作成できる"
  ON public.calendar_days FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- stampsテーブルのRLS
ALTER TABLE public.stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "誰でもスタンプを閲覧できる"
  ON public.stamps FOR SELECT
  USING (true);

CREATE POLICY "ログインユーザーのみスタンプを作成できる"
  ON public.stamps FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "自分のスタンプのみ更新できる"
  ON public.stamps FOR UPDATE
  USING (auth.uid() = created_by_user_id);

CREATE POLICY "自分のスタンプのみ削除できる"
  ON public.stamps
  FOR DELETE
  USING (auth.uid() = created_by_user_id);


