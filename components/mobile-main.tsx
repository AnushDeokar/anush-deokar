import React from "react"
import Image from "next/image"

import { SOCIAL_LINKS } from "@/lib/social"

import MobileNavbar from "./mobile-navbar"
import ExploreButton from "./ui/explore-button"

function MobileMainComponent() {
  return (
    <div className="flex h-full flex-col items-center lg:hidden">
      <MobileNavbar />
      <div className="mb-[40px] flex grow flex-col items-center justify-center p-8 text-center">
        <Image
          src="/anime.png"
          alt="profile"
          width={60}
          height={60}
          className="my-4 rounded-full border border-r-2"
        />
        <h4 className="text-[12px] font-semibold">Hello, I&apos;m</h4>
        <h2 className="text-[24px] font-bold">Anush Deokar.</h2>
        <p className="max-w-[400px] text-[14px] leading-7 text-secondary">
          I&apos;m a <span className="text-primary">full stack developer</span>.
          I&#39;m dedicated to crafting clean, scalable code and delivering
          top-notch software solutions. I&apos;m proficient in{" "}
          <span className="text-primary">Nextjs, Nodejs and Golang</span>.
        </p>
        <ExploreButton />
      </div>
      <div className="mb-4 flex w-full items-center justify-center gap-4">
        {SOCIAL_LINKS.map((link, i) => (
          <a key={i} target="_blank" href={link.url} rel="noopener noreferrer">
            <div className="flex w-full items-center justify-between gap-20">
              <link.icon height="25px" width="25px" className="mx-2" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default MobileMainComponent
