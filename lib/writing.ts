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
      title: "Shrinking the frontier: rebuilding modern LLM tricks from scratch",
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
        "Why a windowed model breaks when you stream past its training length, and whether attention sinks fix it.",
    },
    {
      part: 4,
      title: "Sinks across scale",
      short: "Sinks across scale",
      summary:
        "When sinks emerge during training, whether that depends on model size, and whether a learned sink allows a smaller window.",
    },
  ] as SeriesPart[],
}
