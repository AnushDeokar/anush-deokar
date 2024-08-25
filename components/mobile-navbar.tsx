"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Cross2Icon,
  HamburgerMenuIcon,
  OpenInNewWindowIcon,
} from "@radix-ui/react-icons"

import { Button } from "./ui/button"

function MobileNavbar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  return (
    <div className="flex w-full items-center justify-between p-4 py-2">
      <h3 className="text-lg font-bold">Anush.</h3>
      <Button
        className="z-40 hover:bg-background"
        variant="ghost"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <Cross2Icon fontSize={24} />
        ) : (
          <HamburgerMenuIcon fontSize={24} />
        )}
      </Button>
      {open && (
        <div className="fixed top-0 z-40 mt-20 flex h-screen w-full flex-col items-center gap-10 bg-background text-lg text-secondary">
          <div
            className="cursor-pointer hover:text-primary"
            onClick={() => router.push("/")}
          >
            Home
          </div>
          <div
            className="cursor-pointer hover:text-primary"
            onClick={() => router.push("/work")}
          >
            Work
          </div>
          <div
            className="cursor-pointer hover:text-primary"
            onClick={() => router.push("/skills")}
          >
            Skills
          </div>
          <a
            target="_blank"
            href="mailto:deokaranush@gmail.com"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-2 hover:text-primary"
          >
            Mail <OpenInNewWindowIcon />
          </a>
        </div>
      )}
    </div>
  )
}

export default MobileNavbar
