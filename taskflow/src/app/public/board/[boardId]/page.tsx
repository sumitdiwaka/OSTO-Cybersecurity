import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe2, ArrowRight } from "lucide-react";
import { getPublicBoard } from "@/lib/server/store";
import { Badge } from "@/components/ui/Badge";
import { PRIORITY_LABEL } from "@/lib/utils";

interface Props {
  params: Promise<{ boardId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { boardId } = await params;
  const board = await getPublicBoard(boardId);

  if (!board) {
    return { title: "Board not found" };
  }

  const taskCount = board.columns.reduce((sum, c) => sum + c.tasks.length, 0);
  const description = board.description || `A shared task board with ${taskCount} tasks.`;

  return {
    title: board.title,
    description,
    alternates: { canonical: `/public/board/${boardId}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: board.title,
      description,
      type: "website",
      url: `/public/board/${boardId}`,
      images: [`/public/board/${boardId}/opengraph-image`],
    },
    twitter: {
      card: "summary_large_image",
      title: board.title,
      description,
    },
  };
}

export default async function PublicBoardPage({ params }: Props) {
  const { boardId } = await params;
  const board = await getPublicBoard(boardId);

  if (!board) notFound();

  const totalTasks = board.columns.reduce((sum, c) => sum + c.tasks.length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: board.title,
    description: board.description,
    numberOfItems: totalTasks,
    itemListElement: board.columns.flatMap((col, colIdx) =>
      col.tasks.map((task, taskIdx) => ({
        "@type": "ListItem",
        position: colIdx * 1000 + taskIdx + 1,
        name: task.title,
        description: task.description || undefined,
      }))
    ),
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="glass sticky top-0 z-10 border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="gradient-brand flex size-7 items-center justify-center rounded-[var(--radius-sm)] font-mono text-sm font-bold text-white shadow-[var(--shadow-glow)]">
              T
            </span>
            <span className="font-display text-sm font-semibold text-ink">TaskFlow</span>
          </Link>
          <Link
            href="/login"
            className="group flex items-center gap-1 text-xs font-medium text-ink-muted transition-colors hover:text-primary"
          >
            Sign in <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      <div className="gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 opacity-90" />
        <div className="relative mx-auto max-w-5xl px-5 py-10 text-white">
          <Badge tone="neutral" className="mb-3 border-white/30 bg-white/15 text-white backdrop-blur-sm">
            <Globe2 className="size-3" /> Public read-only view
          </Badge>
          <h1 className="font-display text-3xl font-semibold">{board.title}</h1>
          {board.description && <p className="mt-2 max-w-2xl text-sm text-white/85">{board.description}</p>}
          <p className="mt-2 font-mono text-xs text-white/70">
            {totalTasks} tasks across {board.columns.length} columns
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex gap-5 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <section key={column.id} className="w-72 shrink-0">
              <div
                className="h-1.5 w-full rounded-t-[var(--radius-lg)]"
                style={{ background: `linear-gradient(90deg, ${column.color}, ${column.color}99)` }}
                aria-hidden
              />
              <div className="rounded-b-[var(--radius-lg)] border border-t-0 border-border bg-surface p-3 shadow-[var(--shadow-card)]">
                <h2 className="mb-3 flex items-center justify-between text-sm font-semibold text-ink">
                  {column.title}
                  <span className="font-mono text-xs font-normal text-ink-faint">{column.tasks.length}</span>
                </h2>
                <ul className="space-y-2">
                  {column.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="rounded-[var(--radius-md)] border border-border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
                    >
                      <p className="text-sm font-medium text-ink">{task.title}</p>
                      {task.description && (
                        <p className="mt-1 text-xs text-ink-muted">{task.description}</p>
                      )}
                      <Badge tone="neutral" className="mt-2">
                        {PRIORITY_LABEL[task.priority]} priority
                      </Badge>
                    </li>
                  ))}
                  {column.tasks.length === 0 && (
                    <li className="rounded-[var(--radius-md)] border border-dashed border-border-strong p-3 text-center text-xs text-ink-faint">
                      No tasks
                    </li>
                  )}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}