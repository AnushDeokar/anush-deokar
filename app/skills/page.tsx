import React from "react"
import { EyeOpenIcon } from "@radix-ui/react-icons"
import { CodeIcon } from "lucide-react"

import { PROJECTS } from "@/lib/project"
import DesktopMainComponent from "@/components/desktop-main"
import MobileNavbar from "@/components/mobile-navbar"
import Skills from "@/components/skills-bar"

function WorkPage() {
  return (
    <>
      <main className="flex h-full flex-col py-4 lg:hidden">
        <MobileNavbar />
        <div className="flex">
          <Skills />
        </div>
      </main>
      <main className="hidden h-screen overflow-visible p-8 lg:block">
        <DesktopMainComponent />
      </main>
    </>
  )
}

export default WorkPage
