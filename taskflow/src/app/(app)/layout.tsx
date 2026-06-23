"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SessionExpiredModal } from "@/components/auth/SessionExpiredModal";
import { Sidebar } from "@/components/layout/Sidebar";
import { Skeleton } from "@/components/ui/States";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, sessionExpired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !sessionExpired) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, sessionExpired, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="h-14 border-b border-border bg-surface px-4 py-3">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      {children}
      <SessionExpiredModal />
    </>
  );
}