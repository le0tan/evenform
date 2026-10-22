import { useState, type ComponentProps, type ReactNode } from "react"
import { ImageOffIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type ImageProps = ComponentProps<"img"> & {
  alt: string
  fallback?: ReactNode
  loadingFallback?: ReactNode
  errorLabel?: string
  containerProps?: ComponentProps<"span">
}

function ImageState({
  alt,
  fallback,
  loadingFallback,
  errorLabel = "Image unavailable",
  containerProps,
  className,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  )
  return (
    <span
      {...containerProps}
      data-slot="image"
      data-status={status}
      className={cn("evenform-image", containerProps?.className)}
    >
      <img
        {...props}
        alt={alt}
        className={cn("evenform-image-element", className)}
        hidden={status === "error" || props.hidden}
        onLoad={(event) => {
          setStatus("loaded")
          onLoad?.(event)
        }}
        onError={(event) => {
          setStatus("error")
          onError?.(event)
        }}
      />
      {status === "loading" && (
        <span className="evenform-image-placeholder" aria-hidden="true">
          {loadingFallback ?? <span className="evenform-image-loading" />}
        </span>
      )}
      {status === "error" && (
        <span
          className="evenform-image-placeholder"
          role={alt ? "img" : undefined}
          aria-label={alt ? `${errorLabel}: ${alt}` : undefined}
          aria-hidden={!alt || undefined}
        >
          {fallback ?? (
            <span className="evenform-image-error">
              <ImageOffIcon aria-hidden="true" />
              <span aria-hidden={!!alt}>{errorLabel}</span>
            </span>
          )}
        </span>
      )}
    </span>
  )
}

/** Native image attributes belong to the image; use containerProps for layout. */
function Image(props: ImageProps) {
  return (
    <ImageState key={`${props.src ?? ""}:${props.srcSet ?? ""}`} {...props} />
  )
}

export { Image, type ImageProps }
