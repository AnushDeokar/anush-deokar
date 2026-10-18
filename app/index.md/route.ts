import { profileMarkdown } from "@/lib/llm"

export const dynamic = "force-static"

export function GET() {
  return new Response(profileMarkdown() + "\n", {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
