import { supabase } from '@/lib/supabase/client';

import type { Session, User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as SecureStore from "expo-secure-store";
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  signInWithX: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  isLoggedIn: false,
  signInWithX: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  signInWithGoogle: async () => {},
  isAuthLoading: false,
});

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});


export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

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
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("セッション取得失敗:", error.message);
        return;
      }
      setSession(data.session);
      queryClient.setQueryData(["auth", "user"], data.session?.user ?? null);
    };

    fetchSession();
  }, []);

  const signInWithX = async () => {
    if (Platform.OS === "web") {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) return { error: new Error(error.message) };
      return { error: null };
    }

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: "chat-diary",
      preferLocalhost: true,
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });

    if (error) return { error: new Error(error.message) };
    return { error: null };
  };

  const getGoogleOAuthUrl = async (): Promise<string | null> => {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: "chat-diary",
      preferLocalhost: true,
    });

    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
      },
    });
    return result.data.url;
  };

  const signInWithGoogle = async () => {
    setIsAuthLoading(true);
    try {
      const url = await getGoogleOAuthUrl();
      if (!url) return;

      const result = await WebBrowser.openAuthSessionAsync(
        url,
        "chat-diary://google-auth",
        { showInRecents: true }
      );

      if (result.type === "success") {
        const data = extractParamsFromUrl(result.url);
        if (!data.access_token || !data.refresh_token) return;

        await setOAuthSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        await SecureStore.setItemAsync(
          "google-access-token",
          JSON.stringify(data.provider_token)
        );
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const setOAuthSession = async (tokens: {
    access_token: string;
    refresh_token: string;
  }) => {
    const { error } = await supabase.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });
    if (error) throw error;
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
    signInWithGoogle,
    isAuthLoading,
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

const extractParamsFromUrl = (url: string) => {
  const params = new URLSearchParams(url.split("#")[1]);
  return {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    expires_in: Number.parseInt(params.get("expires_in") || "0"),
    token_type: params.get("token_type"),
    provider_token: params.get("provider_token"),
  };
};