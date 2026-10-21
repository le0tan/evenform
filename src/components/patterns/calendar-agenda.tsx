import { useId, type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Dates, event order and timezone formatting are supplied by the application. */
export function CalendarAgenda({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="calendar-agenda"
      className={cn("evenform-calendar-agenda", className)}
      {...props}
    />
  )
}
export interface AgendaDayProps extends Omit<
  ComponentProps<"section">,
  "title"
> {
  date: ReactNode
  actions?: ReactNode
  empty?: ReactNode
}
export function AgendaDay({
  date,
  actions,
  empty,
  children,
  className,
  ...props
}: AgendaDayProps) {
  const id = useId()
  return (
    <section
      data-slot="agenda-day"
      aria-labelledby={id}
      className={className}
      {...props}
    >
      <header data-slot="agenda-day-header">
        <h3 id={id}>{date}</h3>
        {actions}
      </header>
      {empty ?? <ol data-slot="agenda-events">{children}</ol>}
    </section>
  )
}
export interface AgendaEventProps extends Omit<ComponentProps<"li">, "title"> {
  title: ReactNode
  time: ReactNode
  meta?: ReactNode
  actions?: ReactNode
}
export function AgendaEvent({
  title,
  time,
  meta,
  actions,
  children,
  className,
  ...props
}: AgendaEventProps) {
  return (
    <li data-slot="agenda-event" className={className} {...props}>
      <div data-slot="agenda-time">{time}</div>
      <div data-slot="agenda-event-body">
        <div data-slot="agenda-event-title">{title}</div>
        {meta && <div data-slot="agenda-event-meta">{meta}</div>}
        {children && <div data-slot="agenda-event-description">{children}</div>}
        {actions && <div data-slot="agenda-event-actions">{actions}</div>}
      </div>
    </li>
  )
}
