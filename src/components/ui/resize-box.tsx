import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
} from "react"
import { cn } from "@/lib/utils"

type ResizeBoxSize = { width: number; height: number }
type ResizeBoxEdge = "top" | "right" | "bottom" | "left"
type ResizeBoxDetails = {
  source: "pointer" | "keyboard" | "imperative"
  edge?: ResizeBoxEdge
}
type ResizeBoxHandle = {
  element: HTMLDivElement | null
  getSize: () => ResizeBoxSize
  resizeTo: (size: ResizeBoxSize) => void
}
type ResizeBoxProps = Omit<ComponentProps<"div">, "onResize" | "ref"> & {
  ref?: Ref<ResizeBoxHandle>
  label: string
  size?: ResizeBoxSize
  defaultSize?: ResizeBoxSize
  onSizeChange?: (size: ResizeBoxSize, details: ResizeBoxDetails) => void
  onResizeStart?: (size: ResizeBoxSize, details: ResizeBoxDetails) => void
  onResizeEnd?: (size: ResizeBoxSize, details: ResizeBoxDetails) => void
  axes?: "both" | "horizontal" | "vertical"
  edges?: ResizeBoxEdge[]
  disabled?: boolean
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  /** Arrow-key increment in pixels. Shift multiplies it by ten. */
  keyboardStep?: number
  instructions?: string
  contentClassName?: string
}

/** A standalone surface with pointer and keyboard resizing. */
function ResizeBox({
  ref,
  label,
  size,
  defaultSize,
  onSizeChange,
  onResizeStart,
  onResizeEnd,
  axes = "both",
  edges = ["right", "bottom"],
  disabled = false,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  keyboardStep = 10,
  instructions = "Use arrow keys to resize. Hold Shift for larger changes. Home and End select the size limits. Press Escape during a drag to restore the starting size.",
  contentClassName,
  className,
  style,
  children,
  id,
  ...props
}: ResizeBoxProps) {
  const generatedId = useId()
  const boxId = id ?? generatedId
  const instructionsId = useId()
  const root = useRef<HTMLDivElement>(null)
  const [internalSize, setInternalSize] = useState(defaultSize)
  const [measured, setMeasured] = useState<ResizeBoxSize>()
  const [limits, setLimits] = useState<{
    minWidth: number
    minHeight: number
    maxWidth: number
    maxHeight: number
  }>()
  const [resizing, setResizing] = useState(false)
  const drag = useRef<{
    size: ResizeBoxSize
    x: number
    y: number
    edge: ResizeBoxEdge
    pointerId: number
    handle: HTMLDivElement
  } | null>(null)
  const currentSize = size ?? internalSize
  function getSize(): ResizeBoxSize {
    const rect = root.current?.getBoundingClientRect()
    return { width: rect?.width ?? 0, height: rect?.height ?? 0 }
  }
  function bounds() {
    const element = root.current
    if (!element)
      return {
        minWidth: 0,
        minHeight: 0,
        maxWidth: Infinity,
        maxHeight: Infinity,
      }
    const computed = getComputedStyle(element)
    const parent = element.parentElement
    const parentStyle = parent ? getComputedStyle(parent) : null
    const availableWidth = parent
      ? parent.clientWidth -
        parseFloat(parentStyle!.paddingLeft) -
        parseFloat(parentStyle!.paddingRight)
      : window.innerWidth
    const availableHeight = parent
      ? parent.clientHeight -
        parseFloat(parentStyle!.paddingTop) -
        parseFloat(parentStyle!.paddingBottom)
      : window.innerHeight
    const resolve = (value: string, available: number, fallback: number) => {
      const number = parseFloat(value)
      if (/^-?[\d.]+px$/.test(value)) return number
      if (value.endsWith("%") && Number.isFinite(number))
        return (number * available) / 100
      if (!CSS.supports("width", value) || value === "none" || value === "auto")
        return fallback
      // Computed styles can retain expressions such as min(100%, 40rem).
      // Resolve those through layout with the same percentage basis and font.
      const basis = document.createElement("div")
      Object.assign(basis.style, {
        position: "fixed",
        visibility: "hidden",
        pointerEvents: "none",
        width: `${available}px`,
        height: "0",
        fontSize: computed.fontSize,
      })
      const probe = document.createElement("div")
      Object.assign(probe.style, {
        width: value,
        height: "0",
        minWidth: "0",
        maxWidth: "none",
        padding: "0",
        border: "0",
        margin: "0",
      })
      basis.append(probe)
      document.body.append(basis)
      const resolved = probe.getBoundingClientRect().width
      basis.remove()
      return resolved
    }
    return {
      minWidth: resolve(computed.minWidth, availableWidth, 0),
      minHeight: resolve(computed.minHeight, availableHeight, 0),
      maxWidth: resolve(computed.maxWidth, availableWidth, Infinity),
      maxHeight: resolve(computed.maxHeight, availableHeight, Infinity),
    }
  }
  function change(next: ResizeBoxSize, details: ResizeBoxDetails) {
    const limits = bounds()
    const previous = getSize()
    const clamped = {
      width:
        axes === "vertical"
          ? previous.width
          : Math.max(limits.minWidth, Math.min(limits.maxWidth, next.width)),
      height:
        axes === "horizontal"
          ? previous.height
          : Math.max(limits.minHeight, Math.min(limits.maxHeight, next.height)),
    }
    if (size === undefined) setInternalSize(clamped)
    onSizeChange?.(clamped, details)
    return clamped
  }
  useImperativeHandle(ref, () => ({
    element: root.current,
    getSize,
    resizeTo: (next) => {
      change(next, { source: "imperative" })
    },
  }))
  useEffect(() => {
    if (!root.current) return
    const observer = new ResizeObserver(() => {
      setMeasured(getSize())
      setLimits(bounds())
    })
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [])
  function finish(cancelled = false) {
    const active = drag.current
    if (!active) return
    drag.current = null
    const details: ResizeBoxDetails = { source: "pointer", edge: active.edge }
    const finalSize = cancelled ? change(active.size, details) : getSize()
    setResizing(false)
    if (active.handle.hasPointerCapture(active.pointerId))
      active.handle.releasePointerCapture(active.pointerId)
    onResizeEnd?.(finalSize, details)
  }
  function start(event: PointerEvent<HTMLDivElement>, edge: ResizeBoxEdge) {
    if (disabled || event.button !== 0) return
    event.preventDefault()
    event.currentTarget.focus()
    event.currentTarget.setPointerCapture(event.pointerId)
    const initial = getSize()
    drag.current = {
      size: initial,
      x: event.clientX,
      y: event.clientY,
      edge,
      pointerId: event.pointerId,
      handle: event.currentTarget,
    }
    setResizing(true)
    onResizeStart?.(initial, { source: "pointer", edge })
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const active = drag.current
    if (!active || active.pointerId !== event.pointerId) return
    change(
      {
        width:
          active.size.width +
          (active.edge === "right"
            ? event.clientX - active.x
            : active.edge === "left"
              ? active.x - event.clientX
              : 0),
        height:
          active.size.height +
          (active.edge === "bottom"
            ? event.clientY - active.y
            : active.edge === "top"
              ? active.y - event.clientY
              : 0),
      },
      { source: "pointer", edge: active.edge }
    )
  }
  function keyDown(event: KeyboardEvent<HTMLDivElement>, edge: ResizeBoxEdge) {
    if (disabled) return
    if (event.key === "Escape" && drag.current) {
      event.preventDefault()
      event.stopPropagation()
      finish(true)
      return
    }
    const horizontal = edge === "left" || edge === "right"
    const negative = horizontal ? "ArrowLeft" : "ArrowUp"
    const positive = horizontal ? "ArrowRight" : "ArrowDown"
    if (![negative, positive, "Home", "End"].includes(event.key)) return
    event.preventDefault()
    const previous = getSize()
    const limits = bounds()
    const dimension = horizontal ? "width" : "height"
    const maximum = horizontal ? limits.maxWidth : limits.maxHeight
    if (event.key === "End" && !Number.isFinite(maximum)) return
    const direction = edge === "left" || edge === "top" ? -1 : 1
    const nextValue =
      event.key === "Home"
        ? horizontal
          ? limits.minWidth
          : limits.minHeight
        : event.key === "End"
          ? maximum
          : previous[dimension] +
            (event.key === positive ? 1 : -1) *
              direction *
              Math.max(1, keyboardStep) *
              (event.shiftKey ? 10 : 1)
    const details: ResizeBoxDetails = { source: "keyboard", edge }
    onResizeStart?.(previous, details)
    const next = change({ ...previous, [dimension]: nextValue }, details)
    onResizeEnd?.(next, details)
  }
  const activeEdges = edges.filter(
    (edge, index) =>
      edges.indexOf(edge) === index &&
      (axes === "both" ||
        (axes === "horizontal"
          ? edge === "left" || edge === "right"
          : edge === "top" || edge === "bottom"))
  )
  return (
    <div
      {...props}
      ref={root}
      id={boxId}
      data-slot="resize-box"
      data-resizing={resizing || undefined}
      data-disabled={disabled || undefined}
      className={cn("evenform-resize-box", className)}
      style={
        {
          ...Object.fromEntries(
            Object.entries({
              "--ds-resize-box-min-width": minWidth,
              "--ds-resize-box-max-width": maxWidth,
              "--ds-resize-box-min-height": minHeight,
              "--ds-resize-box-max-height": maxHeight,
            })
              .filter(([, value]) => value !== undefined)
              .map(([key, value]) => [key, `${value}px`])
          ),
          ...(currentSize
            ? { width: currentSize.width, height: currentSize.height }
            : {}),
          ...style,
        } as CSSProperties
      }
    >
      <div data-slot="resize-box-content" className={contentClassName}>
        {children}
      </div>
      <span id={instructionsId} className="sr-only">
        {instructions}
      </span>
      {activeEdges.map((edge) => {
        const horizontal = edge === "left" || edge === "right"
        const maximum = horizontal ? limits?.maxWidth : limits?.maxHeight
        return (
          <div
            key={edge}
            role="separator"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled || undefined}
            aria-label={`${label}: ${horizontal ? "width" : "height"}, ${edge} edge`}
            aria-controls={boxId}
            aria-describedby={instructionsId}
            aria-orientation={horizontal ? "vertical" : "horizontal"}
            aria-valuenow={Math.round(
              (horizontal ? measured?.width : measured?.height) ?? 0
            )}
            aria-valuemin={horizontal ? limits?.minWidth : limits?.minHeight}
            aria-valuemax={
              maximum !== undefined && Number.isFinite(maximum)
                ? maximum
                : undefined
            }
            aria-valuetext={`${Math.round((horizontal ? measured?.width : measured?.height) ?? 0)} pixels`}
            data-slot="resize-box-handle"
            data-edge={edge}
            onFocus={() => setLimits(bounds())}
            onPointerDown={(event) => start(event, edge)}
            onPointerMove={move}
            onPointerUp={() => finish()}
            onPointerCancel={() => finish(true)}
            onLostPointerCapture={() => finish()}
            onKeyDown={(event) => keyDown(event, edge)}
          />
        )
      })}
    </div>
  )
}

export {
  ResizeBox,
  type ResizeBoxProps,
  type ResizeBoxSize,
  type ResizeBoxHandle,
  type ResizeBoxEdge,
  type ResizeBoxDetails,
}
