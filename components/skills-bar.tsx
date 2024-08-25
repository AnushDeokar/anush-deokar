"use client"

import * as React from "react"
import { GraduationCap } from "lucide-react"

import { Progress } from "@/components/ui/progress"

export default function Skills() {
  const [progress, setProgress] = React.useState(13)

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col gap-4 p-4 lg:mt-16">
      <p className="mb-2 text-[12px] font-bold text-secondary">Education</p>
      <div className="flex items-center gap-4">
        <div>
          <GraduationCap />
        </div>
        <div className="flex grow flex-col">
          <h4 className="text-sm font-semibold">
            Indian Institute of Technology (IIT), Jodhpur
          </h4>
          <p className="text-[10px]">
            Btech Computer Science and Engineering, Aug 2019 - May 2023
          </p>
        </div>
      </div>
      <p className="mb-2 mt-4 text-[12px] font-bold text-secondary">
        Languages
      </p>
      <div className="flex flex-col">
        <h4>C/C++</h4>
        <Progress value={progress} className="w-full lg:w-[60%]" />
      </div>

      <div className="flex flex-col">
        <h4>Golang</h4>
        <Progress value={80} className="w-full lg:w-[60%]" />
      </div>

      <div className="flex flex-col">
        <h4>Python</h4>
        <Progress value={70} className="w-full lg:w-[60%]" />
      </div>

      <div className="flex flex-col">
        <h4>Javascript</h4>
        <Progress value={85} className="w-full lg:w-[60%]" />
      </div>

      <p className="mt-8 text-[12px] font-bold text-secondary">Frameworks</p>

      <div className="flex flex-col">
        <h4>NextJs</h4>
        <Progress value={95} className="w-full lg:w-[60%]" />
      </div>

      <div className="flex flex-col">
        <h4>NodeJS</h4>
        <Progress value={85} className="lg:w-[60%]] w-full" />
      </div>

      <div className="flex flex-col">
        <h4>trpc</h4>
        <Progress value={70} className="w-full lg:w-[60%]" />
      </div>
    </div>
  )
}
