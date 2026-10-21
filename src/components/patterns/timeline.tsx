import { type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Timeline({ className, ...props }: ComponentProps<"ol">) {
  return <ol role="list" data-slot="timeline" className={cn(className)} {...props} />
}

/** Pass a native <time dateTime="…"> as time when machine-readable dates apply. */
export function TimelineItem({ icon, title, time, children, className, ...props }: Omit<ComponentProps<"li">, "title"> & {
  icon?: ReactNode
  title: ReactNode
  time?: ReactNode
}) {
  return <li data-slot="timeline-item" className={cn(className)} {...props}>
    <span data-slot="timeline-marker" aria-hidden="true">{icon}</span>
    <div data-slot="timeline-content">
      <div data-slot="timeline-heading"><div data-slot="timeline-title">{title}</div>{time && <div data-slot="timeline-time">{time}</div>}</div>
      {children && <div data-slot="timeline-body">{children}</div>}
    </div>
  </li>
}
