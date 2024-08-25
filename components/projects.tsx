import React from "react"
import { CodeIcon, EyeOpenIcon } from "@radix-ui/react-icons"

import { PROJECTS } from "@/lib/project"

function Projects() {
  return (
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
  )
}

export default Projects
