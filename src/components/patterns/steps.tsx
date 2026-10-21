import { type ComponentProps, type ReactNode } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Steps({ orientation = "horizontal", className, ...props }: ComponentProps<"ol"> & {
  orientation?: "horizontal" | "vertical"
}) {
  return <div data-slot="steps-container"><ol role="list" data-slot="steps" data-orientation={orientation} className={cn(className)} {...props} /></div>
}

/** A progress indicator, not a navigation widget. Compose a link or button in
 * title only when the application supports jumping to that step. */
export function Step({ title, description, status = "upcoming", statusLabel, marker, children, className, ...props }: Omit<ComponentProps<"li">, "title"> & {
  title: ReactNode
  description?: ReactNode
  status?: "upcoming" | "current" | "complete" | "error"
  statusLabel?: string
  marker?: ReactNode
}) {
  const label = statusLabel ?? { upcoming: "Not started", current: "Current step", complete: "Completed", error: "Needs attention" }[status]
  return <li data-slot="step" data-status={status} className={cn(className)} aria-current={status === "current" ? "step" : undefined} {...props}>
    <span data-slot="step-marker" aria-hidden="true">{marker ?? (status === "complete" ? <Check /> : status === "error" ? <X /> : <span data-slot="step-number" />)}</span>
    <div data-slot="step-content">
      <div data-slot="step-title">{title}<span className="sr-only"> — {label}</span></div>
      {description && <div data-slot="step-description">{description}</div>}
      {children}
    </div>
  </li>
}
