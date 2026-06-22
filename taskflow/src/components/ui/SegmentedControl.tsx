"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

interface Option<T extends string> {
  value: T;
  label: string;
}

/**
 * A pill-style segmented control with a sliding active indicator
 * (framer-motion shared layout animation via `layoutId`). Used in place
 * of native <select> elements for short, fixed option sets (priority,
 * status) — communicates the choice at a glance and is a nicer target to
 * tap than a dropdown.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  className,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  className?: string;
}) {
  return (
    <div className={clsx("inline-flex flex-wrap gap-1 rounded-[var(--radius-sm)] border border-border bg-bg p-1", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={clsx(
              "relative rounded-[calc(var(--radius-sm)-3px)] px-2.5 py-1.5 text-xs font-medium transition-colors duration-150",
              active ? "text-white" : "text-ink-muted hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="gradient-primary absolute inset-0 rounded-[calc(var(--radius-sm)-3px)] shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}