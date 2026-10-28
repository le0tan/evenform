import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Overlapping grid cells reserve the larger footprint during loading. */
export function LoadingSwap({
  ready,
  skeleton,
  children,
  className,
  label = "Content",
  ...props
}: ComponentProps<"div"> & {
  ready: boolean
  skeleton: ReactNode
  label?: string
}) {
  return (
    <div
      {...props}
      className={cn("evenform-loading-swap", className)}
      data-ready={ready ? "" : undefined}
      aria-busy={!ready}
    >
      <div data-slot="loading-placeholder" aria-hidden="true" inert>
        {skeleton}
      </div>
      <div
        data-slot="loading-content"
        inert={!ready}
        aria-hidden={!ready || undefined}
      >
        {children}
      </div>
      <span className="sr-only" role="status">
        {ready ? `${label} loaded` : `Loading ${label.toLowerCase()}…`}
      </span>
    </div>
  )
}
