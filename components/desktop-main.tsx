"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  OpenInNewWindowIcon,
} from "@radix-ui/react-icons"

import { SOCIAL_LINKS } from "@/lib/social"
import { TABS } from "@/lib/tabs"

import Projects from "./projects"
import Skills from "./skills-bar"

function DesktopMainComponent() {
  const [display, setDisplay] = useState<"WORK" | "CONTACT" | "SKILLS">("WORK")

  return (
    <div className="hidden h-full overflow-visible pl-[6%] lg:grid lg:grid-cols-2">
      <div className="flex flex-col gap-4 py-12">
        <div className="flex flex-col p-1">
          <h4 className="text-[16px] font-semibold">Hello, I&apos;m</h4>
          <h2 className="text-[40px] font-bold xl:text-[60px]">
            Anush Deokar.
          </h2>
        </div>
        <p className="pr-20 text-[14px] leading-7 text-secondary">
          I&apos;m a <span className="text-primary">full stack developer</span>.
          I&#39;m dedicated to crafting clean, scalable code and delivering
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
      {display === "WORK" ? <Projects /> : <Skills />}
    </div>
  )
}

export default DesktopMainComponent
