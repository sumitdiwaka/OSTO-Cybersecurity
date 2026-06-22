"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { endpoints } from "@/lib/api/endpoints";
import { onSessionExpired } from "@/lib/api/client";
import { useAppStore } from "@/store/useAppStore";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const sessionExpired = useAppStore((s) => s.sessionExpired);
  const setSessionExpired = useAppStore((s) => s.setSessionExpired);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: endpoints.me,
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000, // light heartbeat so a passively-open tab notices expiry
  });

  useEffect(() => {
    return onSessionExpired(() => setSessionExpired(true));
  }, [setSessionExpired]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      endpoints.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], { user: data.user });
      setSessionExpired(false);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: endpoints.logout,
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  function acknowledgeSessionExpired() {
    setSessionExpired(false);
    queryClient.clear();
    router.push("/login?reason=expired");
  }

  return {
    user: meQuery.data?.user ?? null,
    isLoading: meQuery.isLoading,
    isAuthenticated: !!meQuery.data?.user && !sessionExpired,
    sessionExpired,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error as Error | null,
    logout: logoutMutation.mutate,
    acknowledgeSessionExpired,
  };
}
