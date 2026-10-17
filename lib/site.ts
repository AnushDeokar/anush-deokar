export const SITE = {
  name: "Anush Deokar",
  role: "Full Stack + AI Engineer",
  url: "https://anushdeokar.xyz",
  email: "deokaranush@gmail.com",
  description:
    "Anush Deokar is a Full Stack + AI Engineer, founding AI engineer at Meridian. RAG pipelines, MCP servers, agents, and small-scale LLM experiments.",
}

export const LINKS = [
  { name: "GitHub", url: "https://github.com/AnushDeokar" },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/anushdeokar/",
  },
  { name: "X", url: "https://x.com/AnushDeokar" },
  { name: "Email", url: `mailto:${SITE.email}` },
]

export interface Role {
  company: string
  title: string
  period?: string
  summary?: string
  points: string[]
  stack: string[]
}

export const EXPERIENCE: Role[] = [
  {
    company: "Meridian",
    title: "Founding AI Engineer",
    period: "Jun 2025 — Present",
    summary:
      "Founding engineer on the AI platform behind Meridian's products, designing systems end to end, from ingestion and retrieval to multi-agent flows in production.",
    points: [
      "Architected the RAG pipelines at the centre of Hermes, Meridian's core AI platform: ingestion, retrieval and grounding that every product agent builds on.",
      "Built the Atlas MCP server, a standalone multi-tenant MCP server that exposes lead and lead-journey data to any MCP-compatible agent, with JWT and service-account auth, tenant resolution shared with hermes-core, and role-aware actions.",
      "Designed and shipped multi-agent flows on Hermes: production chat agents that hold real conversations with customers, plus core contributions to the voice agent.",
      "Built agents that make decisions, not just replies: judging candidates in AI interviews and qualifying leads in conversation, with results delivered to partner systems in real time.",
    ],
    stack: ["Python", "TypeScript", "LangGraph", "MCP", "RAG", "Node.js"],
  },
  {
    company: "Trek Health",
    title: "Software Engineer",
    period: "Mar 2024 — Present",
    points: [
      "Led core development on turning terabytes of complex healthcare data into accessible, actionable insights for clients.",
      "Built a responsive, pixel-perfect product UI on top of systems designed for large-scale data operations, through the product's growth from 0 to $2M+ ARR.",
    ],
    stack: ["TypeScript", "Next.js", "Node.js", "Snowflake", "AWS"],
  },
  {
    company: "matrice.ai",
    title: "Software Engineer",
    period: "Jul 2023 — Apr 2024",
    points: [
      "Led and maintained the main product's React + TypeScript frontend, and backend microservices for image annotation.",
      "Integrated ML models into the product and coordinated testing with the ML team.",
    ],
    stack: ["React", "TypeScript", "Go", "Node.js", "AWS"],
  },
]

export const EDUCATION = {
  school: "IIT Jodhpur",
  degree: "B.Tech, Computer Science and Engineering",
  year: "2023",
}

export const FEATURED_PROJECT = {
  name: "Tiny Frontier",
  tagline: "Cheap memory in small LLMs",
  description:
    "How do modern LLMs keep memory cheap? I'm rebuilding sliding-window attention and attention sinks from scratch, testing them with controlled multi-seed experiments, all on a $0 compute budget.",
  code: "https://github.com/AnushDeokar/tiny-frontier",
  stack: ["PyTorch", "From scratch", "Multi-seed experiments"],
  highlights: [
    {
      value: "1.8e-4",
      label:
        "max logit difference loading Google's Gemma 3 270M into my own code, with identical greedy decoding",
    },
    {
      value: "5.8×",
      label:
        "less KV cache at 4K tokens for a 5:1 local:global model that also beats full attention",
    },
    {
      value: "56",
      label: "tests, 3 seeds per claim, and every run logged with its config",
    },
  ],
}

export const EARLIER_PROJECTS = [
  {
    name: "Typeform clone",
    description:
      "Form builder with workspaces and publishing, server actions and zod validation. 100+ users.",
    stack: "Next.js 14 · Drizzle · Clerk · Stripe",
    live: "https://typeform-clone-three.vercel.app/signin",
    code: "https://github.com/AnushDeokar/typeform-clone",
  },
  {
    name: "Csgrid",
    description:
      "Blogging platform with cover uploads, tags, and search and filtering by tag.",
    stack: "Next.js · Clerk · Prisma · ReactQuill",
    live: "https://csgrid.vercel.app/",
    code: "https://github.com/AnushDeokar/Csgrid",
  },
]
