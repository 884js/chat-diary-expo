import { AppStateStatus, Platform } from "react-native";
import { useOnlineManager } from "@/hooks/useOnlineManager";
import { useAppState } from "@/hooks/useAppState";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const ReactQueryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
