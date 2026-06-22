import type { MetadataRoute } from "next";
import { getAllPublicBoardIds } from "@/lib/server/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const ids = await getAllPublicBoardIds();

  return [
    { url: `${base}/login`, changeFrequency: "monthly", priority: 0.3 },
    ...ids.map((id) => ({
      url: `${base}/public/board/${id}`,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
  ];
}
