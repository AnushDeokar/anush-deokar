export interface SeriesPart {
  part: number
  title: string
  short: string
  summary: string
  href?: string // undefined = not published yet
  date?: string
  readingTime?: string
}

export const TINY_FRONTIER_SERIES = {
  slug: "tiny-frontier",
  title: "Tiny Frontier",
  description:
    "Rebuilding the memory tricks of modern LLMs at tiny scale, one controlled experiment at a time.",
  parts: [
    {
      part: 1,
      title:
        "Shrinking the frontier: rebuilding modern LLM tricks from scratch",
      short: "Background",
      summary:
        "The question, the rules for fair comparisons, a 3.4M-parameter control model, and proving the code is right by matching Google's Gemma 3 270M.",
      href: "/writing/tiny-frontier/background",
      date: "September 2026",
      readingTime: "11 min",
    },
    {
      part: 2,
      title: "How small can attention windows get?",
      short: "Local vs global attention",
      summary:
        "Sliding windows, local:global layer patterns, and what they cost in quality versus what they save in KV-cache memory.",
      href: "/writing/tiny-frontier/local-global-attention",
      date: "October 2026",
      readingTime: "10 min",
    },
    {
      part: 3,
      title: "Attention sinks and streaming",
      short: "Attention sinks",
      summary:
        "Streaming 16× past the training length with a 64-token cache. The predicted collapse didn't happen, and one controlled run showed why: sinks come from the training data format.",
      href: "/writing/tiny-frontier/attention-sinks",
      date: "October 2026",
      readingTime: "10 min",
    },
    // Part 4 ("Sinks across scale") is postponed: hidden until it's written.
  ] as SeriesPart[],
}
