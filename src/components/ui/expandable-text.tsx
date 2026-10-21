import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

type ExpandableTextProps = Omit<ComponentProps<"div">, "children"> & {
  children: string
  lines?: number
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  expandLabel?: string
  collapseLabel?: string
  textClassName?: string
}

/** Uses a clamped measurement copy so expansion remains available after resizing. */
function ExpandableText({
  children,
  lines,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  expandLabel = "Show more",
  collapseLabel = "Show less",
  textClassName,
  className,
  style,
  ...props
}: ExpandableTextProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const [overflowing, setOverflowing] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const measure = useRef<HTMLDivElement>(null)
  const contentId = useId()
  const isExpanded = expanded ?? internalExpanded
  useEffect(() => {
    const element = measure.current
    if (!element || !root.current) return
    const check = () =>
      setOverflowing(element.scrollHeight > element.clientHeight + 1)
    const observer = new ResizeObserver(check)
    observer.observe(root.current)
    observer.observe(element)
    const frame = requestAnimationFrame(check)
    let disposed = false
    void document.fonts?.ready.then(() => {
      if (!disposed) check()
    })
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [children, lines])
  function toggle() {
    if (expanded === undefined) setInternalExpanded(!isExpanded)
    onExpandedChange?.(!isExpanded)
  }
  return (
    <div
      {...props}
      ref={root}
      data-slot="expandable-text"
      data-expanded={isExpanded || undefined}
      className={cn("evenform-expandable-text", className)}
      style={
        {
          ...(lines === undefined
            ? {}
            : { "--ds-expandable-text-lines": Math.max(1, Math.floor(lines)) }),
          ...style,
        } as CSSProperties
      }
    >
      <div
        id={contentId}
        data-slot="expandable-text-content"
        className={textClassName}
      >
        {children}
      </div>
      <div
        ref={measure}
        data-slot="expandable-text-measure"
        className={textClassName}
        aria-hidden="true"
      >
        {children}
      </div>
      {overflowing && (
        <Button
          type="button"
          size="sm"
          variant="link"
          data-slot="expandable-text-toggle"
          aria-controls={contentId}
          aria-expanded={isExpanded}
          onClick={toggle}
        >
          {isExpanded ? collapseLabel : expandLabel}
        </Button>
      )}
    </div>
  )
}

export { ExpandableText, type ExpandableTextProps }
