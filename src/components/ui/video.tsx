import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

/** Uses native playback, captions, keyboard controls and browser media settings. */
function Video({
  className,
  controls = true,
  preload = "metadata",
  playsInline = true,
  children,
  ...props
}: ComponentProps<"video">) {
  return (
    <video
      data-slot="video"
      className={cn("evenform-video", className)}
      controls={controls}
      preload={preload}
      playsInline={playsInline}
      {...props}
    >
      {children}
    </video>
  )
}

export { Video }
