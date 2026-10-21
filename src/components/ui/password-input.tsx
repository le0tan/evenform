import { useRef, useState, type ComponentProps, type Ref } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

type PasswordInputProps = Omit<
  ComponentProps<typeof InputGroupInput>,
  "type"
> & {
  visible?: boolean
  defaultVisible?: boolean
  onVisibilityChange?: (visible: boolean) => void
  showLabel?: string
  hideLabel?: string
  groupClassName?: string
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") return ref(value)
  if (ref) ref.current = value
}

function PasswordInput({
  visible: controlledVisible,
  defaultVisible = false,
  onVisibilityChange,
  showLabel = "Show password",
  hideLabel = "Hide password",
  groupClassName,
  ref,
  disabled,
  ...props
}: PasswordInputProps) {
  const [localVisible, setLocalVisible] = useState(defaultVisible)
  const visible = controlledVisible ?? localVisible
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <InputGroup className={cn("evenform-password-input", groupClassName)}>
      <InputGroupInput
        {...props}
        type={visible ? "text" : "password"}
        disabled={disabled}
        ref={(element) => {
          inputRef.current = element
          return setRef(ref, element)
        }}
      />
      <InputGroupAddon align="end">
        <button
          type="button"
          className="evenform-input-action"
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (controlledVisible === undefined) setLocalVisible(!visible)
            onVisibilityChange?.(!visible)
            inputRef.current?.focus({ preventScroll: true })
          }}
        >
          {visible ? (
            <EyeOffIcon aria-hidden="true" className="size-4" />
          ) : (
            <EyeIcon aria-hidden="true" className="size-4" />
          )}
        </button>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }
export type { PasswordInputProps }
