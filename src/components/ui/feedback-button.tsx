import { type ComponentProps, type ReactNode, type CSSProperties } from "react"
import { Check, CircleAlert } from "lucide-react"
import { Button } from "./button"
import { Spinner } from "./spinner"

export type FeedbackState = "idle" | "loading" | "success" | "error"
export type FeedbackButtonProps = ComponentProps<typeof Button> & {
  state: FeedbackState
  loadingLabel?: ReactNode
  successLabel?: ReactNode
  errorLabel?: ReactNode
  icon?: ReactNode
  /** Behavior delay avoids a loading flash for very short operations. */
  loadingDelay?: number
  statusMessage?: string
}

/** Controlled presentation only: the consumer owns the task, result and retry. */
export function FeedbackButton({
  state,
  children,
  loadingLabel = "Working…",
  successLabel = "Done",
  errorLabel = "Try again",
  icon,
  loadingDelay = 150,
  statusMessage,
  onClick,
  ...props
}: FeedbackButtonProps) {
  const labels = {
    idle: children,
    loading: loadingLabel,
    success: successLabel,
    error: errorLabel,
  }
  const icons = {
    idle: icon,
    loading: (
      <Spinner
        style={{
          animationPlayState: state === "loading" ? "running" : "paused",
        }}
      />
    ),
    success: <Check />,
    error: <CircleAlert />,
  }
  const text =
    statusMessage ?? (typeof labels[state] === "string" ? labels[state] : "")
  return (
    <span data-slot="feedback-button" className="inline-flex">
      <Button
        {...props}
        aria-label={
          props["aria-label"] ??
          (typeof labels[state] === "string" ? labels[state] : undefined)
        }
        aria-busy={state === "loading" || undefined}
        aria-disabled={state === "loading" || props["aria-disabled"]}
        onClick={(event) => {
          if (state === "loading") {
            event.preventDefault()
            return
          }
          onClick?.(event)
        }}
      >
        <span
          className="evenform-feedback-faces"
          data-loading={state === "loading" ? "" : undefined}
          style={
            {
              "--_feedback-delay": `${Math.max(0, loadingDelay)}ms`,
            } as CSSProperties
          }
        >
          {(Object.keys(labels) as FeedbackState[]).map((face) => (
            <span
              key={face}
              className="evenform-feedback-face"
              data-face={face}
              data-visible={state === face ? "" : undefined}
              aria-hidden={state !== face || undefined}
            >
              {icons[face]}
              {labels[face]}
            </span>
          ))}
        </span>
      </Button>
      <span className="sr-only" role="status">
        {state === "idle" ? "" : text}
      </span>
    </span>
  )
}
