import { useEffect, useRef, useState, type ComponentProps } from "react"
import { CopyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeedbackButton } from "@/components/ui/feedback-button"

type CopyButtonProps = Omit<
  ComponentProps<typeof Button>,
  "onCopy" | "value"
> & {
  value: string | (() => string | Promise<string>)
  /** Optional host clipboard bridge; reject or throw when copying fails. */
  writeText?: (value: string) => void | Promise<void>
  label?: string
  copiedLabel?: string
  errorLabel?: string
  onCopy?: (value: string) => void
  onCopyError?: (error: unknown) => void
}

function CopyButton({
  value,
  writeText = writeClipboardText,
  label = "Copy",
  copiedLabel = "Copied",
  errorLabel = "Copy failed. Try again.",
  onCopy,
  onCopyError,
  children,
  onClick,
  disabled,
  variant = "outline",
  ...props
}: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">(
    "idle"
  )
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pending = useRef(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(timer.current)
    }
  }, [])
  return (
    <span data-slot="copy-button" className="evenform-copy-button">
      <FeedbackButton
        {...props}
        variant={variant}
        disabled={disabled}
        state={
          status === "copying"
            ? "loading"
            : status === "copied"
              ? "success"
              : status
        }
        loadingLabel={label}
        successLabel={children ?? copiedLabel}
        errorLabel={children ?? "Retry copy"}
        statusMessage={
          status === "error"
            ? errorLabel
            : status === "copied"
              ? copiedLabel
              : label
        }
        icon={<CopyIcon aria-hidden="true" />}
        aria-busy={status === "copying" || undefined}
        onClick={async (event) => {
          onClick?.(event)
          if (event.defaultPrevented || pending.current) return
          pending.current = true
          clearTimeout(timer.current)
          setStatus("copying")
          let copiedValue: string | undefined
          try {
            const result = typeof value === "function" ? await value() : value
            await writeText(result)
            if (mounted.current) {
              setStatus("copied")
              timer.current = setTimeout(() => setStatus("idle"), 2500)
            }
            copiedValue = result
          } catch (error) {
            if (mounted.current) setStatus("error")
            onCopyError?.(error)
          } finally {
            pending.current = false
          }
          if (copiedValue !== undefined) onCopy?.(copiedValue)
        }}
      >
        {children ?? label}
      </FeedbackButton>
    </span>
  )
}

async function writeClipboardText(value: string) {
  if (!navigator.clipboard?.writeText)
    throw new Error("Clipboard requires a secure context and browser permission.")
  await navigator.clipboard.writeText(value)
}

export { CopyButton, type CopyButtonProps }
