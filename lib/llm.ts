/**
 * Machine-readable views of the site for LLMs, agents and search engines:
 * /llms.txt, /llms-full.txt, /index.md and the JSON-LD blocks.
 * Everything is built from lib/site.ts and lib/writing.ts, so it stays in sync
 * with what the site shows.
 */
import fs from "node:fs"
import path from "node:path"

import {
  EARLIER_PROJECTS,
  EDUCATION,
  EXPERIENCE,
  FEATURED_PROJECT,
  LINKS,
  SITE,
} from "@/lib/site"
import { TINY_FRONTIER_SERIES, type SeriesPart } from "@/lib/writing"

const url = (p: string) => new URL(p, SITE.url).toString()

/** Same wording as the intro on the home page. */
export const ABOUT = [
  "I'm a founding AI engineer at Meridian, where I build the core AI platform end to end: RAG pipelines and MCP servers underneath, multi-agent flows in the middle, and the chat and voice agents people actually talk to on top. Before that I spent years as a frontend and full-stack engineer, so I own the whole path, from raw data to the interface.",
  "Outside work I run experiments and build side projects: taking ideas apart, testing them carefully, and writing up what I learn.",
]

const published = () => TINY_FRONTIER_SERIES.parts.filter((p) => p.href)
const profileLinks = () => LINKS.filter((l) => !l.url.startsWith("mailto"))

/** "October 2026" -> "2026-10" (ISO 8601, month precision). */
export function isoMonth(date?: string) {
  if (!date) return undefined
  const d = new Date(`1 ${date}`)
  if (Number.isNaN(d.getTime())) return undefined
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function skills() {
  return Array.from(new Set(EXPERIENCE.flatMap((r) => r.stack)))
}

// ---------- Markdown ----------

function experienceMd() {
  return EXPERIENCE.map((r) =>
    [
      `### ${r.title}, ${r.company}${r.period ? ` (${r.period.replace("—", "–")})` : ""}`,
      r.summary ?? "",
      r.points.map((p) => `- ${p}`).join("\n"),
      `Stack: ${r.stack.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n\n")
  ).join("\n\n")
}

function projectsMd() {
  const p = FEATURED_PROJECT
  const featured = [
    `### ${p.name}: ${p.tagline} (current)`,
    p.description,
    p.highlights.map((h) => `- **${h.value}**: ${h.label}`).join("\n"),
    `Code: ${p.code}  \nWrite-up: ${url("/writing")}  \nStack: ${p.stack.join(", ")}`,
  ].join("\n\n")
  const earlier = EARLIER_PROJECTS.map(
    (e) =>
      `### ${e.name}\n\n${e.description}\n\nStack: ${e.stack.replace(/ · /g, ", ")}  \nLive: ${e.live}  \nCode: ${e.code}`
  ).join("\n\n")
  return `${featured}\n\n${earlier}`
}

function writingList(parts: SeriesPart[]) {
  return parts
    .map(
      (p) =>
        `- [Part ${p.part}: ${p.title}](${url(p.href! + ".md")}): ${p.summary}`
    )
    .join("\n")
}

function linksMd() {
  return [
    `- Website: ${SITE.url}`,
    ...profileLinks().map((l) => `- ${l.name}: ${l.url}`),
    `- Email: ${SITE.email}`,
  ].join("\n")
}

/** The home page as Markdown (/index.md). */
export function profileMarkdown() {
  return [
    `# ${SITE.name}`,
    `> ${SITE.description}`,
    ...ABOUT,
    "## Experience",
    experienceMd(),
    "## Education",
    `${EDUCATION.degree}, ${EDUCATION.school} (${EDUCATION.year})`,
    "## Skills",
    skills().join(", "),
    "## Projects",
    projectsMd(),
    `## Writing: ${TINY_FRONTIER_SERIES.title}`,
    TINY_FRONTIER_SERIES.description,
    writingList(published()),
    "## Links",
    linksMd(),
  ].join("\n\n")
}

/** /llms.txt, following the llmstxt.org format. */
export function llmsTxt() {
  return (
    [
      `# ${SITE.name}`,
      `> ${SITE.name} is a ${SITE.role} and founding AI engineer at Meridian, building RAG pipelines, MCP servers, and multi-agent chat and voice systems end to end. Also runs from-scratch LLM architecture experiments and writes them up.`,
      ...ABOUT,
      "## About",
      [
        `- [Profile, experience and projects](${url("/index.md")}): roles, what was built at each, skills, education and projects`,
        `- [Everything in one file](${url("/llms-full.txt")}): the profile plus the full text of every post`,
      ].join("\n"),
      "## Experience",
      EXPERIENCE.map(
        (r) =>
          `- ${r.title}, ${r.company}${r.period ? ` (${r.period.replace("—", "–")})` : ""}: ${r.summary ?? r.points[0]}`
      ).join("\n"),
      "## Projects",
      [
        `- [${FEATURED_PROJECT.name}](${FEATURED_PROJECT.code}): ${FEATURED_PROJECT.description}`,
        ...EARLIER_PROJECTS.map(
          (e) => `- [${e.name}](${e.code}): ${e.description}`
        ),
      ].join("\n"),
      `## Writing: ${TINY_FRONTIER_SERIES.title}`,
      writingList(published()),
      "## Optional",
      linksMd(),
    ].join("\n\n") + "\n"
  )
}

function readPostMarkdown(href: string) {
  const file = path.join(process.cwd(), "public", `${href}.md`)
  try {
    return fs.readFileSync(file, "utf8").trim()
  } catch {
    return null
  }
}

/** /llms-full.txt: the profile plus every post in full. */
export function llmsFullTxt() {
  const posts = published()
    .map((p) => {
      const md = readPostMarkdown(p.href!)
      // Demote the post's headings one level so they nest under this file.
      return md
        ? md.replace(/^(#{1,5}) /gm, "#$1 ")
        : `## Part ${p.part}: ${p.title}\n\n${p.summary}\n\nRead it at ${url(p.href!)}`
    })
    .join("\n\n---\n\n")
  return `${profileMarkdown()}\n\n---\n\n# Writing (full text)\n\n${posts}\n`
}

// ---------- JSON-LD (schema.org) ----------

const person = () => ({
  "@type": "Person",
  "@id": url("/#person"),
  name: SITE.name,
  url: SITE.url,
  email: `mailto:${SITE.email}`,
  jobTitle: "Founding AI Engineer",
  description: SITE.description,
  worksFor: { "@type": "Organization", name: "Meridian" },
  alumniOf: { "@type": "CollegeOrUniversity", name: EDUCATION.school },
  knowsAbout: [
    "AI engineering",
    "Large language models",
    "Retrieval-augmented generation",
    "Model Context Protocol",
    "Multi-agent systems",
    "Voice agents",
    "Transformer architecture",
    "Full-stack development",
    ...skills(),
  ],
  sameAs: profileLinks().map((l) => l.url),
})

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      person(),
      {
        "@type": "WebSite",
        "@id": url("/#website"),
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        author: { "@id": url("/#person") },
      },
      {
        "@type": "ProfilePage",
        url: SITE.url,
        name: `${SITE.name} · ${SITE.role}`,
        mainEntity: { "@id": url("/#person") },
      },
      {
        "@type": "SoftwareSourceCode",
        name: FEATURED_PROJECT.name,
        description: FEATURED_PROJECT.description,
        codeRepository: FEATURED_PROJECT.code,
        programmingLanguage: "Python",
        author: { "@id": url("/#person") },
      },
    ],
  }
}

export function postJsonLd(part: SeriesPart, description?: string) {
  const series = TINY_FRONTIER_SERIES
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: part.title,
    description: description ?? part.summary,
    url: url(part.href!),
    datePublished: isoMonth(part.date),
    timeRequired: part.readingTime
      ? `PT${parseInt(part.readingTime, 10)}M`
      : undefined,
    author: {
      "@type": "Person",
      "@id": url("/#person"),
      name: SITE.name,
      url: SITE.url,
    },
    isPartOf: {
      "@type": "CreativeWorkSeries",
      name: series.title,
      description: series.description,
      url: url("/writing"),
    },
    position: part.part,
    encoding: {
      "@type": "MediaObject",
      encodingFormat: "text/markdown",
      contentUrl: url(part.href! + ".md"),
    },
  }
}
