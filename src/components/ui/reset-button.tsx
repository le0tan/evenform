import { useState, type ComponentProps, type CSSProperties } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "./button"

/** Synchronous reset acknowledgement; the caller owns the reset itself. */
export function ResetButton({
  children,
  onClick,
  statusMessage = "Reset to defaults.",
  ...props
}: ComponentProps<typeof Button> & { statusMessage?: string }) {
  const [turns, setTurns] = useState(0)
  return (
    <span className="inline-flex">
      <Button
        {...props}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) setTurns((current) => current + 1)
        }}
      >
        <RotateCcw
          className="evenform-reset-icon"
          style={{ "--_reset-turn": `${-360 * turns}deg` } as CSSProperties}
        />
        {children}
      </Button>
      <span className="sr-only" role="status" aria-atomic="true">
        {turns > 0 && <span key={turns}>{statusMessage}</span>}
      </span>
    </span>
  )
}
