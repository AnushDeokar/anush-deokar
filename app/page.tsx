import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import {
  EARLIER_PROJECTS,
  EDUCATION,
  EXPERIENCE,
  FEATURED_PROJECT,
  LINKS,
} from "@/lib/site"
import { TINY_FRONTIER_SERIES } from "@/lib/writing"
import { AttentionMark } from "@/components/attention-mark"
import { Section } from "@/components/section"

export default function Home() {
  const published = TINY_FRONTIER_SERIES.parts.filter((p) => p.href)

  return (
    <main className="mx-auto max-w-page px-5 sm:px-6">
      {/* Intro */}
      <section className="pt-14 sm:pt-20">
        <p className="eyebrow mb-5">Full Stack + AI Engineer</p>
        <h1 className="font-serif text-[34px] font-normal leading-[1.15] tracking-tight sm:text-[44px]">
          I design and ship{" "}
          <span className="italic text-accent">agentic systems</span>, from
          the data layer to the product.
        </h1>
        <div className="mt-7 max-w-[36rem] space-y-4 text-[16.5px] leading-relaxed text-muted">
          <p>
            I&apos;m a founding AI engineer at{" "}
            <span className="text-foreground">Meridian</span>, where I build
            the core AI platform end to end: RAG pipelines and MCP servers
            underneath, multi-agent flows in the middle, and the chat and voice
            agents people actually talk to on top. Before that I spent years as
            a frontend and full-stack engineer, so I own the whole path, from
            raw data to the interface.
          </p>
          <p>
            Outside work I run experiments and build side projects: taking
            ideas apart, testing them carefully, and writing up what I
            learn.
          </p>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
          {LINKS.map((l) => (
            <li key={l.name}>
              <a
                href={l.url}
                target={l.url.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="link"
              >
                {l.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Work */}
      <Section id="work" label="Work">
        <ol className="space-y-12">
          {EXPERIENCE.map((role) => (
            <li
              key={role.company}
              className="grid gap-x-8 gap-y-2 sm:grid-cols-[9.5rem_1fr]"
            >
              <p className="pt-[3px] font-mono text-[12px] text-faint">
                {role.period ?? ""}
              </p>
              <div>
                <h3 className="text-[16px] font-medium">
                  {role.title}{" "}
                  <span className="text-muted">· {role.company}</span>
                </h3>
                {role.summary && (
                  <p className="mt-1 text-[15px] text-muted">{role.summary}</p>
                )}
                <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
                  {role.points.map((pt) => (
                    <li key={pt} className="relative pl-4">
                      <span
                        className="absolute left-0 top-[0.72em] h-px w-2 bg-faint"
                        aria-hidden
                      />
                      {pt}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-mono text-[11.5px] text-faint">
                  {role.stack.join(" · ")}
                </p>
              </div>
            </li>
          ))}
          <li className="grid gap-x-8 gap-y-1 sm:grid-cols-[9.5rem_1fr]">
            <p className="pt-[3px] font-mono text-[12px] text-faint">
              {EDUCATION.year}
            </p>
            <h3 className="text-[16px] font-medium">
              {EDUCATION.degree}{" "}
              <span className="text-muted">· {EDUCATION.school}</span>
            </h3>
          </li>
        </ol>
      </Section>

      {/* Projects */}
      <Section id="projects" label="Projects">
        <article className="relative overflow-hidden rounded-xl border bg-surface/60 p-6 sm:p-8">
          <AttentionMark
            n={14}
            window={4}
            cell={9}
            className="pointer-events-none absolute -right-3 -top-3 text-accent opacity-[0.16] sm:right-6 sm:top-6 sm:opacity-30"
            title="Sliding-window attention mask"
          />
          <p className="eyebrow flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Current project
          </p>
          <h3 className="mt-4 font-serif text-[30px] leading-tight tracking-tight">
            {FEATURED_PROJECT.name}
          </h3>
          <p className="mt-1 text-[15px] text-muted">
            {FEATURED_PROJECT.tagline}
          </p>
          <p className="mt-5 max-w-[34rem] text-[15.5px] leading-relaxed text-foreground/85">
            {FEATURED_PROJECT.description}
          </p>

          <dl className="mt-7 grid gap-5 border-t pt-6 sm:grid-cols-3">
            {FEATURED_PROJECT.highlights.map((h) => (
              <div key={h.value}>
                <dt className="font-serif text-[28px] leading-none tracking-tight">
                  {h.value}
                </dt>
                <dd className="mt-2 text-[13px] leading-snug text-muted">
                  {h.label}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px]">
            <Link
              href={published[0].href!}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-85"
            >
              Read the series
            </Link>
            <a
              href={FEATURED_PROJECT.code}
              target="_blank"
              rel="noopener noreferrer"
              className="link inline-flex items-center gap-1"
            >
              Code <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <span className="font-mono text-[11.5px] text-faint">
              {FEATURED_PROJECT.stack.join(" · ")}
            </span>
          </div>
        </article>

        <p className="eyebrow mb-4 mt-12">Earlier</p>
        <ul className="divide-y border-y">
          {EARLIER_PROJECTS.map((p) => (
            <li
              key={p.name}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <div className="flex-1">
                <p className="text-[15px] font-medium">{p.name}</p>
                <p className="mt-0.5 text-[14px] text-muted">{p.description}</p>
                <p className="mt-1 font-mono text-[11.5px] text-faint">
                  {p.stack}
                </p>
              </div>
              <div className="flex gap-4 text-[13px] text-muted">
                <a
                  href={p.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  Live
                </a>
                <a
                  href={p.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  Code
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Writing */}
      <Section id="writing" label="Writing">
        <p className="mb-5 text-[15px] text-muted">
          <span className="text-foreground">{TINY_FRONTIER_SERIES.title}</span>{" "}
          · {TINY_FRONTIER_SERIES.description}
        </p>
        <ul className="divide-y border-y">
          {TINY_FRONTIER_SERIES.parts.map((p) => {
            const inner = (
              <div className="flex items-baseline gap-4 py-4">
                <span className="w-6 shrink-0 font-mono text-[12px] text-faint">
                  0{p.part}
                </span>
                <span
                  className={
                    p.href
                      ? "flex-1 text-[15.5px] text-foreground transition-colors group-hover:text-accent"
                      : "flex-1 text-[15.5px] text-faint"
                  }
                >
                  {p.title}
                </span>
                <span className="hidden font-mono text-[11.5px] text-faint sm:block">
                  {p.href ? p.date : "Coming soon"}
                </span>
              </div>
            )
            return (
              <li key={p.part}>
                {p.href ? (
                  <Link href={p.href} className="group block">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            )
          })}
        </ul>
        <Link href="/writing" className="link mt-5 inline-block text-[14px]">
          All writing
        </Link>
      </Section>
    </main>
  )
}
