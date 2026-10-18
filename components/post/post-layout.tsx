import Link from "next/link"

import { postJsonLd } from "@/lib/llm"
import { cn } from "@/lib/utils"
import { TINY_FRONTIER_SERIES } from "@/lib/writing"
import { JsonLd } from "@/components/json-ld"

export function SeriesPostLayout({
  part,
  children,
  lede,
}: {
  part: number
  lede: React.ReactNode
  children: React.ReactNode
}) {
  const series = TINY_FRONTIER_SERIES
  const meta = series.parts.find((p) => p.part === part)!
  const prev = series.parts.find((p) => p.part === part - 1)
  const next = series.parts.find((p) => p.part === part + 1)

  return (
    <main className="mx-auto max-w-page px-5 sm:px-6">
      <JsonLd data={postJsonLd(meta)} />
      <article>
        <header className="pt-12 sm:pt-16">
          <p className="eyebrow">
            <Link href="/writing" className="hover:text-foreground">
              {series.title}
            </Link>{" "}
            · Part {meta.part} of {series.parts.length}
          </p>
          <h1 className="mt-4 font-serif text-[34px] font-normal leading-[1.12] tracking-tight sm:text-[42px]">
            {meta.title}
          </h1>
          <p className="mt-5 text-[18px] leading-relaxed text-muted">{lede}</p>
          <p className="mt-6 font-mono text-[12px] text-faint">
            {meta.date} · {meta.readingTime} read
          </p>
          <SeriesNav current={part} className="mt-8" />
        </header>

        <div className="post mt-10">{children}</div>
      </article>

      <nav className="mt-16 grid gap-3 border-t pt-8 sm:grid-cols-2">
        {prev?.href ? (
          <Link
            href={prev.href}
            className="group rounded-lg border p-4 transition-colors hover:border-faint"
          >
            <p className="eyebrow">← Part {prev.part}</p>
            <p className="mt-1.5 text-[15px] group-hover:text-accent">
              {prev.title}
            </p>
          </Link>
        ) : (
          <span />
        )}
        {next && <PartLink part={next} className="sm:text-right" arrow="→" />}
      </nav>
    </main>
  )
}

function PartLink({
  part,
  className,
  arrow,
}: {
  part: (typeof TINY_FRONTIER_SERIES.parts)[number]
  className?: string
  arrow: string
}) {
  if (!part.href) {
    return (
      <div className={cn("rounded-lg border border-dashed p-4", className)}>
        <p className="eyebrow">
          Part {part.part} {arrow} coming soon
        </p>
        <p className="mt-1.5 text-[15px] text-faint">{part.title}</p>
      </div>
    )
  }
  return (
    <Link
      href={part.href}
      className={cn(
        "group rounded-lg border p-4 transition-colors hover:border-faint",
        className
      )}
    >
      <p className="eyebrow">
        Part {part.part} {arrow}
      </p>
      <p className="mt-1.5 text-[15px] group-hover:text-accent">{part.title}</p>
    </Link>
  )
}

export function SeriesNav({
  current,
  className,
}: {
  current: number
  className?: string
}) {
  return (
    <ol
      className={cn(
        "grid gap-px overflow-hidden rounded-lg border bg-rule",
        // static class names so Tailwind keeps them; no empty cells for 3 or 4 parts
        TINY_FRONTIER_SERIES.parts.length === 3
          ? "grid-cols-3"
          : "grid-cols-2 sm:grid-cols-4",
        className
      )}
    >
      {TINY_FRONTIER_SERIES.parts.map((p) => {
        const active = p.part === current
        const body = (
          <>
            <span
              className={cn(
                "font-mono text-[11px]",
                active ? "text-accent" : "text-faint"
              )}
            >
              0{p.part}
            </span>
            <span
              className={cn(
                "mt-1 block text-[13px] leading-snug",
                active
                  ? "text-foreground"
                  : p.href
                    ? "text-muted"
                    : "text-faint"
              )}
            >
              {p.short}
            </span>
            {!p.href && (
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-faint">
                soon
              </span>
            )}
          </>
        )
        return (
          <li
            key={p.part}
            className={cn("bg-background", active && "bg-surface")}
          >
            {p.href && !active ? (
              <Link
                href={p.href}
                className="block h-full p-3 transition-colors hover:bg-surface"
              >
                {body}
              </Link>
            ) : (
              <div
                className="h-full p-3"
                aria-current={active ? "page" : undefined}
              >
                {body}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
