import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import type { Emotion } from './useChatInputEmotion';
import { emotions } from './useChatInputEmotion';

// 日付ごとの主要感情の型
export type DailyEmotion = {
  date: string;
  primaryEmotion?: Emotion['slug'];
};

type Props = {
  userId: string;
  month: number;
  year: number;
};

// メッセージ型の簡易定義
type MessageData = {
  created_at: string;
  emotion?: Emotion['slug'] | null;
};

export const useDailyEmotions = ({ userId, month, year }: Props) => {
  const { api } = useSupabase();

  // 月初と月末の日付を取得
  const getMonthRange = () => {
    // 月初日
    const startOfMonth = new Date(year, month - 1, 1);
    // 翌月の0日目 = 月末日
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    return {
      start: startOfMonth.toISOString(),
      end: endOfMonth.toISOString(),
    };
  };

  const dateRange = getMonthRange();

  const { data, isLoading } = useQuery({
    queryKey: ['dailyEmotions', userId, month, year],
    queryFn: async () => {
      if (!userId) return [];

      // メッセージデータの取得（APIを使用）
      const messages = await api.chatRoomMessage.getRoomMessagesByDateRange({
        userId,
        startAt: dateRange.start,
        endAt: dateRange.end,
      });

      if (!messages || !Array.isArray(messages)) {
        return [];
      }

      // 日付ごとにメッセージをグループ化
      const messagesByDate: Record<string, MessageData[]> = {};

      for (const message of messages) {
        if (typeof message.created_at !== 'string') continue;

        const messageDate = format(new Date(message.created_at), 'yyyy-MM-dd');

        if (!messagesByDate[messageDate]) {
          messagesByDate[messageDate] = [];
        }

        messagesByDate[messageDate].push(message);
      }

      // 各日付の主要感情を計算
      const dailyEmotions: DailyEmotion[] = [];

      for (const date of Object.keys(messagesByDate)) {
        const messages = messagesByDate[date];
        const emotionCounts: Record<string, number> = {};

        // 有効な感情スラッグの初期化
        for (const emotion of emotions) {
          if (emotion.slug) {
            emotionCounts[emotion.slug] = 0;
          }
        }

        // メッセージごとの感情をカウント
        for (const message of messages) {
          if (message.emotion) {
            emotionCounts[message.emotion] =
              (emotionCounts[message.emotion] || 0) + 1;
          }
        }
        // normalは除外して、他の感情で最も多いものを探す
        const normalCount = emotionCounts.normal || 0;
        let maxCount = 0;
        let primaryEmotion: Emotion['slug'] | undefined = undefined;

        for (const [emotion, count] of Object.entries(emotionCounts)) {
          // normalは最優先ではなく、最後の選択肢として扱う
          if (emotion !== 'normal' && count > maxCount) {
            maxCount = count;
            primaryEmotion = emotion as Emotion['slug'];
          }
        }

        // 他の感情が1つもない場合のみnormalを使用
        if (!primaryEmotion && normalCount > 0) {
          primaryEmotion = 'normal';
        }

        // メッセージはあるが感情がない場合はnormalをデフォルトに
        if (!primaryEmotion && messages.length > 0) {
          primaryEmotion = 'normal';
        }

        dailyEmotions.push({
          date,
          primaryEmotion,
        });
      }
      return dailyEmotions;
    },
    enabled: !!userId,
  });

  // 日付ごとのデータをマッピング
  const dailyEmotionsMap: Record<string, DailyEmotion> = {};
  if (data) {
    for (const emotion of data) {
      dailyEmotionsMap[emotion.date] = emotion;
    }
  }

  return {
    dailyEmotions: data || [],
    dailyEmotionsMap,
    isLoading,
  };
};