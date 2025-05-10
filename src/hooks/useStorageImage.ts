import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';

type Props = {
  imagePath: string | null;
  storageName: 'users' | 'chats';
};

export const useStorageImage = ({ imagePath, storageName }: Props) => {
  const { supabase } = useSupabase();

  const {
    data: imageUrl,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['storageImage', storageName, imagePath],
    queryFn: async () => {
      if (!imagePath) return null;

      const { data } = supabase.storage
        .from(storageName)
        .getPublicUrl(imagePath);
      return data?.publicUrl || null;
    },
    enabled: !!imagePath,
  });

  return {
    imageUrl,
    refetch,
    isLoading,
  };
};
