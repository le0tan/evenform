import { useId, useState, type ComponentProps, type ReactNode, type CSSProperties } from "react"
import { StarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type RatingProps = Omit<
  ComponentProps<"fieldset">,
  "onChange" | "value" | "defaultValue"
> & {
  label: string
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  max?: number
  name?: string
  readOnly?: boolean
  required?: boolean
  allowClear?: boolean
  clearLabel?: string
  unratedLabel?: string
  getValueLabel?: (value: number, max: number) => string
  icon?: ReactNode
}

/** Native radios provide form submission and platform keyboard navigation. Zero means unrated. */
function Rating({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  name,
  readOnly = false,
  required,
  allowClear = false,
  clearLabel = "Clear rating",
  unratedLabel = "Not rated",
  disabled,
  getValueLabel = (score, total) => `${score} of ${total} stars`,
  icon,
  className,
  ...props
}: RatingProps) {
  const id = useId()
  const [internalValue, setInternalValue] = useState(defaultValue)
  const total = Math.max(1, Number.isFinite(max) ? Math.floor(max) : 5)
  const selected = Math.max(0, Math.min(total, value ?? internalValue))
  const summary = selected === 0 ? unratedLabel : getValueLabel(selected, total)
  return (
    <fieldset
      {...props}
      disabled={disabled}
      data-slot="rating"
      data-readonly={readOnly || undefined}
      className={cn("evenform-rating", className)}
    >
      <legend className="evenform-rating-label">{label}</legend>
      {readOnly ? (
        <span className="evenform-rating-values" aria-hidden="true">
          {Array.from({ length: total }, (_, index) => (
            <span
              key={index}
              className="evenform-rating-option"
              aria-hidden="true"
            >
              <span className="evenform-rating-symbol">{icon ?? <StarIcon />}<span className="evenform-rating-fraction" style={{"--_rating-fill": `${Math.max(0, Math.min(1, selected - index)) * 100}%`} as CSSProperties}>{icon ?? <StarIcon />}</span></span>
            </span>
          ))}
        </span>
      ) : (
        <div className="evenform-rating-values">
          {Array.from({ length: total }, (_, index) => {
            const score = index + 1
            return (
              <label
                key={score}
                className="evenform-rating-option"
                data-filled={score <= selected || undefined}
              >
                <input
                  type="radio"
                  required={required}
                  name={name ?? id}
                  value={score}
                  checked={selected === score}
                  aria-label={getValueLabel(score, total)}
                  onChange={() => {
                    if (value === undefined) setInternalValue(score)
                    onValueChange?.(score)
                  }}
                />
                <span aria-hidden="true">{icon ?? <StarIcon />}</span>
              </label>
            )
          })}
        </div>
      )}
      {allowClear && !readOnly && <Button type="button" size="sm" variant="ghost" disabled={disabled || selected === 0} onClick={() => {if(value === undefined) setInternalValue(0); onValueChange?.(0)}}>{clearLabel}</Button>}
      <span
        className="evenform-rating-summary"
        aria-live={readOnly ? undefined : "polite"}
      >
        {summary}
      </span>
    </fieldset>
  )
}

export { Rating, type RatingProps }
