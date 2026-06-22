"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";

const DEMO_ACCOUNTS = [
  { email: "alice@taskflow.dev", role: "Product Engineering + Marketing" },
  { email: "bilal@taskflow.dev", role: "Product Engineering" },
  { email: "priya@taskflow.dev", role: "Product Engineering + Marketing" },
];
const DEMO_PASSWORD = "password123";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggingIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reason = searchParams.get("reason");
  const from = searchParams.get("from");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      router.push(from && from !== "/" ? from : "/workspaces");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass relative w-full max-w-sm rounded-[var(--radius-xl)] border border-border p-8 shadow-[var(--shadow-glow-lg)]"
    >
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2">
          <span className="gradient-brand flex size-8 items-center justify-center rounded-[var(--radius-sm)] font-mono text-sm font-bold text-white shadow-[var(--shadow-glow)]">
            T
          </span>
          <span className="font-display text-lg font-semibold text-ink">TaskFlow</span>
        </div>
        <p className="text-sm text-ink-muted">Sign in to your workspaces.</p>
      </div>

      {reason === "expired" && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 rounded-[var(--radius-sm)] border border-warn-soft bg-warn-soft px-3 py-2 text-sm text-warn"
        >
          Your session expired. Please sign in again.
        </motion.p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@taskflow.dev"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-danger"
          >
            {error}
          </motion.p>
        )}

        <Button type="submit" className="w-full" isLoading={isLoggingIn}>
          Sign in
        </Button>
      </form>

      <div className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface/80 p-3">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
          Demo accounts · password &quot;{DEMO_PASSWORD}&quot;
        </p>
        <ul className="space-y-1">
          {DEMO_ACCOUNTS.map((acc) => (
            <li key={acc.email}>
              <button
                type="button"
                onClick={() => fillDemo(acc.email)}
                className="flex w-full items-center justify-between rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-xs transition-colors hover:bg-primary-soft"
              >
                <span className="font-mono text-ink">{acc.email}</span>
                <span className="text-ink-faint">{acc.role}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}