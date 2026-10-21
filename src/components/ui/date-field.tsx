import type { ComponentProps, ReactNode, RefAttributes } from "react"
import { DateField as AriaDateField, TimeField as AriaTimeField, DateInput as AriaDateInput, DateSegment as AriaDateSegment, Label, Text, FieldError, composeRenderProps, type DateFieldProps, type TimeFieldProps, type DateInputProps, type DateSegmentProps, type TimeValue } from "react-aria-components"
import type { DateValue } from "@internationalized/date"
import { cn } from "@/lib/utils"

export type DateFieldDecoration = { label?: ReactNode; description?: ReactNode; errorMessage?: ComponentProps<typeof FieldError>["children"] }
export function DateSegment({ className, ...props }: DateSegmentProps & RefAttributes<HTMLDivElement>) {
  return <AriaDateSegment {...props} className={composeRenderProps(className, value => cn("evenform-date-segment", value))} />
}
export function DateInput({ className, ...props }: DateInputProps & RefAttributes<HTMLDivElement>) {
  return <AriaDateInput {...props} className={composeRenderProps(className, value => cn("evenform-date-input", value))} />
}
export function DateSegments({ slot }: { slot?: string }) {
  return <DateInput slot={slot}>{segment => <DateSegment segment={segment} />}</DateInput>
}
export function DateField<T extends DateValue>({ className, label, description, errorMessage, children, ...props }: DateFieldProps<T> & DateFieldDecoration & RefAttributes<HTMLDivElement>) {
  return <AriaDateField {...props} className={composeRenderProps(className, value => cn("evenform-date-field", value))}>{children ?? <>{label && <Label className="evenform-field-label">{label}</Label>}<div className="evenform-date-control"><DateSegments /></div>{description && <Text slot="description" className="evenform-field-description">{description}</Text>}<FieldError className="evenform-field-error">{errorMessage}</FieldError></>}</AriaDateField>
}
export function TimeField<T extends TimeValue>({ className, label, description, errorMessage, children, ...props }: TimeFieldProps<T> & DateFieldDecoration & RefAttributes<HTMLDivElement>) {
  return <AriaTimeField {...props} className={composeRenderProps(className, value => cn("evenform-date-field", value))}>{children ?? <>{label && <Label className="evenform-field-label">{label}</Label>}<div className="evenform-date-control"><DateSegments /></div>{description && <Text slot="description" className="evenform-field-description">{description}</Text>}<FieldError className="evenform-field-error">{errorMessage}</FieldError></>}</AriaTimeField>
}
export { AriaDateField as DateFieldRoot, AriaTimeField as TimeFieldRoot, Label as DateFieldLabel, Text as DateFieldText, FieldError as DateFieldError }
export { I18nProvider as DateLocaleProvider } from "react-aria-components"
export type { DateFieldProps, TimeFieldProps, TimeValue }
