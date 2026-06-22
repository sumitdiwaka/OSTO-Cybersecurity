import { ImageResponse } from "next/og";
import { getPublicBoard } from "@/lib/server/store";

export const alt = "TaskFlow board preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const board = await getPublicBoard(boardId);

  const title = board?.title ?? "Board not found";
  const taskCount = board ? board.columns.reduce((sum, c) => sum + c.tasks.length, 0) : 0;
  const columnSwatches = board?.columns.slice(0, 6) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundImage: "linear-gradient(135deg, #1a1530 0%, #2a1d4a 45%, #3d1f3f 100%)",
          padding: "64px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundImage: "linear-gradient(135deg, #6d5bf7, #a855f7, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            T
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.5 }}>TaskFlow</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5 }}>
            {title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {columnSwatches.map((c) => (
              <div
                key={c.id}
                style={{ width: 18, height: 18, borderRadius: 4, background: c.color }}
              />
            ))}
            <div style={{ fontSize: 22, color: "#b9b3d9", marginLeft: 6 }}>
              {`${taskCount} tasks · ${board?.columns.length ?? 0} columns`}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 18, color: "#8c84b5" }}>Public read-only board · taskflow.dev</div>
      </div>
    ),
    { ...size }
  );
}