import { useCallback, useEffect, useState } from "react"
import { navigateShowcase, type ShowcasePage } from "./showcase-navigation"

const readAnchor = () => new URLSearchParams(location.hash.split("?")[1]).get("anchor")

// Showcase routing only. Reusable controls have no knowledge of these hashes.
export function useShowcaseSection(page: string, values: readonly string[], fallback: string) {
  const read = useCallback(() => {
    const [route] = location.hash.slice(1).split("?")
    const [routePage, section] = route.split("/")
    return routePage === page && values.includes(section) ? section : fallback
  }, [page, values, fallback])
  const [section, setSection] = useState(read)
  const [anchor, setAnchor] = useState(readAnchor)
  useEffect(() => { const sync = () => { if (location.hash.slice(1).split(/[/?]/)[0] === page) { setSection(read()); setAnchor(readAnchor()) } }; window.addEventListener("hashchange", sync); return () => window.removeEventListener("hashchange", sync) }, [read, page])
  useEffect(() => {
    if (!anchor) return
    let timer: ReturnType<typeof setTimeout>
    let highlighted: HTMLElement | undefined
    const observer = new MutationObserver(reachAnchor)
    function reachAnchor() {
      const target = document.getElementById(anchor!)
      // Wait for lazy examples, selected preview Tabs, and modal exit before revealing.
      if (!target?.getClientRects().length || target.closest("[hidden]")) return
      if ([...document.querySelectorAll('[role="dialog"]')].some(dialog => !dialog.contains(target))) return
      const hadTabIndex = target.hasAttribute("tabindex")
      if (!hadTabIndex) target.setAttribute("tabindex", "-1")
      target.focus({ preventScroll: true })
      if (document.activeElement !== target) return
      target.scrollIntoView({ block: "center" })
      highlighted?.classList.remove("showcase-example-arrival")
      // Restart the arrival cue even when the same sidebar link is selected again.
      target.classList.remove("showcase-example-arrival")
      void target.offsetWidth
      target.classList.add("showcase-example-arrival")
      highlighted = target
      if (!hadTabIndex) target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true })
      observer.disconnect(); clearTimeout(timer)
    }
    function reveal() {
      observer.disconnect(); clearTimeout(timer)
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "inert", "aria-hidden", "data-state"] })
      timer = setTimeout(() => observer.disconnect(), 10000)
      reachAnchor()
    }
    reveal()
    window.addEventListener("evenform:reveal-example", reveal)
    return () => { observer.disconnect(); clearTimeout(timer); highlighted?.classList.remove("showcase-example-arrival"); window.removeEventListener("evenform:reveal-example", reveal) }
  }, [section, anchor])
  const change = (value: unknown) => {
    const next = String(value)
    if (!values.includes(next)) return
    setSection(next)
    navigateShowcase(page as ShowcasePage, next)
    window.scrollTo({top:0})
  }
  return [section, change] as const
}
