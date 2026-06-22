import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <p className="font-display text-lg font-semibold text-ink">Page not found</p>
      <Link href="/" className="mt-3 text-sm font-medium text-primary hover:underline">
        Back to TaskFlow
      </Link>
    </div>
  );
}
