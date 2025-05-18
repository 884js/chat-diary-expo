CREATE FUNCTION get_room_messages_by_date_range(params json)
RETURNS TABLE (
  id uuid,
  owner_id uuid,
  sender text,
  content text,
  image_path text,
  reply_to_message_id uuid,
  emotion text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
AS $$
  SELECT
    rm.id,
    rm.owner_id,
    rm.sender,
    rm.content,
    rm.image_path,
    rm.reply_to_message_id,
    rm.emotion,
    rm.created_at,
    rm.updated_at
  FROM public.room_messages rm
  WHERE
    rm.owner_id = (params->>'user_id')::uuid
    AND rm.created_at >= (params->>'start_at')::timestamptz
    AND rm.created_at <= (params->>'end_at')::timestamptz
  ORDER BY rm.created_at ASC;
$$;