import { useId, useState, type ComponentProps, type ReactNode } from "react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function Conversation({
  className,
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      data-slot="conversation"
      className={cn("evenform-conversation", className)}
      {...props}
    />
  )
}
/** History is a normal list. Opt into a live region only when the application needs one. */
export function ConversationList({
  className,
  ...props
}: ComponentProps<"ol">) {
  return (
    <ol
      data-slot="conversation-list"
      className={cn("evenform-conversation-list", className)}
      {...props}
    />
  )
}
export interface ConversationMessageProps extends ComponentProps<"li"> {
  author: ReactNode
  time?: ReactNode
  avatar?: ReactNode
  actions?: ReactNode
  outgoing?: boolean
  status?: ReactNode
}
export function ConversationMessage({
  author,
  time,
  avatar,
  actions,
  outgoing,
  status,
  children,
  className,
  ...props
}: ConversationMessageProps) {
  const authorId = useId()
  return (
    <li
      data-slot="conversation-message"
      data-outgoing={outgoing || undefined}
      className={cn("evenform-conversation-message", className)}
      {...props}
    >
      <article aria-labelledby={authorId}>
        {avatar && <div data-slot="product-avatar">{avatar}</div>}
        <div data-slot="conversation-message-body">
          <header data-slot="product-meta">
            <span data-slot="product-author" id={authorId}>
              {author}
            </span>
            {time && <span data-slot="product-time">{time}</span>}
          </header>
          <div data-slot="conversation-bubble">{children}</div>
          {status && <div data-slot="product-time">{status}</div>}
          {actions && <div data-slot="product-actions">{actions}</div>}
        </div>
      </article>
    </li>
  )
}
export function ConversationDaySeparator({
  children,
  className,
  ...props
}: ComponentProps<"li">) {
  return (
    <li
      data-slot="conversation-day"
      className={cn("evenform-conversation-day", className)}
      {...props}
    >
      {children}
    </li>
  )
}
export interface ConversationComposerProps extends Omit<
  ComponentProps<"form">,
  "onSubmit" | "onChange"
> {
  onSubmit: (text: string) => void
  value?: string
  defaultValue?: string
  onValueChange?: (text: string) => void
  label?: string
  placeholder?: string
  submitLabel?: string
  pendingLabel?: string
  disabled?: boolean
  pending?: boolean
  status?: ReactNode
  actions?: ReactNode
}
/** Submission does not clear the draft: the caller controls success, errors, and clearing. */
export function ConversationComposer({
  onSubmit,
  value,
  defaultValue = "",
  onValueChange,
  label = "Message",
  placeholder = "Write a message…",
  submitLabel = "Send message",
  pendingLabel = "Sending…",
  disabled,
  pending,
  status,
  actions,
  className,
  ...props
}: ConversationComposerProps) {
  const id = useId()
  const [internalValue, setInternalValue] = useState(defaultValue)
  const draft = value ?? internalValue
  return (
    <form
      data-slot="conversation-composer"
      className={cn("evenform-conversation-composer", className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (draft.trim() && !disabled && !pending) onSubmit(draft.trim())
      }}
      {...props}
    >
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <Textarea
        id={id}
        value={draft}
        placeholder={placeholder}
        disabled={disabled || pending}
        onChange={(event) => {
          if (value === undefined) setInternalValue(event.target.value)
          onValueChange?.(event.target.value)
        }}
      />
      <div data-slot="product-actions">
        {actions}
        <Button
          type="submit"
          disabled={disabled || pending || !draft.trim()}
          aria-busy={pending || undefined}
        >
          {pending ? pendingLabel : submitLabel}
        </Button>
        {status}
      </div>
    </form>
  )
}
