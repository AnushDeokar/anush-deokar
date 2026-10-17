import type { Metadata } from "next"
import Link from "next/link"

import { TINY_FRONTIER_SERIES } from "@/lib/writing"
import { AttentionMark } from "@/components/attention-mark"

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes and experiment write-ups on LLM architecture and AI engineering.",
}

export default function WritingPage() {
  const series = TINY_FRONTIER_SERIES
  return (
    <main className="mx-auto max-w-page px-5 sm:px-6">
      <header className="pt-12 sm:pt-16">
        <p className="eyebrow">Writing</p>
        <h1 className="mt-4 font-serif text-[36px] font-normal leading-tight tracking-tight sm:text-[42px]">
          Notes from building things
        </h1>
        <p className="mt-4 max-w-[34rem] text-[16.5px] leading-relaxed text-muted">
          Experiment write-ups, mostly about how LLMs work under the hood.
          Numbers come from runs I can reproduce; caveats are stated.
        </p>
      </header>

      <section className="mt-14">
        <div className="flex items-start justify-between gap-6 border-b pb-6">
          <div>
            <p className="eyebrow">Series</p>
            <h2 className="mt-2 font-serif text-[26px] tracking-tight">
              {series.title}
            </h2>
            <p className="mt-1.5 max-w-[30rem] text-[15px] text-muted">
              {series.description}
            </p>
          </div>
          <AttentionMark
            n={8}
            window={3}
            cell={7}
            className="mt-1 hidden text-accent sm:block"
          />
        </div>

        <ol>
          {series.parts.map((p) => {
            const body = (
              <div className="grid gap-x-6 gap-y-1 py-6 sm:grid-cols-[3rem_1fr]">
                <span className="font-mono text-[12px] text-faint">
                  Part {p.part}
                </span>
                <div>
                  <h3
                    className={
                      p.href
                        ? "text-[18px] font-medium tracking-tight transition-colors group-hover:text-accent"
                        : "text-[18px] font-medium tracking-tight text-faint"
                    }
                  >
                    {p.title}
                  </h3>
                  <p
                    className={
                      p.href
                        ? "mt-1.5 text-[15px] leading-relaxed text-muted"
                        : "mt-1.5 text-[15px] leading-relaxed text-faint"
                    }
                  >
                    {p.summary}
                  </p>
                  <p className="mt-2.5 font-mono text-[11.5px] text-faint">
                    {p.href
                      ? `${p.date} · ${p.readingTime} read`
                      : "Coming soon"}
                  </p>
                </div>
              </div>
            )
            return (
              <li key={p.part} className="border-b">
                {p.href ? (
                  <Link href={p.href} className="group block">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            )
          })}
        </ol>
      </section>
    </main>
  )
}
