import { clsx } from "clsx";
import type { User } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  user,
  size = "md",
}: {
  user: Pick<User, "name" | "avatarColor"> | null;
  size?: "sm" | "md";
}) {
  if (!user) {
    return (
      <div
        className={clsx(
          "flex shrink-0 items-center justify-center rounded-full border border-dashed border-border-strong text-ink-faint",
          size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs"
        )}
        title="Unassigned"
      >
        ?
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white shadow-sm ring-2 ring-white",
        size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs"
      )}
      style={{ background: user.avatarColor }}
      title={user.name}
    >
      {initials(user.name)}
    </div>
  );
}