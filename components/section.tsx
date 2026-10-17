import { cn } from "@/lib/utils"

export function Section({
  id,
  label,
  children,
  className,
}: {
  id?: string
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn("scroll-mt-8 pt-16", className)}>
      <h2 className="eyebrow mb-7 flex items-center gap-3">
        {label}
        <span className="h-px flex-1 bg-rule" aria-hidden />
      </h2>
      {children}
    </section>
  )
}
