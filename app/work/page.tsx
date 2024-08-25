import React from "react"
import { EyeOpenIcon } from "@radix-ui/react-icons"
import { CodeIcon } from "lucide-react"

import { PROJECTS } from "@/lib/project"
import DesktopMainComponent from "@/components/desktop-main"
import MobileNavbar from "@/components/mobile-navbar"

function WorkPage() {
  return (
    <>
      <main className="flex h-full flex-col py-4 lg:hidden">
        <MobileNavbar />
        <div className="my-4 flex flex-col gap-4 px-6">
          {PROJECTS.map((project, i) => (
            <div
              key={i}
              className="relative transform cursor-pointer overflow-visible rounded-md bg-muted p-[40px] transition-transform duration-300 hover:!opacity-100 group-hover:opacity-70"
            >
              <div>
                <h3 className="text-xl font-bold">{project.name}</h3>
                <h6 className="my-2 text-[10px] text-secondary">
                  {project.techStack}
                </h6>
                <p className="mb-2 text-[12px] text-secondary">
                  {project.description}
                </p>
                <div className="mt-4 flex gap-4 text-[10px] text-secondary">
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
      </main>
      <main className="hidden h-screen overflow-visible p-8 lg:block">
        <DesktopMainComponent />
      </main>
    </>
  )
}

export default WorkPage
