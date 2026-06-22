import { clsx } from "clsx";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-[var(--radius-sm)] border border-border bg-surface text-sm text-ink placeholder:text-ink-faint transition-shadow duration-150 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary-soft";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input suppressHydrationWarning className={clsx("h-10 px-3", fieldBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea suppressHydrationWarning className={clsx("resize-none px-3 py-2", fieldBase, className)} {...props} />;
}

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-ink-muted">
      {children}
    </label>
  );
}