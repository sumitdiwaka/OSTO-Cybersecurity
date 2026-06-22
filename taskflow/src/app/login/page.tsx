import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4">
      <div
        aria-hidden
        className="animate-blob absolute -left-32 -top-32 size-96 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-blob absolute -bottom-40 -right-20 size-[28rem] rounded-full bg-accent/20 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <div
        aria-hidden
        className="animate-blob absolute left-1/3 top-1/2 size-72 rounded-full bg-primary-2/20 blur-3xl"
        style={{ animationDelay: "-11s" }}
      />

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}