import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useSupabase } from '@/hooks/useSupabase';
import { aiClient } from '@/lib/ai/aiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Emotion } from './useChatInputEmotion';

export const useSendMessageWithAI = () => {
  const { api } = useSupabase();
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const {
    mutateAsync: sendMessage,
    isPending,
    variables,
  } = useMutation({
    mutationFn: async ({
      content,
      imagePath,
      emotion: providedEmotion,
    }: {
      content: string;
      imagePath?: string;
      emotion?: Emotion['slug'];
    }) => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      let finalEmotion = providedEmotion;
      
      // 感情が提供されていない場合はAIで自動判定
      if (!providedEmotion) {
        try {
          const emotionResult = await aiClient.analyzeEmotion(content);
          finalEmotion = emotionResult.emotion;
        } catch (error) {
          console.warn('AI emotion analysis failed, using default:', error);
          finalEmotion = 'normal';
        }
      }

      // ユーザーメッセージを送信
      const userMessage = await api.chatRoomMessage.sendMessage({
        content,
        sender: 'user',
        senderId: currentUser.id,
        imagePath,
        emotion: finalEmotion,
      });

      return userMessage;
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ['messages', currentUser?.id],
      }),
  });

  return {
    sendMessage,
    isPending,
    variables,
  };
};