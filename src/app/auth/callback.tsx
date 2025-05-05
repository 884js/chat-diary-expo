import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('OAuth リダイレクト処理中にエラー:', error.message);
        return;
      }

      router.replace('/(tabs)');
    };

    handleAuthRedirect();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
