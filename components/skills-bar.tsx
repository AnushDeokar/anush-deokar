import * as React from "react"
import { GraduationCap } from "lucide-react"

import { Progress } from "@/components/ui/progress"

export default function Skills() {

  const languages = [
    { name: "C/C++", value: 70 },
    { name: "Golang", value: 80 },
    { name: "Python", value: 70 },
    { name: "JavaScript", value: 85 },
  ]

  const frameworks = [
    { name: "NextJs", value: 95 },
    { name: "NodeJS", value: 85 },
    { name: "TRPC", value: 70 },
  ]

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
      {languages.map((language) => (
        <div key={language.name} className="flex flex-col">
          <h4>{language.name}</h4>
          <Progress value={language.value} className="w-full lg:w-[60%]" />
        </div>
      ))}

      <p className="mt-8 text-[12px] font-bold text-secondary">Frameworks</p>
      {frameworks.map((framework) => (
        <div key={framework.name} className="flex flex-col">
          <h4>{framework.name}</h4>
          <Progress value={framework.value} className="w-full lg:w-[60%]" />
        </div>
      ))}
    </div>
  )
}
