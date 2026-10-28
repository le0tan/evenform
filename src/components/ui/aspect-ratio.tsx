import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

/** Reserves media space at the requested aspect ratio. */
function AspectRatio({
  ratio = 16 / 9,
  className,
  style,
  ...props
}: ComponentProps<"div"> & { ratio?: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      className={cn("evenform-aspect-ratio", className)}
      style={{
        aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : 1,
        ...style,
      }}
      {...props}
    />
  )
}

export { AspectRatio }
