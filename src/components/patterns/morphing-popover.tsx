import {
  useImperativeHandle,
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import { cn } from "@/lib/utils"
import {
  PopoverContent,
  type PopoverContentProps,
} from "@/components/ui/popover"

export type MorphingPopoverContentProps = Omit<
  PopoverContentProps,
  "children" | "render"
> & {
  anchorRef: RefObject<HTMLElement | null>
  children: ReactNode
}

/** Decorative surface morph with Base UI state, positioning, and focus. */
export function MorphingPopoverContent({
  anchorRef,
  children,
  className,
  ref,
  ...props
}: MorphingPopoverContentProps) {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  useImperativeHandle(ref, () => element!, [element])
  useLayoutEffect(() => {
    const anchor = anchorRef.current
    if (!element || !anchor) return
    function measure() {
      if (!element || !anchor) return
      const from = anchor.getBoundingClientRect()
      const to = element.getBoundingClientRect()
      if (!to.width || !to.height) return
      element.style.setProperty("--_morph-x", `${from.x - to.x}px`)
      element.style.setProperty("--_morph-y", `${from.y - to.y}px`)
      element.style.setProperty(
        "--_morph-scale-x",
        String(from.width / to.width)
      )
      element.style.setProperty(
        "--_morph-scale-y",
        String(from.height / to.height)
      )
    }
    measure()
    // Establish the measured origin before the first painted expansion. Portal
    // placement may complete after Base UI clears its starting-style attribute.
    element.setAttribute("data-morph-origin", "")
    void getComputedStyle(element, "::before").transform
    const frame = requestAnimationFrame(() =>
      element.removeAttribute("data-morph-origin")
    )
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    observer.observe(anchor)
    // Floating positioning can settle without resizing the popup.
    const positioner = new MutationObserver(measure)
    if (element.parentElement)
      positioner.observe(element.parentElement, {
        attributes: true,
        attributeFilter: ["style"],
      })
    window.addEventListener("scroll", measure, true)
    window.addEventListener("resize", measure)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      positioner.disconnect()
      window.removeEventListener("scroll", measure, true)
      window.removeEventListener("resize", measure)
    }
  }, [anchorRef, element])
  return (
    <PopoverContent
      {...props}
      ref={setElement}
      className={(state) =>
        cn(
          "evenform-morphing-popover",
          typeof className === "function" ? className(state) : className
        )
      }
    >
      <div className="evenform-morphing-content">{children}</div>
    </PopoverContent>
  )
}
