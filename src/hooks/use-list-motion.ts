import { useLayoutEffect, type RefObject } from "react"
import { motionTiming, prefersReducedMotion } from "@/lib/motion"

/** Optional, non-virtual collection motion. Animate translate, never DnD's transform. */
export function useListMotion(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean
) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || !enabled || typeof Element.prototype.animate !== "function")
      return
    type Position = { x: number; y: number }
    let positions = new Map<HTMLElement, Position>()
    const animations = new Map<HTMLElement, Animation>()
    let initialized = false
    const stop = () => {
      for (const animation of animations.values()) animation.cancel()
      animations.clear()
    }
    const read = () => {
      const parent = root.getBoundingClientRect()
      return [
        ...root.querySelectorAll<HTMLElement>('[data-slot="sortable-item"]'),
      ].map((element) => {
        const rect = element.getBoundingClientRect()
        const translate = getComputedStyle(element)
          .translate.split(" ")
          .map(Number.parseFloat)
        const dx = Number.isFinite(translate[0]) ? translate[0] : 0
        const dy = Number.isFinite(translate[1]) ? translate[1] : 0
        return {
          element,
          dx,
          dy,
          x: rect.left - parent.left - dx,
          y: rect.top - parent.top - dy,
        }
      })
    }
    const update = () => {
      // React Aria exclusively owns the active drag. Run after it releases the rows.
      if (root.querySelector("[data-dragging]")) return
      const rows = read() // Batch all geometry reads before any animation writes.
      const options = motionTiming(root)
      const next = new Map<HTMLElement, Position>()
      for (const row of rows) next.set(row.element, { x: row.x, y: row.y })
      for (const [element, animation] of animations) {
        if (!next.has(element)) {
          animation.cancel()
          animations.delete(element)
        }
      }
      for (const { element, x, y, dx, dy } of rows) {
        const previous = positions.get(element)
        // A second reorder starts at the currently drawn position, not the old endpoint.
        const offsetX = previous ? previous.x + dx - x : 0
        const offsetY = previous ? previous.y + dy - y : 0
        animations.get(element)?.cancel()
        animations.delete(element)
        if (
          !initialized ||
          options.duration === 0 ||
          prefersReducedMotion(root)
        )
          continue
        let animation: Animation | undefined
        if (previous && (Math.abs(offsetX) > 0.5 || Math.abs(offsetY) > 0.5)) {
          animation = element.animate(
            [
              { translate: `${offsetX}px ${offsetY}px` },
              { translate: "0px 0px" },
            ],
            options
          )
        } else if (!previous) {
          animation = element.animate([{ opacity: 0 }, { opacity: 1 }], options)
        }
        if (animation) {
          animations.set(element, animation)
          animation.onfinish = () => {
            if (animations.get(element) === animation)
              animations.delete(element)
          }
        }
      }
      positions = next
      initialized = true
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-dragging"],
    })
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const reduce = () => {
      if (media.matches) stop()
    }
    media.addEventListener("change", reduce)
    // Resizing is a new layout, not an item reorder; update the baseline without motion.
    let width = root.getBoundingClientRect().width
    const resize = new ResizeObserver(() => {
      const nextWidth = root.getBoundingClientRect().width
      if (Math.abs(nextWidth - width) < 0.5) return
      width = nextWidth
      stop()
      positions = new Map(
        read().map(({ element, x, y }) => [element, { x, y }])
      )
    })
    resize.observe(root)
    return () => {
      observer.disconnect()
      resize.disconnect()
      media.removeEventListener("change", reduce)
      stop()
    }
  }, [ref, enabled])
}
