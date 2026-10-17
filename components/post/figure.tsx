"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

export function Figure({
  src,
  alt,
  caption,
  width,
  height,
  wide = false,
  unoptimized = false,
  imageClassName,
  frameClassName,
}: {
  src: string
  alt: string
  caption?: React.ReactNode
  width: number
  height: number
  wide?: boolean
  unoptimized?: boolean
  imageClassName?: string
  frameClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [open])

  const maxHeight = caption ? "100dvh - 9rem" : "100dvh - 5.5rem"

  return (
    <figure className={wide ? "!my-10 sm:-mx-10" : "!my-10"}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="block w-full cursor-zoom-in text-left"
      >
        <div
          className={cn(
            "chart-frame overflow-hidden rounded-lg border p-2 sm:p-3",
            frameClassName
          )}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            unoptimized={unoptimized}
            className={cn("h-auto w-full", imageClassName)}
            sizes="(min-width: 768px) 800px, 100vw"
          />
        </div>
      </button>
      {caption && (
        <figcaption className="mt-3 text-[13.5px] leading-snug text-muted">
          {caption}
        </figcaption>
      )}
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(30_8%_7%/0.86)] p-4 sm:p-8"
            onClick={() => setOpen(false)}
          >
            <button
              ref={closeRef}
              type="button"
              aria-label="Close image"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-background text-foreground shadow-sm transition-colors hover:bg-surface"
            >
              <X className="h-4 w-4" />
            </button>
            <figure
              className="flex max-h-full max-w-full flex-col items-center"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                unoptimized={unoptimized}
                className="chart-frame h-auto rounded-lg border object-contain"
                style={{
                  width: `min(calc(100vw - 2.5rem), calc((${maxHeight}) * ${width / height}))`,
                  height: "auto",
                  maxWidth: "none",
                }}
                sizes="100vw"
              />
              {caption && (
                <figcaption className="mt-3 max-w-prose text-center text-[13.5px] leading-snug text-[hsl(38_18%_90%/0.82)]">
                  {caption}
                </figcaption>
              )}
            </figure>
          </div>,
          document.body
        )}
    </figure>
  )
}
