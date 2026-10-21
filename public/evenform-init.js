/* Parser-blocking preference bootstrap. No design defaults live in JavaScript.
   Configure storage keys/default theme on this script element when adopting. */
(() => {
  const script = document.currentScript
  const root = document.documentElement
  const read = (key) => { try { return localStorage.getItem(key) } catch { return null } }
  const storedTheme = read(script.dataset.themeKey || "theme")
  const theme = ["light", "dark", "system"].includes(storedTheme) ? storedTheme : (script.dataset.defaultTheme || "system")
  const resolved = theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  root.dataset.theme = theme
  root.style.colorScheme = resolved
  try {
    const config = JSON.parse(read(script.dataset.densityKey || "evenform-tokens-v1"))
    if (config?.density === "comfortable" || config?.density === "compact") root.dataset.density = config.density
    for (const [name, value] of Object.entries(config?.overrides || {})) {
      // Numeric values are the original v1 format; strings also support unitless tokens.
      const css = typeof value === "number" ? `${value}px` : value
      if (name.startsWith("--ds-") && typeof css === "string" && /^-?\d+(\.\d+)?(px)?$/.test(css)) root.style.setProperty(name, css)
    }
  } catch { /* Invalid or unavailable persistence leaves HTML/CSS defaults intact. */ }
})()
