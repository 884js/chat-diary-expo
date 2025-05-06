'use client';

import { useMutation } from '@tanstack/react-query';

type SummarizeResponse = {
  summary: string;
};

type SummarizeParams = {
  messagesText: string;
};

export function useSummarize() {
  const {
    mutateAsync: summarize,
    data,
    error,
    isPending,
    isError,
    reset,
  } = useMutation<SummarizeResponse, Error, SummarizeParams>({
    mutationFn: async ({ messagesText }) => {
      const res = await fetch('/generated-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messagesText }),
      });

      if (!res.ok) {
        throw new Error('サマリー生成に失敗しました');
      }

      const data = await res.json();
      return data as SummarizeResponse;
    },
  });

  return {
    summarize, // 呼び出すための関数
    data, // { summary: string }
    isPending,
    isError,
    error,
    reset, // もしリセットしたいとき用
  };
}
