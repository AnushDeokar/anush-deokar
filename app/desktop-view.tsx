"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  CodeIcon,
  EyeOpenIcon,
  GitHubLogoIcon,
  LinkedInLogoIcon,
  OpenInNewWindowIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons"
import { MailIcon } from "lucide-react"

interface Itabs {
  index: string
  name: "WORK" | "CONTACT" | "RESUME"
}
const TABS: Itabs[] = [
  {
    index: "00",
    name: "WORK",
  },
  {
    index: "01",
    name: "RESUME",
  },
  {
    index: "02",
    name: "CONTACT",
  },
]

const SOCIAL_LINKS = [
  {
    name: "Twitter",
    url: "https://x.com/AnushDeokar",
    icon: <TwitterLogoIcon />,
  },
  {
    name: "Github",
    url: "https://github.com/AnushDeokar",
    icon: <GitHubLogoIcon />,
  },
  {
    name: "Mail",
    url: "mailto:deokaranush@gmail.com",
    icon: <MailIcon size={16} />,
  },
  {
    name: "Linkedin",
    url: "https://www.linkedin.com/in/anush-deokar-354aa9214/",
    icon: <LinkedInLogoIcon />,
  },
]

function DesktopView() {
  const [display, setDisplay] = useState<"WORK" | "CONTACT" | "RESUME">("WORK")
  return (
    <div className="relative hidden h-full overflow-visible px-[6%] md:grid-cols-2 lg:grid">
      <div className="flex flex-col gap-4 py-12">
        <div className="flex flex-col p-1">
          <h4 className="text-[16px] font-semibold">Hello, I&apos;m</h4>
          <h2 className="text-[40px] font-bold">Anush Deokar.</h2>
        </div>
        <p className="pr-20 text-[14px] leading-7 text-secondary">
          I&apos;m a <span className="text-primary">full stack developer</span>.
          I'm dedicated to crafting clean, scalable code and delivering
          top-notch software solutions. I&apos;m proficient in{" "}
          <span className="text-primary">Nextjs, Nodejs and Golang</span>.
        </p>
        <div className="mt-8 flex w-1/2 grow flex-col gap-4 text-[10px]">
          {TABS.map((t, i) => (
            <div
              className={`flex cursor-pointer items-center gap-1 transition-all duration-300 ${
                t.name === display
                  ? "font-semibold"
                  : "w-1/2 text-secondary hover:w-full"
              }`}
              onClick={() => setDisplay(t.name)}
              key={i}
            >
              <span>{t.index}</span>
              <div
                className={`h-[1px] flex-grow ${t.name === display ? "bg-primary" : "bg-gray-500"}`}
              ></div>
              <span className="grow">{t.name}</span>
            </div>
          ))}
        </div>
        <div className="mb-4 flex items-center gap-6 pr-4 text-[14px]">
          <Image
            src="/anime.png"
            alt="profile"
            width={60}
            height={60}
            className="rounded-full border border-r-2"
          />
          {SOCIAL_LINKS.map((link, i) => (
            <a
              key={i}
              target="_blank"
              href={link.url}
              rel="noopener noreferrer"
            >
              <div className="flex items-center gap-1">
                {link.icon}
                <span>{link.name}</span>
                <OpenInNewWindowIcon />
              </div>
            </a>
          ))}
        </div>
      </div>
      <div className="scrollbar-hide custom-scrollbar overflow-y-auto pt-12">
        <p className="mb-6 text-[12px] font-bold text-secondary">FEATURED</p>
        <div className="flex flex-col gap-2">
          <div className="z-10 transform overflow-visible rounded-md bg-muted p-[40px] transition-transform duration-300 hover:scale-105">
            <h3 className="text-2xl font-bold">Typeform Clone</h3>
            <h6 className="my-2 text-[10px] text-secondary">
              NextJs + Clerk + Drizzle + Stripe
            </h6>
            <p className="mb-2 text-[12px] text-secondary">
              Typeform clone built with NextJs 14, drizzle orm,, shadcn, framer
              motion, clerk for authentication. It allows users to create form
              and Publish it in different workspaces. It uses server side
              rendering and NextJs server actions along with zod validation.
            </p>
            <div className="mt-4 flex gap-4 text-[12px] text-secondary">
              <div className="flex cursor-pointer items-center gap-1">
                <EyeOpenIcon /> <span>Live</span>
              </div>
              <div className="flex cursor-pointer items-center gap-1">
                <CodeIcon /> <span>Code</span>
              </div>
            </div>
          </div>
          <div className="rounded-md bg-muted p-[40px]">
            <h3 className="text-2xl font-bold">Typeform Clone</h3>
            <h6 className="my-2 text-[10px] text-secondary">
              NextJs + Clerk + Drizzle + Stripe
            </h6>
            <p className="mb-2 text-[12px] text-secondary">
              Typeform clone built with NextJs 14, drizzle orm,, shadcn, framer
              motion, clerk for authentication. It allows users to create form
              and Publish it in different workspaces. It uses server side
              rendering and NextJs server actions along with zod validation.
            </p>
            <div className="mt-4 flex gap-4 text-[12px] text-secondary">
              <div className="flex cursor-pointer items-center gap-1">
                <EyeOpenIcon /> <span>Live</span>
              </div>
              <div className="flex cursor-pointer items-center gap-1">
                <CodeIcon /> <span>Code</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesktopView
