import { type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** One record's attributes. The container responds to available space, including Sheets. */
export function DescriptionList({ columns = 1, divided = false, className, ...props }: ComponentProps<"dl"> & {
  columns?: 1 | 2
  divided?: boolean
}) {
  return <div data-slot="description-list-container">
    <dl data-slot="description-list" data-columns={columns} data-divided={divided || undefined} className={cn(className)} {...props} />
  </div>
}

/** Keep each label and value together in DOM and visual reading order. */
export function DescriptionItem({ label, children, className, ...props }: ComponentProps<"div"> & { label: ReactNode }) {
  return <div data-slot="description-item" className={cn(className)} {...props}>
    <dt data-slot="description-term">{label}</dt>
    <dd data-slot="description-value">{children}</dd>
  </div>
}
