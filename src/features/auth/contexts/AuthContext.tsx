import { supabase } from '@/lib/supabase/client';

import type { Session, User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  signInWithX: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  isLoggedIn: false,
  signInWithX: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);

  // ユーザー情報を取得するクエリ
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user || null;
    },
  });

  // 認証状態の変更を監視
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        // ユーザー情報をキャッシュに設定
        queryClient.setQueryData(['auth', 'user'], newSession?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        // ユーザー情報をクリア
        queryClient.setQueryData(['auth', 'user'], null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  const signInWithX = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err) {
      return {
        error:
          err instanceof Error ? err : new Error('不明なエラーが発生しました'),
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: new Error(error.message) };
      }
      window.location.href = '/';
      return { error: null };
    } catch (err) {
      return {
        error:
          err instanceof Error ? err : new Error('不明なエラーが発生しました'),
      };
    }
  };

  const value = {
    user: user || null,
    isLoggedIn: !!user,
    session,
    isLoading,
    signInWithX,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
