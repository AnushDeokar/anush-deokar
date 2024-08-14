interface Project {
  name: string
  description: string
  techStack: string
  liveLink: string
  codeLink: string
}

export const PROJECTS: Project[] = [
  {
    name: "Typeform Clone",
    description:
      "Typeform clone built with NextJs 14, drizzle orm, shadcn, framer motion, clerk for authentication. It allows users to create forms and publish them in different workspaces. It uses server-side rendering and NextJs server actions along with zod validation.",
    techStack: "NextJs + Clerk + Drizzle + Stripe",
    liveLink: "https://typeform-clone-three.vercel.app/signin",
    codeLink: "https://github.com/AnushDeokar/typeform-clone",
  },
  {
    name: "Mooviews",
    description:
      "Movie rating application built using t3 stack, a new UI library called Keep react, framer motion for animation and tmdb API. It allows users to search movies, add them to a watch list, add reviews, view the ratings of the movies, and view the watch list.",
    techStack: "NextJs + trpc + next-auth + Prisma",
    liveLink: "https://mooviews.vercel.app/",
    codeLink: "https://github.com/AnushDeokar/mooviews",
  },
  {
    name: "Csgrid",
    description:
      "Csgrid is a blogging application built using Clerk authentication, Radix UI, Shadcn UI, Uploadthing, TailwindCSS, Prisma ORM, and ReactQuill to write blogs. It allows users to upload cover images, add tags to their blogs, and search/filter blogs by tags.",
    techStack: "NextJs + Clerk + Prisma + ReactQuill",
    liveLink: "https://csgrid.vercel.app/",
    codeLink: "https://github.com/AnushDeokar/Csgrid",
  },
  {
    name: "Chatify",
    description:
      "Chatify is a real-time chat application with a UI inspired by Messenger. It is built using Pusher for real-time communication, Tailwind CSS, and Next-Auth. The project’s UI components are designed without the use of external libraries.",
    techStack: "NextJs + next-auth + Prisma + MongoDB + Pusher",
    liveLink: "https://chatify-tawny.vercel.app/",
    codeLink: "https://github.com/AnushDeokar/chatify",
  },
]
