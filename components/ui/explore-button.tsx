"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ChevronRightIcon } from "@radix-ui/react-icons"

import { Button } from "./button"

function ExploreButton() {
  const router = useRouter()
  return (
    <Button
      variant="outline"
      className="mt-4 flex items-center justify-center gap-2 px-6 py-4"
      onClick={() => router.push("/work")}
    >
      Explore <ChevronRightIcon />
    </Button>
  )
}

export default ExploreButton
