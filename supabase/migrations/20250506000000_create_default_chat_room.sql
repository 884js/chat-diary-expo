-- ユーザーが作成された時に、自動的にデフォルトのチャットルームを作成するトリガー関数
CREATE OR REPLACE FUNCTION public.handle_create_default_room()
RETURNS TRIGGER AS $$
BEGIN
  -- デフォルトのチャットルームを作成
  INSERT INTO public.rooms (
    user_id
  ) VALUES (
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
DROP TRIGGER IF EXISTS on_user_create_default_room ON public.users;
CREATE TRIGGER on_user_create_default_room
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_create_default_room();
