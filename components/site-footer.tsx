import { LINKS, SITE } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 max-w-page px-5 pb-12 sm:px-6">
      <div className="flex flex-col gap-4 border-t pt-6 text-[13px] text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE.name}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map((l) => (
            <li key={l.name}>
              <a
                href={l.url}
                target={l.url.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {l.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
