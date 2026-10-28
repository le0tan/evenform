import {
  useId,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type InputTagRejection = {
  value: string
  reason: "duplicate" | "limit" | "validation"
  message: string
}

export type InputTagProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size" | "required"
> & {
  value: readonly string[]
  onValueChange: (value: string[]) => void
  inputValue?: string
  defaultInputValue?: string
  onInputValueChange?: (value: string) => void
  /** Commas, semicolons and line breaks split pasted text by default. Enter always commits. */
  delimiters?: readonly string[]
  allowDuplicates?: boolean
  maxTags?: number
  /** Return a rejection message, or null/undefined to accept a tag. */
  validate?: (value: string) => string | null | undefined
  normalize?: (value: string) => string
  onReject?: (rejection: InputTagRejection) => void
  commitOnBlur?: boolean
  error?: string
  groupClassName?: string
  groupStyle?: CSSProperties
  renderTag?: (value: string, index: number) => ReactNode
  removeLabel?: (value: string) => string
  duplicateMessage?: (value: string) => string
  limitMessage?: (limit: number) => string
  formatAdded?: (count: number) => string
  formatRemoved?: (value: string) => string
  instructions?: string
}

const defaultDelimiters = [",", ";", "\n", "\r"]

/** Controlled arbitrary tags, with a native text input and explicit remove buttons.
 * A name submits one hidden field per committed value; the draft is never submitted.
 * Read-only tags remain readable and the text input remains focusable for copying.
 */
export function InputTag({
  value,
  onValueChange,
  inputValue,
  defaultInputValue = "",
  onInputValueChange,
  delimiters = defaultDelimiters,
  allowDuplicates = false,
  maxTags,
  validate,
  normalize = (text) => text.trim(),
  onReject,
  commitOnBlur = false,
  error,
  groupClassName,
  groupStyle,
  className,
  renderTag,
  removeLabel = (tag) => `Remove ${tag}`,
  duplicateMessage = (tag) => `${tag} has already been added.`,
  limitMessage = (limit) => `Add up to ${limit} tags.`,
  formatAdded = (count) => `${count} ${count === 1 ? "tag" : "tags"} added.`,
  formatRemoved = (tag) => `${tag} removed.`,
  instructions = "Enter to add a tag. When the input is empty, Left Arrow or Backspace focuses the last tag. Use arrow keys to move between tags and Delete or Backspace to remove one.",
  disabled,
  readOnly,
  id,
  name,
  ref,
  onKeyDown,
  onPaste,
  onBlur,
  "aria-describedby": describedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: InputTagProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const instructionsId = `${inputId}-instructions`
  const errorId = `${inputId}-tag-error`
  const inputRef = useRef<HTMLInputElement>(null)
  const tagRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [localDraft, setLocalDraft] = useState(defaultInputValue)
  const [rejectionMessage, setRejectionMessage] = useState("")
  const [announcement, setAnnouncement] = useState("")
  const draft = inputValue ?? localDraft
  const message = error || rejectionMessage
  const editable = !disabled && !readOnly

  function updateDraft(next: string) {
    if (inputValue === undefined) setLocalDraft(next)
    onInputValueChange?.(next)
  }

  function commit(candidates: string[]) {
    if (!editable) return
    const next = [...value]
    const rejected: string[] = []
    const messages: string[] = []
    for (const candidate of candidates) {
      const tag = normalize(candidate)
      if (!tag) continue
      let rejection: InputTagRejection | undefined
      if (!allowDuplicates && next.includes(tag))
        rejection = {
          value: tag,
          reason: "duplicate",
          message: duplicateMessage(tag),
        }
      else if (maxTags !== undefined && next.length >= maxTags)
        rejection = {
          value: tag,
          reason: "limit",
          message: limitMessage(maxTags),
        }
      else {
        const validationMessage = validate?.(tag)
        if (validationMessage)
          rejection = {
            value: tag,
            reason: "validation",
            message: validationMessage,
          }
      }
      if (rejection) {
        rejected.push(candidate)
        messages.push(rejection.message)
        onReject?.(rejection)
      } else next.push(tag)
    }
    const added = next.length - value.length
    if (added) onValueChange(next)
    updateDraft(
      rejected.join(delimiters.find((delimiter) => delimiter.trim()) ?? ", ")
    )
    setRejectionMessage([...new Set(messages)].join(" "))
    setAnnouncement(added ? formatAdded(added) : "")
  }

  function focusTag(index: number) {
    if (index < 0 || index >= value.length) inputRef.current?.focus()
    else tagRefs.current[index]?.focus()
  }

  function remove(index: number) {
    if (!editable) return
    onValueChange(value.filter((_, current) => current !== index))
    setRejectionMessage("")
    setAnnouncement(formatRemoved(value[index]))
    // Controlled values commit before restoring focus to the surviving next tag.
    requestAnimationFrame(() => {
      if (index < value.length - 1) tagRefs.current[index]?.focus()
      else inputRef.current?.focus()
    })
  }

  function tagKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl"
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault()
      focusTag(index + ((event.key === "ArrowLeft") !== rtl ? -1 : 1))
    } else if (event.key === "Home") {
      event.preventDefault()
      focusTag(0)
    } else if (event.key === "End" || event.key === "Escape") {
      event.preventDefault()
      inputRef.current?.focus()
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault()
      remove(index)
    }
  }

  function split(text: string) {
    const separators = delimiters.filter(Boolean)
    if (!separators.length) return [text]
    const pattern = separators
      .map((delimiter) => delimiter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")
    return text.split(new RegExp(pattern, "u"))
  }

  return (
    <div
      className="evenform-input-tag-field"
      data-slot="input-tag-field"
      data-disabled={disabled || undefined}
    >
      <div
        className={cn("evenform-input-tag", groupClassName)}
        style={groupStyle}
        data-readonly={readOnly || undefined}
        data-invalid={
          Boolean(message) ||
          ariaInvalid === true ||
          ariaInvalid === "true" ||
          undefined
        }
      >
        {value.map((tag, index) => (
          <span className="evenform-input-tag-token" key={`${tag}-${index}`}>
            <span className="evenform-input-tag-label">
              {renderTag?.(tag, index) ?? tag}
            </span>
            {!readOnly && (
              <button
                ref={(element) => {
                  tagRefs.current[index] = element
                }}
                type="button"
                className="evenform-input-tag-remove"
                aria-label={removeLabel(tag)}
                disabled={disabled}
                onKeyDown={(event) => tagKeyDown(event, index)}
                onClick={() => remove(index)}
              >
                <XIcon aria-hidden="true" className="size-3" />
              </button>
            )}
          </span>
        ))}
        <input
          {...props}
          id={inputId}
          ref={(element) => {
            inputRef.current = element
            if (typeof ref === "function") {
              const cleanup = ref(element)
              if (typeof cleanup === "function")
                return () => {
                  inputRef.current = null
                  cleanup()
                }
            } else if (ref) ref.current = element
          }}
          type="text"
          className={cn("evenform-input-tag-input", className)}
          value={draft}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={message ? true : ariaInvalid}
          aria-describedby={
            [
              describedBy,
              instructions ? instructionsId : undefined,
              message ? errorId : undefined,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          onChange={(event) => {
            updateDraft(event.target.value)
            setRejectionMessage("")
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (
              event.defaultPrevented ||
              !editable ||
              event.nativeEvent.isComposing ||
              event.keyCode === 229
            )
              return
            if (
              event.key === "Enter" ||
              (delimiters.includes(event.key) && event.key.length === 1)
            ) {
              event.preventDefault()
              commit([draft])
            } else if (
              !draft &&
              value.length &&
              !event.altKey &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.shiftKey
            ) {
              const rtl =
                getComputedStyle(event.currentTarget).direction === "rtl"
              if (
                event.key === "Backspace" ||
                event.key === (rtl ? "ArrowRight" : "ArrowLeft")
              ) {
                event.preventDefault()
                focusTag(value.length - 1)
              }
            }
          }}
          onPaste={(event) => {
            onPaste?.(event)
            if (event.defaultPrevented || !editable) return
            const text = event.clipboardData.getData("text")
            if (split(text).length < 2) return
            event.preventDefault()
            const start = event.currentTarget.selectionStart ?? draft.length
            const end = event.currentTarget.selectionEnd ?? start
            commit(split(draft.slice(0, start) + text + draft.slice(end)))
          }}
          onBlur={(event) => {
            onBlur?.(event)
            if (
              !event.defaultPrevented &&
              commitOnBlur &&
              draft &&
              !event.currentTarget.parentElement?.contains(event.relatedTarget)
            )
              commit([draft])
          }}
        />
      </div>
      {name &&
        value.map((tag, index) => (
          <input
            key={index}
            type="hidden"
            name={name}
            form={props.form}
            value={tag}
            disabled={disabled}
          />
        ))}
      {instructions && (
        <span id={instructionsId} className="sr-only">
          {instructions}
        </span>
      )}
      {message && (
        <p id={errorId} className="evenform-input-tag-error" role="alert">
          {message}
        </p>
      )}
      <span
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </span>
    </div>
  )
}
