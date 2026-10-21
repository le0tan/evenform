import { useState } from "react"
import { CalendarDate } from "@internationalized/date"
import { I18nProvider } from "react-aria-components"
import { PageSection } from "@/components/patterns/layouts"
import { PeriodPicker, getPeriodRange, type PeriodValue } from "@/components/ui/period-picker"

export function PeriodPickerGallery() {
  const [month, setMonth] = useState<PeriodValue | null>({ type: "month", year: 2026, month: 10 })
  const [quarter, setQuarter] = useState<PeriodValue | null>({ type: "quarter", year: 2026, quarter: 4 })
  const [year, setYear] = useState<PeriodValue | null>({ type: "year", year: 2026 })
  const [week, setWeek] = useState<PeriodValue | null>({ type: "week", start: new CalendarDate(2026, 10, 19) })
  const summary = (value: PeriodValue | null) => value ? `${getPeriodRange(value).start} / ${getPeriodRange(value).end}` : "No period selected"
  return <div className="preview-stack catalog" data-testid="period-picker-gallery"><I18nProvider locale="en-GB">
    <PageSection id="example-period-picker" title="Reporting periods" description="Select whole months, quarters, years or weeks. Each option is a real period with date-only boundaries, not a renamed day.">
      <div className="catalog-grid">
        <div className="catalog-example"><PeriodPicker label="Reporting month" mode="month" value={month} onChange={setMonth} name="reportingMonth" minValue={new CalendarDate(2026, 3, 1)} maxValue={new CalendarDate(2027, 9, 30)} isClearable description="Available March 2026 through September 2027." /><p className="field-description" role="status">{summary(month)}</p></div>
        <div className="catalog-example"><PeriodPicker label="Planning quarter" mode="quarter" value={quarter} onChange={setQuarter} minValue={new CalendarDate(2026, 1, 1)} maxValue={new CalendarDate(2027, 12, 31)} isPeriodUnavailable={period => period.type === "quarter" && period.year === 2026 && period.quarter === 2} description="Q2 2026 is closed. Quarter options show their complete month span." /><p className="field-description" role="status">{summary(quarter)}</p></div>
        <div className="catalog-example"><PeriodPicker label="Budget year" mode="year" value={year} onChange={setYear} minValue={new CalendarDate(2020, 1, 1)} maxValue={new CalendarDate(2040, 12, 31)} description="Browse twelve years at a time; arrow keys navigate the year grid." /><p className="field-description" role="status">{summary(year)}</p></div>
        <div className="catalog-example"><PeriodPicker label="Review week" mode="week" value={week} onChange={setWeek} firstDayOfWeek="mon" minValue={new CalendarDate(2026, 10, 1)} maxValue={new CalendarDate(2026, 12, 31)} isClearable description="Monday to Sunday; weeks crossing an unavailable boundary are disabled." /><p className="field-description" role="status">{summary(week)}</p></div>
      </div>
    </PageSection>
    <PageSection title="Locale & field states" description="Dates are formatted by the surrounding locale. The application owns validation, availability and selected values.">
      <div className="catalog-grid">
        <div className="catalog-example"><I18nProvider locale="zh-CN"><PeriodPicker label="账单月份" mode="month" defaultValue={{ type: "month", year: 2026, month: 10 }} labels={{ placeholder: "选择月份", previous: "上一年", next: "下一年", clear: "清除月份" }} isClearable /></I18nProvider></div>
        <div className="catalog-example"><PeriodPicker label="Approved quarter" mode="quarter" defaultValue={{ type: "quarter", year: 2026, quarter: 3 }} isReadOnly description="Read only: the value remains focusable and available for form submission." /></div>
        <div className="catalog-example"><PeriodPicker label="Archived year" mode="year" defaultValue={{ type: "year", year: 2025 }} isDisabled /></div>
        <div className="catalog-example"><PeriodPicker label="Required reporting period" mode="month" placeholderValue={new CalendarDate(2026, 10, 1)} isInvalid errorMessage="Choose a reporting month before continuing." /></div>
      </div>
    </PageSection>
  </I18nProvider></div>
}
