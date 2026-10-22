import type { ReactNode } from "react"
import type { Select as SelectPrimitive } from "@base-ui/react/select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface SelectOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface OptionSelectProps extends Omit<
  SelectPrimitive.Root.Props<string, false>,
  "items" | "children" | "multiple"
> {
  options: readonly SelectOption[]
  placeholder?: ReactNode
  triggerProps?: React.ComponentProps<typeof SelectTrigger>
  contentProps?: React.ComponentProps<typeof SelectContent>
}

/** One option declaration supplies labels even before lazy content mounts.
 * Use the Select parts for groups, object values, multi-select or custom lists. */
export function OptionSelect({
  options,
  placeholder,
  triggerProps,
  contentProps,
  ...props
}: OptionSelectProps) {
  return (
    <Select {...props} items={options}>
      <SelectTrigger {...triggerProps}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent {...contentProps}>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
