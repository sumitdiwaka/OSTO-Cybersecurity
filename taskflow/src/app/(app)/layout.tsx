"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SessionExpiredModal } from "@/components/auth/SessionExpiredModal";
import { Skeleton } from "@/components/ui/States";

/**
 * Middleware already blocks unauthenticated requests from reaching this
 * tree (see src/middleware.ts) — that's what makes the protection real,
 * since it runs before any page code executes. This client-side check is
 * a second, narrower layer: it covers the case where a session expires
 * *while the user is already sitting on a protected page*, which
 * middleware (only evaluated per-navigation) can't catch on its own.
 */
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
      {children}
      <SessionExpiredModal />
    </>
  );
}
