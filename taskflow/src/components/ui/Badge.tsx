import { clsx } from "clsx";

const tones = {
  neutral: "bg-bg text-ink-muted border border-border",
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent",
  warn: "bg-warn-soft text-warn",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}