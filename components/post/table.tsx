import { cn } from "@/lib/utils"

export function DataTable({
  head,
  rows,
  caption,
  highlight = [],
  numeric = [],
}: {
  head: React.ReactNode[]
  rows: React.ReactNode[][]
  caption?: React.ReactNode
  /** row indexes to emphasise */
  highlight?: number[]
  /** column indexes rendered in tabular mono */
  numeric?: number[]
}) {
  return (
    <figure className="!my-8">
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[30rem] border-collapse text-left text-[14px] leading-snug">
          <thead>
            <tr className="border-b">
              {head.map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    "whitespace-nowrap pb-2 pr-4 font-mono text-[11px] font-normal uppercase tracking-[0.08em] text-faint",
                    numeric.includes(i) && "text-right"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr
                key={ri}
                className={cn(
                  "border-b last:border-b-0",
                  highlight.includes(ri) && "bg-accent-soft/60"
                )}
              >
                {r.map((c, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      "py-2 pr-4 align-top text-foreground/90",
                      numeric.includes(ci) &&
                        "whitespace-nowrap text-right font-mono text-[13px] tabular-nums"
                    )}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <figcaption className="mt-3 text-[13.5px] leading-snug text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
