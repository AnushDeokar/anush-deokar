"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  CodeIcon,
  EyeOpenIcon,
  OpenInNewWindowIcon,
} from "@radix-ui/react-icons"

import { PROJECTS } from "@/lib/project"
import { SOCIAL_LINKS } from "@/lib/social"
import { TABS } from "@/lib/tabs"

function DesktopView() {
  const [display, setDisplay] = useState<"WORK" | "CONTACT" | "RESUME">("WORK")
  return (
    <div className="hidden h-full overflow-visible pl-[6%] lg:grid lg:grid-cols-2">
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
                className={`h-[1px] flex-grow ${
                  t.name === display ? "bg-primary" : "bg-gray-500"
                }`}
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
                <link.icon />
                <span>{link.name}</span>
                <OpenInNewWindowIcon />
              </div>
            </a>
          ))}
        </div>
      </div>
      <div className="scrollbar-hide custom-scrollbar z-10 w-full overflow-visible overflow-y-auto px-[6%] pt-12">
        <p className="mb-6 text-[12px] font-bold text-secondary">FEATURED</p>
        <div className="group flex flex-col gap-2">
          {PROJECTS.map((project, i) => (
            <div
              key={i}
              className="relative transform cursor-pointer overflow-visible rounded-md bg-muted p-[40px] transition-transform duration-300 hover:scale-[1.05] hover:!opacity-100 group-hover:opacity-70"
            >
              <div>
                <h3 className="text-2xl font-bold">{project.name}</h3>
                <h6 className="my-2 text-[10px] text-secondary">
                  {project.techStack}
                </h6>
                <p className="mb-2 text-[14px] text-secondary">
                  {project.description}
                </p>
                <div className="mt-4 flex gap-4 text-[12px] text-secondary">
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex cursor-pointer items-center gap-1 hover:text-primary"
                  >
                    <EyeOpenIcon /> <span>Live</span>
                  </a>
                  <a
                    href={project.codeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex cursor-pointer items-center gap-1 hover:text-primary"
                  >
                    <CodeIcon /> <span>Code</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DesktopView
