import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { cn } from "cn"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type EditableTextProps = Omit<
  ComponentProps<"div">,
  "defaultValue" | "onChange" | "children"
> & {
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Runs before committing. Reject to retain the draft and show saveErrorMessage. */
  onSave?: (value: string) => void | Promise<void>
  onCancel?: () => void
  validate?: (value: string) => string | null | undefined
  multiline?: boolean
  disabled?: boolean
  readOnly?: boolean
  name?: string
  placeholder?: string
  editLabel?: string
  saveLabel?: string
  cancelLabel?: string
  savingLabel?: string
  saveErrorMessage?: string
  instructions?: string
  renderValue?: (value: string) => ReactNode
  inputProps?: Omit<
    ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "disabled" | "name" | "id" | "ref"
  >
  textareaProps?: Omit<
    ComponentProps<"textarea">,
    "value" | "defaultValue" | "onChange" | "disabled" | "name" | "id" | "ref"
  >
}

function EditableText({
  label,
  value,
  defaultValue = "",
  onValueChange,
  onSave,
  onCancel,
  validate,
  multiline = false,
  disabled = false,
  readOnly = false,
  name,
  placeholder = "No value",
  editLabel = "Edit",
  saveLabel = "Save",
  cancelLabel = "Cancel",
  savingLabel = "Saving…",
  saveErrorMessage = "Could not save this change. Try again.",
  instructions,
  renderValue,
  inputProps,
  textareaProps,
  className,
  ...props
}: EditableTextProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const current = value ?? internalValue
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(current)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const field = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const wasEditing = useRef(false)
  const fieldId = useId()
  const descriptionId = useId()
  const errorId = useId()
  useEffect(() => {
    if (editing && !pending) {
      field.current?.focus()
      if (!wasEditing.current) field.current?.select()
    } else if (wasEditing.current) trigger.current?.focus()
    wasEditing.current = editing
  }, [editing, pending])
  function begin() {
    setDraft(current)
    setError(null)
    setEditing(true)
  }
  function cancel() {
    if (pending) return
    setDraft(current)
    setError(null)
    setEditing(false)
    onCancel?.()
  }
  async function save() {
    if (pending || disabled || readOnly) return
    const message = validate?.(draft)
    if (message) {
      setError(message)
      field.current?.focus()
      return
    }
    setPending(true)
    setError(null)
    try {
      await onSave?.(draft)
      if (value === undefined) setInternalValue(draft)
      onValueChange?.(draft)
      setEditing(false)
    } catch {
      setError(saveErrorMessage)
      field.current?.focus()
    } finally {
      setPending(false)
    }
  }
  function keyDown(
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (event.nativeEvent.isComposing) return
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      cancel()
    }
    if (
      event.key === "Enter" &&
      (!multiline || event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault()
      void save()
    }
  }
  const fieldProps = {
    id: fieldId,
    value: draft,
    disabled: disabled || pending,
    readOnly,
    placeholder,
    "aria-invalid": !!error,
    "aria-describedby": `${descriptionId}${error ? ` ${errorId}` : ""}`,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setDraft(event.target.value)
      if (error) setError(null)
    },
  }
  return (
    <div
      {...props}
      data-slot="editable-text"
      data-editing={editing || undefined}
      data-disabled={disabled || undefined}
      className={cn("evenform-editable-text", className)}
      aria-busy={pending || undefined}
    >
      {name && (
        <input type="hidden" name={name} value={current} disabled={disabled} />
      )}
      {editing ? (
        <>
          <label className="sr-only" htmlFor={fieldId}>
            {label}
          </label>
          {multiline ? (
            <Textarea
              {...textareaProps}
              {...fieldProps}
              ref={(node) => {
                field.current = node
              }}
              onKeyDown={(event) => {
                textareaProps?.onKeyDown?.(event)
                if (!event.defaultPrevented) keyDown(event)
              }}
            />
          ) : (
            <Input
              {...inputProps}
              {...fieldProps}
              ref={(node) => {
                field.current = node
              }}
              onKeyDown={(event) => {
                inputProps?.onKeyDown?.(event)
                if (!event.defaultPrevented) keyDown(event)
              }}
            />
          )}
          <p id={descriptionId} data-slot="editable-text-help">
            {instructions ??
              (multiline
                ? "Control/Command + Enter to save. Escape to cancel."
                : "Enter to save. Escape to cancel.")}
          </p>
          {error && (
            <p id={errorId} data-slot="editable-text-error" role="alert">
              {error}
            </p>
          )}
          <div data-slot="editable-text-actions">
            <Button
              type="button"
              size="sm"
              disabled={pending || disabled || readOnly}
              onClick={() => void save()}
            >
              {pending ? savingLabel : saveLabel}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={cancel}
            >
              {cancelLabel}
            </Button>
          </div>
        </>
      ) : (
        <div data-slot="editable-text-display">
          <div
            data-slot="editable-text-value"
            data-empty={!current || undefined}
          >
            {current ? (renderValue?.(current) ?? current) : placeholder}
          </div>
          {!readOnly && (
            <Button
              type="button"
              ref={trigger}
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={begin}
              aria-label={`${editLabel}: ${label}`}
            >
              <Pencil aria-hidden="true" />
              {editLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export { EditableText, type EditableTextProps }
