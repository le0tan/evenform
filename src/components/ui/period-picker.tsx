import { useId, useRef, useState, type ComponentProps, type ReactNode } from "react"
import { Button, Dialog, DialogTrigger, ListBox, ListBoxItem, Popover, useLocale } from "react-aria-components"
import { CalendarDate, endOfMonth, endOfWeek, getLocalTimeZone, startOfMonth, startOfWeek, today, type DayOfWeek } from "@internationalized/date"
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type PeriodPickerMode = "month" | "quarter" | "year" | "week"
export type PeriodValue =
  | { type: "month"; year: number; month: number }
  | { type: "quarter"; year: number; quarter: 1 | 2 | 3 | 4 }
  | { type: "year"; year: number }
  | { type: "week"; start: CalendarDate }
export type PeriodRange = { start: CalendarDate; end: CalendarDate }

/** Gregorian, date-only boundaries. Week values contain their actual first day,
 * so submitted periods stay unambiguous when a viewer's locale changes. */
export function getPeriodRange(value: PeriodValue): PeriodRange {
  if (value.type === "week") return { start: value.start, end: value.start.add({ days: 6 }) }
  const start = new CalendarDate(value.year, value.type === "month" ? value.month : value.type === "quarter" ? (value.quarter - 1) * 3 + 1 : 1, 1)
  return { start, end: endOfMonth(start.add({ months: value.type === "year" ? 11 : value.type === "quarter" ? 2 : 0 })) }
}

export type PeriodPickerProps = Omit<ComponentProps<"div">, "children" | "onChange" | "defaultValue"> & {
  mode: PeriodPickerMode
  label: ReactNode
  value?: PeriodValue | null
  defaultValue?: PeriodValue | null
  onChange?: (value: PeriodValue | null) => void
  /** First page for an empty picker; a selected value takes precedence. */
  placeholderValue?: CalendarDate
  minValue?: CalendarDate
  maxValue?: CalendarDate
  /** A period must fit fully inside minValue/maxValue to be selectable. */
  isPeriodUnavailable?: (value: PeriodValue) => boolean
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
  isClearable?: boolean
  description?: ReactNode
  errorMessage?: ReactNode
  /** Optional date-only ISO interval, e.g. 2026-04-01/2026-06-30. */
  name?: string
  firstDayOfWeek?: DayOfWeek
  formatPeriod?: (value: PeriodValue, locale: string) => string
  labels?: { placeholder?: string; previous?: string; next?: string; clear?: string }
}

function periodKey(value: PeriodValue) {
  return `${value.type}:${getPeriodRange(value).start.toString()}`
}

/** RAC owns popover dismissal, focus return, listbox arrows and typeahead. */
export function PeriodPicker({ mode, label, value, defaultValue = null, onChange, placeholderValue, minValue, maxValue, isPeriodUnavailable, isDisabled = false, isReadOnly = false, isInvalid = false, isClearable = false, description, errorMessage, name, firstDayOfWeek, formatPeriod, labels, className, ...props }: PeriodPickerProps) {
  const { locale, direction } = useLocale()
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selected = value !== undefined ? value : internalValue
  // A controlled value from another mode is empty, never silently reinterpreted.
  const current = selected?.type === mode ? selected : null
  const preferredDate = current ? getPeriodRange(current).start : placeholderValue ?? today(getLocalTimeZone())
  const initialDate = minValue && preferredDate.compare(minValue) < 0 ? minValue : maxValue && preferredDate.compare(maxValue) > 0 ? maxValue : preferredDate
  const [page, setPage] = useState(initialDate)
  const [open, setOpen] = useState(false)
  const dateFormat = (date: CalendarDate, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { calendar: "gregory", timeZone: "UTC", ...options }).format(date.toDate("UTC"))
  const yearLabel = (year: number) => dateFormat(new CalendarDate(year, 1, 1), { year: "numeric" })
  const display = (period: PeriodValue) => {
    if (formatPeriod) return formatPeriod(period, locale)
    const range = getPeriodRange(period)
    if (period.type === "year") return yearLabel(period.year)
    if (period.type === "month") return dateFormat(range.start, { month: "long", year: "numeric" })
    if (period.type === "quarter") return `Q${new Intl.NumberFormat(locale).format(period.quarter)} ${yearLabel(period.year)}`
    return new Intl.DateTimeFormat(locale, { calendar: "gregory", timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).formatRange(range.start.toDate("UTC"), range.end.toDate("UTC"))
  }
  const unavailable = (period: PeriodValue) => {
    const range = getPeriodRange(period)
    return !!((minValue && range.start.compare(minValue) < 0) || (maxValue && range.end.compare(maxValue) > 0) || isPeriodUnavailable?.(period))
  }
  const yearStart = Math.floor((page.year - 1) / 12) * 12 + 1
  const periods: PeriodValue[] = []
  if (mode === "year") {
    for (let year = yearStart; year <= Math.min(yearStart + 11, 9999); year++) periods.push({ type: "year", year })
  } else if (mode === "quarter") {
    for (const quarter of [1, 2, 3, 4] as const) periods.push({ type: "quarter", year: page.year, quarter })
  } else if (mode === "month") {
    for (let month = 1; month <= 12; month++) periods.push({ type: "month", year: page.year, month })
  } else {
    const lastDay = endOfMonth(page)
    for (let start = startOfWeek(startOfMonth(page), locale, firstDayOfWeek); start.compare(lastDay) <= 0; start = start.add({ days: 7 })) periods.push({ type: "week", start })
  }
  const pageTitle = mode === "year" ? `${yearLabel(yearStart)} – ${yearLabel(Math.min(yearStart + 11, 9999))}` : mode === "week" ? dateFormat(page, { month: "long", year: "numeric" }) : yearLabel(page.year)
  const navigate = (amount: number) => page.add(mode === "week" ? { months: amount } : { years: amount * (mode === "year" ? 12 : 1) })
  const canNavigate = (amount: number) => {
    const next = navigate(amount)
    if (next.compare(page) === 0) return false
    const first = mode === "year" ? new CalendarDate(Math.floor((next.year - 1) / 12) * 12 + 1, 1, 1) : mode === "week" ? startOfWeek(startOfMonth(next), locale, firstDayOfWeek) : new CalendarDate(next.year, 1, 1)
    const last = mode === "year" ? new CalendarDate(Math.min(first.year + 11, 9999), 12, 31) : mode === "week" ? endOfWeek(endOfMonth(next), locale, firstDayOfWeek) : new CalendarDate(next.year, 12, 31)
    return !(minValue && last.compare(minValue) < 0) && !(maxValue && first.compare(maxValue) > 0)
  }
  function change(next: PeriodValue | null) {
    if (isDisabled || isReadOnly) return
    if (value === undefined) setInternalValue(next)
    onChange?.(next)
    setOpen(false)
  }
  const describedBy = [description ? `${id}-description` : null, isInvalid && errorMessage ? `${id}-error` : null, props["aria-describedby"]].filter(Boolean).join(" ") || undefined
  const range = current ? getPeriodRange(current) : null
  return <div {...props} className={cn("evenform-period-field", className)} data-disabled={isDisabled || undefined} data-readonly={isReadOnly || undefined} data-invalid={isInvalid || undefined}>
    <span id={`${id}-label`} className="evenform-field-label">{label}</span>
    <div className="evenform-period-control">
      <DialogTrigger isOpen={open && !isDisabled && !isReadOnly} onOpenChange={next => { if (isDisabled || isReadOnly) return; if (next) setPage(initialDate); setOpen(next) }}>
        <Button ref={trigger} className="evenform-period-trigger" isDisabled={isDisabled} aria-disabled={isReadOnly || undefined} aria-labelledby={`${id}-label ${id}-value`} aria-describedby={describedBy} aria-invalid={isInvalid || undefined}>
          <span id={`${id}-value`} data-placeholder={!current || undefined}>{current ? display(current) : labels?.placeholder ?? "Choose a period…"}</span><CalendarDays size={16} aria-hidden="true" />
        </Button>
        <Popover className="evenform-period-popover" placement="bottom start" offset={4}>
          <Dialog aria-labelledby={`${id}-label`} className="evenform-period-dialog">
            <header className="evenform-period-header">
              <Button className="evenform-period-nav" aria-label={labels?.previous ?? "Previous periods"} isDisabled={!canNavigate(-1)} onPress={() => setPage(navigate(-1))}>{direction === "rtl" ? <ChevronRight size={16} aria-hidden="true" /> : <ChevronLeft size={16} aria-hidden="true" />}</Button>
              <span id={`${id}-heading`} className="evenform-period-heading" aria-live="polite" aria-atomic="true">{pageTitle}</span>
              <Button className="evenform-period-nav" aria-label={labels?.next ?? "Next periods"} isDisabled={!canNavigate(1)} onPress={() => setPage(navigate(1))}>{direction === "rtl" ? <ChevronLeft size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}</Button>
            </header>
            <ListBox key={`${mode}:${pageTitle}`} aria-labelledby={`${id}-label ${id}-heading`} className="evenform-period-list" data-mode={mode} layout={mode === "week" ? "stack" : "grid"} orientation="vertical" autoFocus selectionMode="single" selectionBehavior="toggle" escapeKeyBehavior="none" selectedKeys={current ? [periodKey(current)] : []} disabledKeys={periods.filter(unavailable).map(periodKey)} onSelectionChange={() => {}}>
              {periods.map(period => <ListBoxItem id={periodKey(period)} key={periodKey(period)} textValue={display(period)} className="evenform-period-option" onPress={() => { if (!unavailable(period)) change(period) }}>{mode === "month" && !formatPeriod ? dateFormat(getPeriodRange(period).start, { month: "short" }) : mode === "quarter" && period.type === "quarter" && !formatPeriod ? <><strong>Q{new Intl.NumberFormat(locale).format(period.quarter)}</strong><span>{dateFormat(getPeriodRange(period).start, { month: "short" })} – {dateFormat(getPeriodRange(period).end, { month: "short" })}</span></> : display(period)}</ListBoxItem>)}
            </ListBox>
          </Dialog>
        </Popover>
      </DialogTrigger>
      {isClearable && current && <Button className="evenform-period-clear" aria-label={labels?.clear ?? "Clear period"} isDisabled={isDisabled || isReadOnly} onPress={() => { change(null); trigger.current?.focus() }}><X size={14} aria-hidden="true" /></Button>}
    </div>
    {description && <span id={`${id}-description`} className="evenform-field-description">{description}</span>}
    {isInvalid && errorMessage && <span id={`${id}-error`} className="evenform-field-error">{errorMessage}</span>}
    {name && <input type="hidden" name={name} value={range ? `${range.start.toString()}/${range.end.toString()}` : ""} disabled={isDisabled} />}
  </div>
}
