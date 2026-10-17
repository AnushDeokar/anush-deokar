import Link from "next/link"

import { SITE } from "@/lib/site"
import { AttentionMark } from "@/components/attention-mark"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV = [
  { name: "Work", href: "/#work" },
  { name: "Projects", href: "/#projects" },
  { name: "Writing", href: "/writing" },
]

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-y-3 px-5 pb-4 pt-8 sm:flex-nowrap sm:px-6 sm:pt-10">
      <Link
        href="/"
        className="group flex items-center gap-2.5 whitespace-nowrap text-[15px] font-medium tracking-tight"
      >
        <AttentionMark
          n={6}
          window={3}
          cell={4}
          className="text-accent transition-transform duration-500 group-hover:rotate-90"
        />
        {SITE.name}
      </Link>
      <ThemeToggle className="sm:order-last" />
      <nav className="flex w-full items-center text-[14px] text-muted sm:ml-auto sm:w-auto sm:gap-1">
        {NAV.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="rounded-md px-2 py-1 transition-colors hover:text-foreground max-sm:px-2.5 max-sm:py-1.5 max-sm:first:pl-0"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </header>
  )
}
