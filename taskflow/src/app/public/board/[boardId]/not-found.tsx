import Link from "next/link";

export default function PublicBoardNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <p className="font-display text-lg font-semibold text-ink">Board not found</p>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">
        This link is broken, or the board it points to isn&apos;t public.
      </p>
      <Link href="/login" className="mt-4 text-sm font-medium text-primary hover:underline">
        Go to TaskFlow
      </Link>
    </div>
  );
}
