import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

type Props = {
  imagePath: string | null;
  storageName: 'users' | 'chats';
  onSuccess?: () => void;
};

export const useStorageImage = ({
  imagePath,
  storageName,
  onSuccess,
}: Props) => {
  const { supabase } = useSupabase();

  const { data: imageUrl, refetch } = useQuery({
    queryKey: ['storageImage', storageName, imagePath],
    queryFn: async () => {
      if (!imagePath) return null;
      const { data } = await supabase.storage
        .from(storageName)
        .createSignedUrl(imagePath, 60 * 10);
      return data?.signedUrl || null;
    },
    enabled: !!imagePath,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (imageUrl && onSuccess) {
      onSuccess();
    }
  }, [imageUrl, onSuccess]);

  return { imageUrl, refetch };
};
