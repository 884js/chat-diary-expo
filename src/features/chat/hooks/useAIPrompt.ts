import { aiClient } from '@/lib/ai/aiClient';
import { useQuery } from '@tanstack/react-query';

export function useAIPrompt(enabled: boolean = true) {
  const getCurrentTimeType = (): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const { data: prompt, isLoading, refetch } = useQuery({
    queryKey: ['ai-prompt', getCurrentTimeType()],
    queryFn: async () => {
      const timeType = getCurrentTimeType();
      return aiClient.generatePrompt(timeType);
    },
    enabled,
    staleTime: 1000 * 60 * 30, // 30分間キャッシュ
  });

  const generateCustomPrompt = async (type: 'morning' | 'afternoon' | 'evening' | 'emotion-based', emotion?: string) => {
    return aiClient.generatePrompt(type, emotion);
  };

  return {
    prompt,
    isLoading,
    refetch,
    generateCustomPrompt,
    currentTimeType: getCurrentTimeType(),
  };
}