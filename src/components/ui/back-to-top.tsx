import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type RefObject,
} from "react"
import { ArrowUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type ScrollContainer = HTMLElement | Window | RefObject<HTMLElement | null>
type ScrollTarget = HTMLElement | RefObject<HTMLElement | null>
type BackToTopProps = ComponentProps<typeof Button> & {
  target: ScrollTarget
  scrollContainer?: ScrollContainer
  threshold?: number
  offset?: number
  hideBelowThreshold?: boolean
  behavior?: ScrollBehavior
  label?: string
}
function resolveElement(target: ScrollTarget) {
  return "current" in target ? target.current : target
}
function isWindow(container: HTMLElement | Window): container is Window {
  return typeof window !== "undefined" && container === window
}

/** Returns to a real heading and transfers keyboard focus without a second scroll jump. */
function BackToTop({
  target,
  scrollContainer,
  threshold = 240,
  offset = 0,
  hideBelowThreshold = true,
  behavior = "smooth",
  label = "Back to top",
  children,
  onClick,
  hidden,
  variant = "outline",
  ...props
}: BackToTopProps) {
  const [pastThreshold, setPastThreshold] = useState(false)
  const restoreFocusTarget = useRef<(() => void) | undefined>(undefined)
  useEffect(() => {
    if (typeof window === "undefined") return
    const container =
      scrollContainer && "current" in scrollContainer
        ? scrollContainer.current
        : (scrollContainer ?? window)
    if (!container) return
    let frame = 0
    const update = () => {
      frame = 0
      setPastThreshold(
        (isWindow(container) ? container.scrollY : container.scrollTop) >
          threshold
      )
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    schedule()
    container.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      container.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      window.cancelAnimationFrame(frame)
    }
  }, [scrollContainer, threshold])
  useEffect(() => () => restoreFocusTarget.current?.(), [])
  return (
    <Button
      {...props}
      data-slot="back-to-top"
      variant={variant}
      hidden={hidden || (hideBelowThreshold && !pastThreshold)}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || typeof window === "undefined") return
        const heading = resolveElement(target)
        const container =
          scrollContainer && "current" in scrollContainer
            ? scrollContainer.current
            : (scrollContainer ?? window)
        if (
          !heading ||
          !container ||
          (!isWindow(container) && !container.contains(heading))
        )
          return
        const top = isWindow(container)
          ? heading.getBoundingClientRect().top + container.scrollY
          : heading.getBoundingClientRect().top -
            container.getBoundingClientRect().top +
            container.scrollTop -
            container.clientTop
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
        container.scrollTo({
          top: Math.max(0, top - offset),
          behavior: reduce ? "instant" : behavior,
        })
        restoreFocusTarget.current?.()
        if (!heading.hasAttribute("tabindex") && heading.tabIndex < 0) {
          heading.setAttribute("tabindex", "-1")
          const restore = () => {
            if (heading.getAttribute("tabindex") === "-1")
              heading.removeAttribute("tabindex")
            heading.removeEventListener("blur", restore)
          }
          heading.addEventListener("blur", restore, { once: true })
          restoreFocusTarget.current = restore
        }
        heading.focus({ preventScroll: true })
      }}
    >
      <ArrowUpIcon aria-hidden="true" />
      {children ?? label}
    </Button>
  )
}

export { BackToTop, type BackToTopProps }
