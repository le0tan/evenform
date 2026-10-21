import { useEffect } from "react"
import { useSidebar } from "@/components/ui/sidebar"

/** Application shortcut; reusable SidebarProvider does not claim global keys. */
export function ShowcaseSidebarShortcut() {
  const { toggleSidebar } = useSidebar()
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented || event.isComposing || event.repeat ||
        event.altKey || event.shiftKey || !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "b"
      ) return
      // Formatting shortcuts belong to editors and native text controls.
      if (event.composedPath().some((target) => target instanceof HTMLElement && (
        target.isContentEditable ||
        target.matches('input, textarea, select, [role="textbox"], [role="combobox"]')
      ))) return
      event.preventDefault()
      toggleSidebar()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [toggleSidebar])
  return null
}
