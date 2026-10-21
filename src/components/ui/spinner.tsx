import type { ComponentProps, ReactNode } from "react"
import { LoaderCircleIcon } from "lucide-react"
import { cn } from "cn"

type SpinnerProps = ComponentProps<typeof LoaderCircleIcon> & { label?: string }

/** Decorative by default. A label makes this an image, never an automatic live alert. */
function Spinner({ className, label, ...props }: SpinnerProps) {
  return (
    <LoaderCircleIcon
      data-slot="spinner"
      className={cn("evenform-spinner", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    />
  )
}

type LoadingStateProps = ComponentProps<"div"> & {
  label?: ReactNode
  description?: ReactNode
  icon?: ReactNode
}

/** Set role="status" when an asynchronous update merits a polite announcement. */
function LoadingState({
  label = "Loading…",
  description,
  icon,
  children,
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      data-slot="loading-state"
      className={cn("evenform-loading-state", className)}
      {...props}
    >
      <span aria-hidden="true">{icon ?? <Spinner />}</span>
      <div className="evenform-loading-state-content">
        <span>{label}</span>
        {description && (
          <p className="evenform-loading-description">{description}</p>
        )}
        {children}
      </div>
    </div>
  )
}

type BusyRegionProps = ComponentProps<"div"> & {
  busy: boolean
  loadingContent?: ReactNode
}

/** Keeps content in flow. The application owns which controls remain available. */
function BusyRegion({
  busy,
  loadingContent,
  children,
  className,
  ...props
}: BusyRegionProps) {
  return (
    <div
      data-slot="busy-region"
      className={cn("evenform-busy-region", className)}
      {...props}
      aria-busy={busy}
    >
      {busy &&
        (loadingContent === undefined ? <LoadingState /> : loadingContent)}
      {children}
    </div>
  )
}

export {
  Spinner,
  LoadingState,
  BusyRegion,
  type SpinnerProps,
  type LoadingStateProps,
  type BusyRegionProps,
}
