"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle colour theme"
      className={cn(
        "relative grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground",
        className
      )}
    >
      <Sun className="h-[15px] w-[15px] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[15px] w-[15px] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </button>
  )
}
