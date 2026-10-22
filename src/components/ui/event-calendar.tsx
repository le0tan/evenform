import type { ComponentProps, Ref } from "react"
import FullCalendar, {
  type CalendarOptions,
  type CalendarRef,
} from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/react/daygrid"
import timeGridPlugin from "@fullcalendar/react/timegrid"
import interactionPlugin from "@fullcalendar/react/interaction"
import classicThemePlugin from "@fullcalendar/react/themes/classic"
import { cn } from "@/lib/utils"
import "./event-calendar.css"

export interface EventCalendarProps extends CalendarOptions {
  ref?: Ref<CalendarRef>
  className?: string
  label?: string
  containerProps?: Omit<ComponentProps<"div">, "children" | "className">
}
/** FullCalendar v7 month/week/day views. Events, persistence, timezone, callbacks,
 * selection, editing and imperative CalendarRef.getApi() remain caller-owned.
 * Supply eventClick for the primitive's built-in Enter/Space event actions. */
export function EventCalendar({
  ref,
  className,
  label = "Event calendar",
  containerProps,
  plugins = [],
  ...props
}: EventCalendarProps) {
  return (
    <div
      data-slot="event-calendar"
      role="region"
      aria-label={label}
      className={cn("evenform-event-calendar", className)}
      {...containerProps}
    >
      <FullCalendar
        ref={ref}
        plugins={[
          classicThemePlugin,
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          ...plugins,
        ]}
        initialView="dayGridMonth"
        height="auto"
        headerToolbar={{
          start: "prev,next today",
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        todayText="Today"
        monthText="Month"
        weekTextLong="Week"
        dayText="Day"
        eventClass={info => cn("evenform-event-calendar-event", info.isSelected && "is-selected", info.isDragging && "is-dragging")}
        popoverClass="evenform-event-calendar-popover"
        headerToolbarClass="evenform-event-calendar-toolbar"
        toolbarTitleClass="evenform-event-calendar-title"
        buttonClass={(info) =>
          cn("evenform-event-calendar-button", info.isSelected && "is-selected")
        }
        dragRevertDuration={0}
        {...props}
      />
    </div>
  )
}
export type { CalendarOptions, CalendarRef }
