import type { RefAttributes } from "react"
import { DatePicker as AriaDatePicker, DateRangePicker as AriaDateRangePicker, Label, Group, Button, Popover, Dialog, Text, FieldError, composeRenderProps, type DatePickerProps, type DateRangePickerProps } from "react-aria-components"
import type { DateValue } from "@internationalized/date"
import { CalendarDays } from "lucide-react"
import { Calendar, RangeCalendar } from "@/components/ui/calendar"
import { DateSegments, type DateFieldDecoration } from "@/components/ui/date-field"
import { cn } from "@/lib/utils"

export function DatePicker<T extends DateValue>({ className, label, description, errorMessage, children, ...props }: DatePickerProps<T> & DateFieldDecoration & RefAttributes<HTMLDivElement>) {
  return <AriaDatePicker {...props} className={composeRenderProps(className, value => cn("evenform-date-field", value))}>{children ?? <>{label && <Label className="evenform-field-label">{label}</Label>}<Group className="evenform-date-control"><DateSegments /><Button className="evenform-date-trigger"><CalendarDays size={16} aria-hidden="true" /></Button></Group>{description && <Text slot="description" className="evenform-field-description">{description}</Text>}<FieldError className="evenform-field-error">{errorMessage}</FieldError><Popover className="evenform-date-popover" placement="bottom start" offset={4}><Dialog className="evenform-date-dialog"><Calendar /></Dialog></Popover></>}</AriaDatePicker>
}
export function DateRangePicker<T extends DateValue>({ className, label, description, errorMessage, children, ...props }: DateRangePickerProps<T> & DateFieldDecoration & RefAttributes<HTMLDivElement>) {
  return <AriaDateRangePicker {...props} className={composeRenderProps(className, value => cn("evenform-date-field", value))}>{children ?? <>{label && <Label className="evenform-field-label">{label}</Label>}<Group className="evenform-date-control evenform-date-range-control"><DateSegments slot="start" /><span className="evenform-date-range-separator" aria-hidden="true">–</span><DateSegments slot="end" /><Button className="evenform-date-trigger"><CalendarDays size={16} aria-hidden="true" /></Button></Group>{description && <Text slot="description" className="evenform-field-description">{description}</Text>}<FieldError className="evenform-field-error">{errorMessage}</FieldError><Popover className="evenform-date-popover" placement="bottom start" offset={4}><Dialog className="evenform-date-dialog"><RangeCalendar /></Dialog></Popover></>}</AriaDateRangePicker>
}
export { AriaDatePicker as DatePickerRoot, AriaDateRangePicker as DateRangePickerRoot }
export type { DatePickerProps, DateRangePickerProps }
