-- 返信専用テーブルの作成
-- 作成日: 2025-01-07

-- 1. 返信専用テーブルを作成（room_messagesと同じ構造）
CREATE TABLE IF NOT EXISTS public.room_message_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_message_id UUID NOT NULL REFERENCES public.room_messages(id) ON DELETE CASCADE, -- 親メッセージ
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- 返信者ID
  sender TEXT CHECK (sender IN ('user', 'ai')),
  content TEXT,
  image_path TEXT DEFAULT '',
  emotion TEXT CHECK (
    emotion IS NULL OR
    emotion IN ('normal', 'happy', 'sad', 'angry', 'confused')
  ),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. パフォーマンス最適化のためのインデックスを作成
CREATE INDEX IF NOT EXISTS idx_room_message_replies_room_message_id 
ON public.room_message_replies(room_message_id);

CREATE INDEX IF NOT EXISTS idx_room_message_replies_owner_id 
ON public.room_message_replies(owner_id);

CREATE INDEX IF NOT EXISTS idx_room_message_replies_created_at 
ON public.room_message_replies(created_at);

-- 3. updated_atを自動更新するトリガーを追加
DROP TRIGGER IF EXISTS room_message_replies_updated_at ON public.room_message_replies;
CREATE TRIGGER room_message_replies_updated_at
  BEFORE UPDATE ON public.room_message_replies
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 4. RLSポリシーを設定
ALTER TABLE public.room_message_replies ENABLE ROW LEVEL SECURITY;

-- 返信の閲覧権限（ルームの所有者のみ）
CREATE POLICY "Users can view replies in their rooms" ON public.room_message_replies
FOR SELECT USING (
  owner_id = auth.uid()
);

-- 返信の作成権限（ルームの所有者のみ）
CREATE POLICY "Users can create replies to their own messages" ON public.room_message_replies
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.room_messages rm
    WHERE rm.id = room_message_replies.room_message_id
    AND rm.owner_id = auth.uid()
  )
);

-- 返信の更新権限（自分が作成した返信のみ）
CREATE POLICY "Users can update their own replies" ON public.room_message_replies
FOR UPDATE USING (owner_id = auth.uid());

-- 返信の削除権限（自分が作成した返信のみ）
CREATE POLICY "Users can delete their own replies" ON public.room_message_replies
FOR DELETE USING (owner_id = auth.uid()); 