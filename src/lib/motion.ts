/** Read CSS-owned timing for optional Web Animations, including calc()/var(). */
export function motionTiming(element: HTMLElement) {
  if (prefersReducedMotion(element)) return { duration: 0 }
  const style = getComputedStyle(element)
  const probe = document.createElement("span")
  probe.style.cssText = "position:fixed;visibility:hidden;pointer-events:none"
  probe.style.setProperty(
    "transition-duration",
    style.getPropertyValue("--ds-list-duration").trim() ||
      style.getPropertyValue("--ds-duration-standard"),
    "important"
  )
  probe.style.setProperty(
    "transition-timing-function",
    style.getPropertyValue("--ds-ease-out"),
    "important"
  )
  document.body.append(probe)
  const resolved = getComputedStyle(probe)
  const duration = Number.parseFloat(resolved.transitionDuration) * 1000
  const easing = resolved.transitionTimingFunction
  probe.remove()
  return { duration: Number.isFinite(duration) ? duration : 0, easing }
}

export function prefersReducedMotion(element: HTMLElement) {
  return (
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !!element.closest('[data-motion="reduce"]')
  )
}
