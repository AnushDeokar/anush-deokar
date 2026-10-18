import { llmsTxt } from "@/lib/llm"

export const dynamic = "force-static"

export function GET() {
  return new Response(llmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
