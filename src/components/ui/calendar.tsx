import type { RefAttributes } from "react"
import {
  Calendar as AriaCalendar, RangeCalendar as AriaRangeCalendar, CalendarGrid as AriaCalendarGrid,
  CalendarGridHeader, CalendarGridBody, CalendarHeaderCell, CalendarCell, Heading, Button,
  composeRenderProps, type CalendarProps, type RangeCalendarProps, type CalendarGridProps,
} from "react-aria-components"
import type { DateValue } from "@internationalized/date"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function CalendarHeader() {
  return <header className="evenform-calendar-header"><Button slot="previous" className="evenform-calendar-nav"><ChevronLeft size={16} aria-hidden="true" /></Button><Heading /><Button slot="next" className="evenform-calendar-nav"><ChevronRight size={16} aria-hidden="true" /></Button></header>
}
export function CalendarGrid({ className, ...props }: Omit<CalendarGridProps, "children"> & RefAttributes<HTMLTableElement>) {
  return <AriaCalendarGrid className={cn("evenform-calendar-grid", className)} {...props}>
    <CalendarGridHeader>{(day) => <CalendarHeaderCell className="evenform-calendar-weekday">{day}</CalendarHeaderCell>}</CalendarGridHeader>
    <CalendarGridBody>{(date) => <CalendarCell date={date} className="evenform-calendar-cell" />}</CalendarGridBody>
  </AriaCalendarGrid>
}
export function Calendar<T extends DateValue>({ className, children, ...props }: CalendarProps<T> & RefAttributes<HTMLDivElement>) {
  return <AriaCalendar {...props} className={composeRenderProps(className, (value) => cn("evenform-calendar", value))}>{children ?? <><CalendarHeader /><CalendarGrid /></>}</AriaCalendar>
}
export function RangeCalendar<T extends DateValue>({ className, children, ...props }: RangeCalendarProps<T> & RefAttributes<HTMLDivElement>) {
  return <AriaRangeCalendar {...props} className={composeRenderProps(className, (value) => cn("evenform-calendar evenform-range-calendar", value))}>{children ?? <><CalendarHeader /><CalendarGrid /></>}</AriaRangeCalendar>
}
// Raw parts retain advanced multi-month layouts and all collection/render props.
export { AriaCalendar as CalendarRoot, AriaRangeCalendar as RangeCalendarRoot, AriaCalendarGrid as CalendarGridRoot, CalendarGridHeader, CalendarGridBody, CalendarHeaderCell, CalendarCell }
export type { CalendarProps, RangeCalendarProps, DateValue }
