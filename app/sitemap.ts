import type { MetadataRoute } from "next"

import { isoMonth } from "@/lib/llm"
import { SITE } from "@/lib/site"
import { TINY_FRONTIER_SERIES } from "@/lib/writing"

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = TINY_FRONTIER_SERIES.parts.filter((p) => p.href)
  const latest = posts
    .map((p) => isoMonth(p.date))
    .filter(Boolean)
    .sort()
    .pop()

  return [
    {
      url: SITE.url,
      changeFrequency: "monthly",
      priority: 1,
      lastModified: latest,
    },
    {
      url: `${SITE.url}/writing`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: latest,
    },
    ...posts.map((p) => ({
      url: `${SITE.url}${p.href}`,
      lastModified: isoMonth(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${SITE.url}/llms.txt`, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${SITE.url}/llms-full.txt`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]
}
