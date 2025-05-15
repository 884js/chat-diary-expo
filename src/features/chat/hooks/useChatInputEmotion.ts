import { useState } from 'react';

// 感情アイコンの定義
type EmotionIconName =
  | 'emoticon-outline'
  | 'emoticon-happy-outline'
  | 'emoticon-sad-outline'
  | 'emoticon-angry-outline'
  | 'emoticon-confused-outline';

export type Emotion = {
  id: string;
  name: string;
  icon: EmotionIconName;
  color: string;
};

const emotions: Emotion[] = [
  { id: 'normal', name: '普通', icon: 'emoticon-outline', color: '#60a5fa' },
  {
    id: 'happy',
    name: '嬉しい',
    icon: 'emoticon-happy-outline',
    color: '#34d399',
  },
  { id: 'sad', name: '悲しい', icon: 'emoticon-sad-outline', color: '#a78bfa' },
  {
    id: 'angry',
    name: '怒り',
    icon: 'emoticon-angry-outline',
    color: '#f87171',
  },
  {
    id: 'confused',
    name: '微妙',
    icon: 'emoticon-confused-outline',
    color: '#fbbf24',
  },
];

export const useChatInputEmotion = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);

  const handleSelectEmotion = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
  };

  const handleClearEmotion = () => {
    setSelectedEmotion(null);
  };

  return { emotions, selectedEmotion, handleSelectEmotion, handleClearEmotion };
};
