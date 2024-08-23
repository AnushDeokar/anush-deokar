"use client"

import React, { useState } from "react"
import { Cross2Icon, HamburgerMenuIcon } from "@radix-ui/react-icons"

import { Button } from "./ui/button"

function MobileNavbar() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex w-full items-center justify-between px-4">
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
        <div className="fixed top-0 z-20 mt-20 flex h-screen w-screen flex-col items-center gap-10 bg-background text-lg text-secondary">
          <div className="cursort-pointer hover:text-primary">Work</div>
          <div className="cursort-pointer hover:text-primary">Skills</div>
          <div className="cursort-pointer hover:text-primary">Contact</div>
        </div>
      )}
    </div>
  )
}

export default MobileNavbar
