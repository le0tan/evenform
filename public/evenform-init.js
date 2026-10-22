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
    if (["auto", "small", "medium", "large"].includes(config?.controlSize)) root.dataset.controlSize = config.controlSize
    if (["neutral", "indigo", "teal", "rose", "custom"].includes(config?.palette)) root.dataset.palette = config.palette
    for (const [name, color] of Object.entries(config?.customTokens || {})) {
      if (/^--ds-custom-(50|100|200|300|400|500|600|700|800|900|950|(light|dark)-(primary|foreground|hover|accent|accent-foreground|ring))$/.test(name) && typeof color === "string" && /^#[\da-f]{6}$/i.test(color)) root.style.setProperty(name, color)
    }
    if (["flat", "soft", "layered"].includes(config?.elevation)) root.dataset.elevation = config.elevation
    if (config?.density === "comfortable" || config?.density === "compact") root.dataset.density = config.density
    for (const [name, value] of Object.entries(config?.overrides || {})) {
      // Numeric values are the original v1 format; strings also support unitless tokens.
      const isDuration = name === "--ds-duration-fast" || name === "--ds-duration-standard"
      const unit = isDuration ? "ms" : name === "--ds-motion-enter-scale" || name === "--ds-line-height-body" ? "" : "px"
      const css = typeof value === "number" ? `${value}${unit}` : value
      if (name.startsWith("--ds-") && typeof css === "string" && /^-?\d+(\.\d+)?(px|ms)?$/.test(css) && (isDuration ? css.endsWith("ms") : !css.endsWith("ms"))) root.style.setProperty(name, css)
    }
  } catch { /* Invalid or unavailable persistence leaves HTML/CSS defaults intact. */ }
})()
