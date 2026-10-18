#!/usr/bin/env node
/**
 * Generates Markdown copies of the writing pages for LLMs and agents.
 *
 * It reads the pre-rendered HTML that `next build` produces for every post
 * under /writing, converts the article to Markdown, and writes it next to the
 * page's URL in /public (e.g. /writing/tiny-frontier/background.md).
 *
 *   npm run build && npm run llm:md     regenerate after editing a post
 *   node scripts/llm-md.mjs --check     only report stale files (runs on postbuild)
 *
 * No dependencies: the HTML is our own, so a small converter is enough.
 */
import fs from "node:fs"
import path from "node:path"

const SITE_URL = "https://anushdeokar.xyz"
const ROOT = process.cwd()
const HTML_ROOT = path.join(ROOT, ".next/server/app")
const PUBLIC = path.join(ROOT, "public")
const CHECK = process.argv.includes("--check")

// ---------- tiny HTML parser ----------
const VOID = new Set([
  "img",
  "br",
  "hr",
  "meta",
  "link",
  "input",
  "source",
  "wbr",
])

function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCodePoint(parseInt(h, 16))
    )
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
}

function parse(html) {
  const root = { tag: "#root", attrs: {}, children: [] }
  const stack = [root]
  const re =
    /<!--[\s\S]*?-->|<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z0-9]+)((?:\s+[^\s=>/]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+)/g
  let m
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1]
    if (m[0].startsWith("<!--")) continue
    if (m[1]) {
      const tag = m[1].toLowerCase()
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag) {
          stack.length = i
          break
        }
      }
    } else if (m[2]) {
      const tag = m[2].toLowerCase()
      const attrs = {}
      for (const a of m[3].matchAll(
        /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
      )) {
        attrs[a[1]] = decode(a[2] ?? a[3] ?? a[4] ?? "")
      }
      const node = { tag, attrs, children: [] }
      top.children.push(node)
      if (!VOID.has(tag) && !m[4]) stack.push(node)
    } else if (m[5]) {
      top.children.push({ tag: "#text", text: decode(m[5]) })
    }
  }
  return root
}

function find(node, pred) {
  if (pred(node)) return node
  for (const c of node.children ?? []) {
    const r = find(c, pred)
    if (r) return r
  }
  return null
}
const findTag = (node, tag) => find(node, (n) => n.tag === tag)
const cls = (n) => n.attrs?.class ?? ""

// ---------- Markdown serializer ----------
const abs = (href) => (href.startsWith("/") ? SITE_URL + href : href)

function imgSrc(src) {
  if (src.startsWith("/_next/image")) {
    const u = new URL(src, SITE_URL).searchParams.get("url")
    if (u) return abs(decodeURIComponent(u))
  }
  return abs(src)
}

function inline(node) {
  if (node.tag === "#text") return node.text
  if (node.tag === "svg") return ""
  const inner = () => node.children.map(inline).join("")
  switch (node.tag) {
    case "strong":
    case "b":
      return wrap("**", inner())
    case "em":
    case "i":
      return wrap("*", inner())
    case "code": {
      const t = inner()
      return t.includes("`") ? "`` " + t + " ``" : "`" + t + "`"
    }
    case "a": {
      const t = inner().trim()
      const href = node.attrs.href ?? ""
      return href ? `[${t}](${abs(href)})` : t
    }
    case "br":
      return " "
    case "img":
      return node.attrs.alt
        ? `![${node.attrs.alt}](${imgSrc(node.attrs.src ?? "")})`
        : ""
    default:
      return inner()
  }
}

function wrap(mark, t) {
  const m = t.match(/^(\s*)([\s\S]*?)(\s*)$/)
  return m[2] ? `${m[1]}${mark}${m[2]}${mark}${m[3]}` : t
}

const clean = (s) => s.replace(/\s+/g, " ").trim()
const text = (n) => clean(inline(n))

function table(t) {
  const rows = []
  for (const tr of all(t, "tr")) {
    rows.push(
      tr.children
        .filter((c) => c.tag === "th" || c.tag === "td")
        .map((c) => text(c).replace(/\|/g, "\\|") || " ")
    )
  }
  if (!rows.length) return ""
  const head = rows[0]
  const lines = [
    `| ${head.join(" | ")} |`,
    `| ${head.map(() => "---").join(" | ")} |`,
    ...rows.slice(1).map((r) => `| ${r.join(" | ")} |`),
  ]
  return lines.join("\n")
}

function all(node, tag, out = []) {
  for (const c of node.children ?? []) {
    if (c.tag === tag) out.push(c)
    all(c, tag, out)
  }
  return out
}

function blocks(node) {
  const out = []
  for (const c of node.children ?? []) out.push(...block(c))
  return out
}

function block(n) {
  if (n.tag === "#text") {
    const t = clean(n.text)
    return t ? [t] : []
  }
  switch (n.tag) {
    case "svg":
    case "script":
    case "style":
      return []
    case "h1":
      return [`# ${text(n)}`]
    case "h2":
      return [`## ${text(n)}`]
    case "h3":
      return [`### ${text(n)}`]
    case "h4":
      return [`#### ${text(n)}`]
    case "p":
      return text(n) ? [text(n)] : []
    case "hr":
      return ["---"]
    case "blockquote":
      return [
        blocks(n)
          .join("\n\n")
          .split("\n")
          .map((l) => "> " + l)
          .join("\n"),
      ]
    case "ul":
    case "ol":
      return [
        n.children
          .filter((c) => c.tag === "li")
          .map((li, i) => `${n.tag === "ol" ? `${i + 1}.` : "-"} ${text(li)}`)
          .join("\n"),
      ]
    case "dl": {
      const items = []
      for (const d of n.children) {
        const dt = findTag(d, "dt")
        const dd = findTag(d, "dd")
        if (dt) items.push(`- **${text(dt)}**: ${dd ? text(dd) : ""}`)
      }
      return [items.join("\n")]
    }
    case "aside": {
      const label = n.children.find((c) => c.tag === "p")
      const rest = n.children.filter((c) => c !== label)
      const body = clean(rest.map(inline).join(" "))
      return [`> **${label ? text(label) : "Note"}:** ${body}`]
    }
    case "figure": {
      const cap = findTag(n, "figcaption")
      const caption = cap ? text(cap) : ""
      const t = findTag(n, "table")
      if (t) return [table(t), ...(caption ? [`*${caption}*`] : [])]
      const img = findTag(n, "img")
      if (img) {
        const alt = img.attrs.alt || caption || "Figure"
        return [
          `![${alt}](${imgSrc(img.attrs.src ?? "")})`,
          ...(caption ? [`*${caption}*`] : []),
        ]
      }
      return caption ? [`*Diagram: ${caption}*`] : []
    }
    case "table":
      return [table(n)]
    default:
      return blocks(n)
  }
}

// ---------- pages ----------
function postFiles(dir = path.join(HTML_ROOT, "writing")) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...postFiles(p))
    else if (e.name.endsWith(".html")) out.push(p)
  }
  return out
}

function convert(file) {
  const route =
    "/" +
    path
      .relative(HTML_ROOT, file)
      .replace(/\\/g, "/")
      .replace(/\.html$/, "")
  const tree = parse(fs.readFileSync(file, "utf8"))
  const article = findTag(tree, "article")
  if (!article) return null // index pages (e.g. /writing) are covered by /llms.txt

  const header = findTag(article, "header")
  const ps = header.children.filter((c) => c.tag === "p")
  const series = ps[0] ? text(ps[0]) : ""
  const title = text(findTag(header, "h1"))
  const lede = ps[1] ? text(ps[1]) : ""
  const meta = ps[2] ? text(ps[2]) : ""
  const body = find(article, (n) => cls(n).split(" ").includes("post"))

  const md = [
    `# ${title}`,
    lede && `> ${lede}`,
    [
      `${series} · by Anush Deokar · ${meta}`,
      `Canonical: ${SITE_URL}${route}`,
      `More about the author: ${SITE_URL}/llms.txt`,
    ].join("  \n"),
    ...blocks(body),
  ]
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")

  return { route, md: md.trim() + "\n" }
}

const files = postFiles()
if (!files.length) {
  console.warn("[llm-md] No built pages found. Run `next build` first.")
  process.exit(0)
}

const stale = []
for (const f of files) {
  const r = convert(f)
  if (!r) continue
  const target = path.join(PUBLIC, r.route + ".md")
  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null
  if (current === r.md) continue
  if (CHECK) {
    stale.push(r.route + ".md")
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, r.md)
    console.log(`[llm-md] wrote public${r.route}.md`)
  }
}

if (CHECK && stale.length) {
  console.warn(
    `\n[llm-md] These Markdown copies are out of date with the posts:\n  ${stale.join(
      "\n  "
    )}\nRun \`npm run llm:md\` and commit the result.\n`
  )
} else if (CHECK) {
  console.log("[llm-md] Markdown copies are up to date.")
}
