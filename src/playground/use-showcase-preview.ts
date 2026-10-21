import { useEffect, useState } from "react"
import { navigateShowcase, type ShowcasePage } from "./showcase-navigation"

// Local example Tabs participate in Showcase URLs, without changing the shared Tabs API.
export function useShowcasePreview(page: ShowcasePage, section: string, values: readonly string[], fallback: string) {
  const allowed = values.join("|")
  const read = () => {
    const value = new URLSearchParams(location.hash.split("?")[1]).get("preview")
    return value && values.includes(value) ? value : fallback
  }
  const [value, setValue] = useState(read)
  useEffect(() => {
    const sync = () => {
      if (location.hash.slice(1).split("?")[0] !== `${page}/${section}`) return
      const next = new URLSearchParams(location.hash.split("?")[1]).get("preview")
      setValue(next && allowed.split("|").includes(next) ? next : fallback)
    }
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [page, section, allowed, fallback])
  return [value, (next: unknown) => { if (typeof next === "string" && values.includes(next)) { setValue(next); navigateShowcase(page, section, { preview: next }) } }] as const
}
