import { format } from 'date-fns';
import { useRef } from 'react';
import type { View } from 'react-native';
import type { ScrollView } from 'react-native';

export const useChatScrollToDate = () => {
  const scrollRef = useRef<ScrollView>(null);
  const listItemRefs = useRef<{
    [key in string]: View;
  }>({});

  const handleScrollToDate = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    const ref = listItemRefs.current[key];

    if (!scrollRef.current) {
      return;
    }

    if (ref) {
      ref.measureLayout(scrollRef.current as unknown as View, (x, y) => {
        scrollRef.current?.scrollTo({ y, animated: true });
      });
    }
  };

  return {
    listItemRefs,
    scrollRef,
    handleScrollToDate,
  };
};
