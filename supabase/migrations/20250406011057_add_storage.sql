insert into storage.buckets (id, name, public)
values ('users', 'users', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('chats', 'chats', false)
on conflict (id) do nothing;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 公開読み取り
CREATE POLICY "Public can read objects"
ON storage.objects
FOR SELECT
USING (true);

-- chatsバケットのポリシー

-- SELECT: チャットルーム参加者のみ閲覧可能
CREATE POLICY "Anyone can read images with a valid message"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chats'
  AND EXISTS (
    SELECT 1
    FROM public.room_messages rm
    WHERE rm.image_path = storage.filename(name)
  )
);

-- INSERT: ルームのトークンが存在する場合のみアップロード可能
CREATE POLICY "Users can upload to their own chat folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chats'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: 必要なら適宜調整（例としてtokenが存在するなら誰でも削除可能）
CREATE POLICY "Users can delete their own uploaded images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chats'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- usersバケットのポリシー

-- 認証済ユーザーが自分のフォルダにのみアップロード可能
CREATE POLICY "Authenticated users can upload their own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'users'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ファイルのオーナーだけがアップデート可能
CREATE POLICY "Only file owner can update"
ON storage.objects
FOR UPDATE
USING (
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'users'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ファイルのオーナーだけが削除可能
CREATE POLICY "Only file owner can delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'users'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- INSERT 全許可
create policy "Service role can insert into any bucket"
on storage.objects
for insert
to service_role
with check (true);

-- UPDATE 全許可
create policy "Service role can update any bucket"
on storage.objects
for update
to service_role
using (true)
with check (true);

-- DELETE 全許可
create policy "Service role can delete from any bucket"
on storage.objects
for delete
to service_role
using (true);