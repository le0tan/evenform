import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"

type CountdownValue = {
  remainingMs: number
  days: number
  hours: number
  minutes: number
  seconds: number
  completed: boolean
  running: boolean
  formatted: string
}
type CountdownProps = Omit<ComponentProps<"span">, "children"> & {
  target: Date | number | string
  running?: boolean
  onComplete?: () => void
  children?: (value: CountdownValue) => ReactNode
  invalidLabel?: string
}

function CountdownCycle({
  targetTime,
  running = true,
  onComplete,
  children,
  invalidLabel = "Invalid target time",
  className,
  ...props
}: Omit<CountdownProps, "target"> & { targetTime: number }) {
  const valid = Number.isFinite(targetTime)
  const [remainingMs, setRemainingMs] = useState(() =>
    valid ? Math.max(0, targetTime - Date.now()) : 0
  )
  const clock = useRef({
    deadline: targetTime,
    remaining: remainingMs,
    wasRunning: running,
    completed: false,
  })
  const complete = useEffectEvent(() => onComplete?.())
  useEffect(() => {
    if (!valid) return
    const state = clock.current
    const now = Date.now()
    if (state.wasRunning && !running)
      state.remaining = Math.max(0, state.deadline - now)
    if (!state.wasRunning && running) state.deadline = now + state.remaining
    state.wasRunning = running
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      const remaining = running
        ? Math.max(0, state.deadline - Date.now())
        : state.remaining
      state.remaining = remaining
      setRemainingMs(remaining)
      if (remaining === 0 && !state.completed) {
        state.completed = true
        complete()
      }
      if (running && remaining > 0)
        timer = setTimeout(tick, Math.min(1000, remaining))
    }
    timer = setTimeout(tick, 0)
    return () => clearTimeout(timer)
  }, [running, valid])
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const formatted = `${days ? `${days}d ` : ""}${[hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":")}`
  const value: CountdownValue = {
    remainingMs,
    days,
    hours,
    minutes,
    seconds,
    completed: valid && remainingMs === 0,
    running,
    formatted,
  }
  return (
    <span
      data-slot="countdown"
      data-running={running || undefined}
      data-completed={value.completed || undefined}
      data-invalid={!valid || undefined}
      role="timer"
      aria-live="off"
      className={cn("evenform-countdown", className)}
      {...props}
    >
      {!valid ? (
        invalidLabel
      ) : children ? (
        children(value)
      ) : (
        <>
          <span aria-hidden="true">{formatted}</span>
          <span className="sr-only">
            {days ? `${days} days, ` : ""}
            {hours} hours, {minutes} minutes, {seconds} seconds remaining
          </span>
        </>
      )}
    </span>
  )
}

/** Pausing freezes remaining time; resuming shifts the deadline by the paused duration.
 * A different target timestamp starts a fresh completion cycle. No per-second live announcements. */
function Countdown({ target, ...props }: CountdownProps) {
  const targetTime =
    target instanceof Date
      ? target.getTime()
      : typeof target === "number"
        ? target
        : Date.parse(target)
  return (
    <CountdownCycle
      key={String(targetTime)}
      targetTime={targetTime}
      {...props}
    />
  )
}

export { Countdown, type CountdownProps, type CountdownValue }
