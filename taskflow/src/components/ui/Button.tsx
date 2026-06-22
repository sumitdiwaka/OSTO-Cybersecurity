"use client";

import { clsx } from "clsx";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  isLoading?: boolean;
}

const variants = {
  primary:
    "gradient-primary text-white shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] disabled:opacity-50 disabled:shadow-none",
  secondary:
    "bg-surface text-ink border border-border hover:border-border-strong hover:bg-bg disabled:opacity-50",
  ghost: "text-ink-muted hover:bg-primary-soft hover:text-primary disabled:opacity-50",
  danger: "bg-danger text-white hover:bg-danger/90 disabled:opacity-50",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.div
      whileHover={!disabled && !isLoading ? { scale: 1.02, y: -1 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      style={{ display: "inline-flex" }}
    >
      <button
        className={clsx(
          "inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium transition-[box-shadow,background-color,border-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {children}
      </button>
    </motion.div>
  );
}