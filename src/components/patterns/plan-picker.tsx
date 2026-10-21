import { useId, type ReactNode } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export interface PlanOption {
  value: string
  name: ReactNode
  description?: ReactNode
  price?: ReactNode
  badge?: ReactNode
  features?: ReactNode
  disabled?: boolean
}
export interface PlanPickerProps {
  options: PlanOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
  name?: string
  className?: string
  orientation?: "vertical" | "horizontal"
}
/** Selects a plan only; purchasing and billing belong to the application. */
export function PlanPicker({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  description,
  disabled,
  name,
  className,
  orientation = "horizontal",
}: PlanPickerProps) {
  const id = useId()
  return (
    <fieldset data-slot="plan-picker" className={className} disabled={disabled}>
      <legend id={`${id}-label`}>{label}</legend>
      {description && (
        <p id={`${id}-description`} data-slot="product-content">
          {description}
        </p>
      )}
      <RadioGroup
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => {
          if (next !== null) onValueChange?.(next)
        }}
        disabled={disabled}
        name={name}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-description` : undefined}
        data-slot="plan-options"
        data-orientation={orientation}
      >
        {options.map((option, index) => (
          <label
            key={option.value}
            data-slot="plan-option"
            data-disabled={option.disabled || disabled || undefined}
          >
            <RadioGroupItem
              value={option.value}
              disabled={option.disabled}
              aria-labelledby={`${id}-${index}-name`}
              aria-describedby={
                option.description ? `${id}-${index}-description` : undefined
              }
            />
            <div data-slot="plan-body">
              <div data-slot="product-meta">
                <span id={`${id}-${index}-name`} data-slot="product-author">
                  {option.name}
                </span>
                {option.badge}
              </div>
              {option.description && (
                <div
                  id={`${id}-${index}-description`}
                  data-slot="product-content"
                >
                  {option.description}
                </div>
              )}
              {option.price && <div data-slot="plan-price">{option.price}</div>}
              {option.features && (
                <div data-slot="plan-features">{option.features}</div>
              )}
            </div>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  )
}
