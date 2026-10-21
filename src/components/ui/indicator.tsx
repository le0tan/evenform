import type { ComponentProps, ReactNode } from "react"
import { cn } from "cn"

type IndicatorProps = Omit<ComponentProps<"span">, "aria-label"> & {
  label: string
  count?: number
  max?: number
  showZero?: boolean
  indicator?: ReactNode
}

/** The required label describes the count or unread state for assistive technology. */
function Indicator({
  label,
  count,
  max = 99,
  showZero = false,
  indicator,
  children,
  className,
  ...props
}: IndicatorProps) {
  const visible = count === undefined || count > 0 || showZero
  return (
    <span
      data-slot="indicator"
      className={cn("evenform-indicator", className)}
      {...props}
    >
      {children}
      {visible && (
        <span
          className="evenform-indicator-mark"
          data-dot={(count === undefined && !indicator) || undefined}
          role="img"
          aria-label={label}
        >
          <span aria-hidden="true">
            {indicator ??
              (count === undefined ? null : count > max ? `${max}+` : count)}
          </span>
        </span>
      )}
    </span>
  )
}

export { Indicator, type IndicatorProps }
