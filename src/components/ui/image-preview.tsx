import { useState, type ComponentProps, type ReactElement } from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MaximizeIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Image } from "@/components/ui/image"
import { cn } from "@/lib/utils"

type PreviewImage = { src: string; alt: string; caption?: string }
type ImagePreviewProps = Omit<ComponentProps<typeof Dialog>, "children"> & {
  images: PreviewImage[]
  trigger?: ReactElement
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  title?: string
  contentProps?: ComponentProps<typeof DialogContent>
}
function PreviewStage({ image }: { image: PreviewImage }) {
  const [zoom, setZoom] = useState(1)
  return (
    <>
      <div
        className="evenform-image-preview-stage"
        data-zoomed={zoom > 1 || undefined}
        tabIndex={zoom > 1 ? 0 : undefined}
        aria-label={zoom > 1 ? "Zoomed image, scroll to pan" : undefined}
      >
        <Image
          src={image.src}
          alt={image.alt}
          containerProps={{
            className: "evenform-image-preview-media",
            style:
              zoom > 1
                ? { width: `${zoom * 100}%`, maxWidth: "none", height: "auto" }
                : undefined,
          }}
        />
      </div>
      <div
        className="evenform-image-preview-zoom"
        role="group"
        aria-label="Image zoom"
      >
        <Button
          size="icon-sm"
          variant="outline"
          aria-label="Zoom out"
          disabled={zoom <= 1}
          onClick={() => setZoom(Math.max(1, zoom - 0.5))}
        >
          <ZoomOutIcon />
        </Button>
        <output aria-live="polite">{Math.round(zoom * 100)}%</output>
        <Button
          size="icon-sm"
          variant="outline"
          aria-label="Zoom in"
          disabled={zoom >= 3}
          onClick={() => setZoom(Math.min(3, zoom + 0.5))}
        >
          <ZoomInIcon />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setZoom(1)}
          disabled={zoom === 1}
        >
          <MaximizeIcon />
          Fit
        </Button>
      </div>
    </>
  )
}

/** Base UI Dialog owns focus trapping, Escape, dismissal and focus return. */
function ImagePreview({
  images,
  trigger,
  index,
  defaultIndex = 0,
  onIndexChange,
  title = "Image preview",
  contentProps,
  ...props
}: ImagePreviewProps) {
  const [internalIndex, setInternalIndex] = useState(defaultIndex)
  const current = Math.max(
    0,
    Math.min(images.length - 1, index ?? internalIndex)
  )
  const image = images[current]
  function select(next: number) {
    if (index === undefined) setInternalIndex(next)
    onIndexChange?.(next)
  }
  return (
    <Dialog {...props}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent
        {...contentProps}
        className={(state) => cn(
          "evenform-image-preview",
          typeof contentProps?.className === "function"
            ? contentProps.className(state)
            : contentProps?.className
        )}
        onKeyDown={(event) => {
          contentProps?.onKeyDown?.(event)
          if (
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            (event.target as HTMLElement).closest(
              "input, textarea, select, [contenteditable=true], [data-zoomed]"
            )
          )
            return
          if (event.key === "ArrowLeft" && current > 0) {
            event.preventDefault()
            select(current - 1)
          }
          if (event.key === "ArrowRight" && current < images.length - 1) {
            event.preventDefault()
            select(current + 1)
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {image?.caption ?? image?.alt ?? "No images to preview."}
          </DialogDescription>
        </DialogHeader>
        {image ? (
          <PreviewStage key={`${current}:${image.src}`} image={image} />
        ) : (
          <p className="text-muted-foreground">No images available.</p>
        )}
        {images.length > 1 && (
          <div className="evenform-image-preview-navigation">
            <Button
              variant="outline"
              size="sm"
              disabled={current === 0}
              onClick={() => select(current - 1)}
            >
              <ArrowLeftIcon />
              Previous
            </Button>
            <span role="status" className="evenform-image-preview-position">
              {current + 1} of {images.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={current === images.length - 1}
              onClick={() => select(current + 1)}
            >
              Next
              <ArrowRightIcon />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { ImagePreview, type ImagePreviewProps, type PreviewImage }
