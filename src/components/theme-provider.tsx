import * as React from "react"

type Theme = "dark" | "light" | "system"
type ResolvedTheme = "dark" | "light"
type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  disableTransitionOnChange?: boolean
}
type ThemeProviderState = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}
const query = "(prefers-color-scheme: dark)"
const subscribeHydration = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false
const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(undefined)
const isTheme = (value: string | null): value is Theme => value === "dark" || value === "light" || value === "system"
function systemTheme(): ResolvedTheme { return window.matchMedia(query).matches ? "dark" : "light" }
function subscribe(callback: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener("change", callback)
  return () => media.removeEventListener("change", callback)
}
function readTheme(key: string, fallback: Theme) {
  // Node also exposes localStorage in some versions. Never touch server storage.
  if (typeof window === "undefined") return fallback
  try { const value = window.localStorage.getItem(key); return isTheme(value) ? value : fallback }
  catch { return fallback }
}
export function ThemeProvider({ children, defaultTheme = "system", storageKey = "theme", disableTransitionOnChange = true }: ThemeProviderProps) {
  const [storedTheme, setThemeState] = React.useState<Theme>(() => readTheme(storageKey, defaultTheme))
  // Hydration must render the same context values as the server. CSR still
  // reads preferences immediately; SSR hands over to them after hydration.
  const hydrated = React.useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot)
  const theme = hydrated ? storedTheme : defaultTheme
  const system = React.useSyncExternalStore(subscribe, systemTheme, () => "light" as const)
  const resolvedTheme = theme === "system" ? system : theme
  const setTheme = React.useCallback((next: Theme) => {
    try { window.localStorage.setItem(storageKey, next) } catch { /* Theme changes still work without persistence. */ }
    setThemeState(next)
  }, [storageKey])
  React.useLayoutEffect(() => {
    // Do not temporarily overwrite the parser-blocking bootstrap's theme with
    // the server snapshot while hydration is still completing.
    if (!hydrated) return
    const root = document.documentElement
    // evenform-init.js handles the document's first paint; this handles runtime changes.
    let blocker: HTMLStyleElement | undefined
    if (disableTransitionOnChange) {
      blocker = document.createElement("style")
      blocker.textContent = "*,*::before,*::after{transition:none!important}"
      document.head.append(blocker)
    }
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
    root.dataset.theme = theme
    root.style.colorScheme = resolvedTheme
    void root.offsetWidth
    const frame = requestAnimationFrame(() => blocker?.remove())
    return () => { cancelAnimationFrame(frame); blocker?.remove() }
  }, [theme, resolvedTheme, disableTransitionOnChange, hydrated])
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) setThemeState(readTheme(storageKey, defaultTheme))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [storageKey, defaultTheme])
  const value = React.useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme])
  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}
export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
