export function KeyResult({
  label = "Key result",
  children,
}: {
  label?: string
  children: React.ReactNode
}) {
  return (
    <aside className="!my-10 border-l-2 border-accent bg-accent-soft/40 py-4 pl-5 pr-4">
      <p className="eyebrow mb-1.5 !text-accent">{label}</p>
      <div className="font-serif text-[19px] leading-snug text-foreground">
        {children}
      </div>
    </aside>
  )
}

export function Stats({
  items,
}: {
  items: { value: string; label: string }[]
}) {
  return (
    <dl className="!my-10 grid grid-cols-2 gap-x-6 gap-y-6 border-y py-6 sm:grid-cols-4">
      {items.map((s) => (
        <div key={s.label}>
          <dt className="font-serif text-[26px] leading-none tracking-tight text-foreground">
            {s.value}
          </dt>
          <dd className="mt-2 text-[12.5px] leading-snug text-muted">
            {s.label}
          </dd>
        </div>
      ))}
    </dl>
  )
}
