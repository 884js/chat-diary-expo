import { useState } from 'react';

// 感情アイコンの定義
export type EmotionIconName =
  | 'emoticon-outline'
  | 'emoticon-happy-outline'
  | 'emoticon-sad-outline'
  | 'emoticon-angry-outline'
  | 'emoticon-confused-outline';

export type Emotion = {
  slug: 'normal' | 'happy' | 'sad' | 'angry' | 'confused' | undefined;
  name: string;
  icon: EmotionIconName;
  color: string;
};

export const emotions: Emotion[] = [
  { slug: 'normal', name: '普通', icon: 'emoticon-outline', color: '#60a5fa' },
  {
    slug: 'happy',
    name: '嬉しい',
    icon: 'emoticon-happy-outline',
    color: '#34d399',
  },
  {
    slug: 'sad',
    name: '悲しい',
    icon: 'emoticon-sad-outline',
    color: '#a78bfa',
  },
  {
    slug: 'angry',
    name: '怒り',
    icon: 'emoticon-angry-outline',
    color: '#f87171',
  },
  {
    slug: 'confused',
    name: '微妙',
    icon: 'emoticon-confused-outline',
    color: '#fbbf24',
  },
];

type Props = {
  initialEmotion?: Emotion['slug'];
};

export const useChatInputEmotion = ({ initialEmotion }: Props) => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(
    initialEmotion ? emotions.find((e) => e.slug === initialEmotion) ?? null : null,
  );

  const handleSelectEmotion = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
  };

  const handleClearEmotion = () => {
    setSelectedEmotion(null);
  };

  return { emotions, selectedEmotion, handleSelectEmotion, handleClearEmotion };
};
