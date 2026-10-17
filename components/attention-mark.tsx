import { cn } from "@/lib/utils"

interface AttentionMarkProps {
  /** tokens per side of the mask */
  n?: number
  /** sliding window size */
  window?: number
  /** px per cell, including the gap */
  cell?: number
  className?: string
  title?: string
}

/**
 * A causal sliding-window attention mask, drawn as a grid.
 * Row i is a query token; it attends to keys j with i - window < j <= i.
 * Cells inside the window are filled (darker = closer); cells outside it
 * but still in the past are drawn as faint dots.
 */
export function AttentionMark({
  n = 10,
  window = 4,
  cell = 6,
  className,
  title = "Sliding-window attention mask",
}: AttentionMarkProps) {
  const gap = Math.max(1, Math.round(cell / 5))
  const size = n * cell - gap
  const cells: JSX.Element[] = []

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      const d = i - j
      const x = j * cell
      const y = i * cell
      if (d < window) {
        cells.push(
          <rect
            key={`${i}-${j}`}
            x={x}
            y={y}
            width={cell - gap}
            height={cell - gap}
            rx={1}
            fill="currentColor"
            opacity={1 - (d / window) * 0.62}
          />
        )
      } else {
        cells.push(
          <circle
            key={`${i}-${j}`}
            cx={x + (cell - gap) / 2}
            cy={y + (cell - gap) / 2}
            r={Math.max(0.6, cell / 9)}
            fill="currentColor"
            opacity={0.28}
          />
        )
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      {cells}
    </svg>
  )
}
