import { useRef, type ComponentProps, type Ref } from "react"
import { SearchIcon, XIcon } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

type SearchFieldProps = Omit<
  ComponentProps<typeof InputGroupInput>,
  "value" | "defaultValue" | "type"
> & {
  value: string
  onValueChange: (value: string) => void
  clearLabel?: string
  groupClassName?: string
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") return ref(value)
  if (ref) ref.current = value
}

/** Controlled search input. Clearing uses the same value callback as typing. */
function SearchField({
  value,
  onValueChange,
  clearLabel = "Clear search",
  groupClassName,
  className,
  onChange,
  ref,
  disabled,
  readOnly,
  ...props
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <InputGroup className={cn("evenform-search-field", groupClassName)}>
      <InputGroupAddon>
        <SearchIcon aria-hidden="true" className="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        {...props}
        type="search"
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        className={className}
        ref={(element) => {
          inputRef.current = element
          return setRef(ref, element)
        }}
        onChange={(event) => {
          onChange?.(event)
          if (!event.defaultPrevented) onValueChange(event.target.value)
        }}
      />
      {value && !readOnly && (
        <InputGroupAddon align="end">
          <button
            type="button"
            className="evenform-input-action"
            aria-label={clearLabel}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onValueChange("")
              inputRef.current?.focus()
            }}
          >
            <XIcon aria-hidden="true" className="size-4" />
          </button>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

export { SearchField }
export type { SearchFieldProps }
