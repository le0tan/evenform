import { createThemePalette, normalizeHex, readPaletteSurfaces } from "@/lib/theme-palette"
import { useLayoutEffect, useMemo, useState } from "react"
import { allTokenControls, type TokenName } from "./token-controls"
export { tokenControls } from "./token-controls"
export type { TokenName } from "./token-controls"
export type Density = "compact" | "comfortable"
export const palettes = ["neutral", "indigo", "teal", "rose", "custom"] as const
export const elevations = ["flat", "soft", "layered"] as const
export const controlSizes = ["auto", "small", "medium", "large"] as const
export type ControlSize = typeof controlSizes[number]
export type Palette = typeof palettes[number]
export type Elevation = typeof elevations[number]
type Config = { customColor: string; controlSize: ControlSize; palette: Palette; elevation: Elevation; density: Density; overrides: Partial<Record<TokenName, number>> }
const storageKey = "evenform-tokens-v1"
// Explicit control sizes persist across density changes.
const controlSizeTokens = new Set([
  "--ds-control-height", "--ds-input-height", "--ds-button-height-xs",
  "--ds-button-height-sm", "--ds-button-height-md", "--ds-button-height-lg",
  "--ds-control-padding-x", "--ds-select-item-height", "--ds-textarea-min-height",
])
function dependsOnDensity(name: string, controlSize: ControlSize) {
  const scope = allTokenControls.find(control => control.name === name)?.density
  return scope === "layout" || (scope === "control" && controlSize === "auto")
}
const cssValue = (name: TokenName, value: number) => `${value}${allTokenControls.find(control => control.name === name)?.unit ?? "px"}`
function loadConfig(): Config {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null")
    const overrides: Config["overrides"] = {}
    for (const control of allTokenControls) {
      const raw = saved?.overrides?.[control.name]
      const match = typeof raw === "string" ? /^(\d+(?:\.\d+)?)(px|ms)?$/.exec(raw) : null
      const value = typeof raw === "number" ? raw : match && ((match[2] ?? "") === (control.unit ?? "px") || (!match[2] && control.unit !== "ms")) ? Number(match[1]) : undefined
      if (value !== undefined && Number.isFinite(value) && value >= control.min && value <= control.max) overrides[control.name] = value
    }
    return { customColor: normalizeHex(saved?.customColor) ?? readPaletteSurfaces().seed, controlSize: controlSizes.includes(saved?.controlSize) ? saved.controlSize : "auto", palette: palettes.includes(saved?.palette) ? saved.palette : "neutral", elevation: elevations.includes(saved?.elevation) ? saved.elevation : "soft", density: saved?.density === "comfortable" ? "comfortable" : "compact", overrides }
  } catch { return { customColor: readPaletteSurfaces().seed, controlSize: "auto", palette: "neutral", elevation: "soft", density: "compact", overrides: {} } }
}
function readValues(controls = allTokenControls) {
  // Resolve calc() and variable aliases through the browser, including unitless leading.
  const probe = document.createElement("div")
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;height:0;font-size:1px"
  document.body.append(probe)
  const values: Config["overrides"] = {}
  for (const { name, unit } of controls) {
    probe.style.width = unit === "" || unit === "ms" ? "0" : `var(${name})`
    probe.style.lineHeight = unit === "" ? `var(${name})` : "normal"
    // Measure the configured duration independently of temporary motion overrides.
    probe.style.setProperty("transition-duration", unit === "ms" ? `var(${name})` : "0s", "important")
    const style = getComputedStyle(probe)
    values[name] = unit === "ms" ? Number.parseFloat(style.transitionDuration) * 1000 : Number.parseFloat(unit === "" ? style.lineHeight : style.width)
  }
  probe.remove()
  return values
}
function removeRedundantOverrides(overrides: Config["overrides"]) {
  const root = document.documentElement
  const result = { ...overrides }
  for (const control of allTokenControls) {
    const value = overrides[control.name]
    if (value === undefined) continue
    // Compare against the CSS cascade without this override. Other overrides
    // remain active so derived tokens retain their current dependencies.
    const inline = root.style.getPropertyValue(control.name)
    const priority = root.style.getPropertyPriority(control.name)
    root.style.removeProperty(control.name)
    try {
      const inherited = readValues([control])[control.name]
      if (inherited !== undefined && Math.abs(inherited - value) < 0.0001) delete result[control.name]
    } finally {
      root.style.setProperty(control.name, inline, priority)
    }
  }
  return result
}
export function useTokens() {
  const [config, setConfig] = useState<Config>(loadConfig)
  const surfaces = useMemo(() => readPaletteSurfaces(), [])
  const customPalette = useMemo(() => createThemePalette(config.customColor, surfaces), [config.customColor, surfaces])
  const [values, setValues] = useState<Config["overrides"]>({})
  useLayoutEffect(() => {
    const root = document.documentElement
    for (const [name, color] of Object.entries(customPalette.variables)) root.style.setProperty(name, color)
    root.dataset.density = config.density
    root.dataset.controlSize = config.controlSize
    root.dataset.palette = config.palette
    root.dataset.elevation = config.elevation
    for (const { name } of allTokenControls) {
      const value = config.overrides[name]
      if (value === undefined) root.style.removeProperty(name)
      else root.style.setProperty(name, cssValue(name, value))
    }
    try { localStorage.setItem(storageKey, JSON.stringify({ customColor: config.customColor, customTokens: customPalette.variables, controlSize: config.controlSize, palette: config.palette, elevation: config.elevation, density: config.density, overrides: Object.fromEntries(Object.entries(config.overrides).map(([name, value]) => [name, cssValue(name as TokenName, value!)])) })) } catch { /* Preview still works without storage. */ }
    const frame = requestAnimationFrame(() => {
      const overrides = removeRedundantOverrides(config.overrides)
      if (Object.keys(overrides).length !== Object.keys(config.overrides).length) {
        setConfig(current => current === config ? { ...current, overrides } : current)
      }
      setValues(readValues())
    })
    return () => cancelAnimationFrame(frame)
  }, [config, customPalette])
  const setDensity = (density: Density) => setConfig(current => current.density === density ? current : ({
    ...current, density,
    overrides: Object.fromEntries(Object.entries(current.overrides).filter(([name]) => !dependsOnDensity(name, current.controlSize))),
  }))
  const setToken = (name: TokenName, value: number) => {
    const control = allTokenControls.find(entry => entry.name === name)
    if (!control || !Number.isFinite(value)) return
    setConfig(current => ({ ...current, overrides: { ...current.overrides, [name]: Math.min(control.max, Math.max(control.min, value)) } }))
  }
  const customCss = config.palette === "custom" ? `\n:root[data-palette="custom"] {\n${Object.entries(customPalette.variables).map(([name, color]) => `  ${name}: ${color};`).join("\n")}\n}\n` : ""
  const entries = Object.entries(config.overrides)
  const declarations = (items: typeof entries) => items.map(([name, value]) => `  ${name}: ${cssValue(name as TokenName, value!)};`).join("\n")
  const globalEntries = entries.filter(([name]) => !dependsOnDensity(name, config.controlSize) && !controlSizeTokens.has(name))
  const densityEntries = entries.filter(([name]) => dependsOnDensity(name, config.controlSize))
  const sizeEntries = entries.filter(([name]) => !dependsOnDensity(name, config.controlSize) && controlSizeTokens.has(name))
  const blocks = [
    globalEntries.length && `:root {\n${declarations(globalEntries)}\n}`,
    densityEntries.length && `:root[data-density="${config.density}"] {\n${declarations(densityEntries)}\n}`,
    sizeEntries.length && `:root[data-control-size="${config.controlSize}"] {\n${declarations(sizeEntries)}\n}`,
  ].filter(Boolean)
  const css = `/* Include src/styles/appearance.css, control-sizing.css and motion.css after the base theme.\n   Set data-density="${config.density}" data-control-size="${config.controlSize}" data-palette="${config.palette}" data-elevation="${config.elevation}" on <html>. */\n${blocks.join("\n\n") || ":root {\n  /* Preset defaults; no custom overrides. */\n}"}${customCss}`
  const setControlSize = (controlSize: ControlSize) => setConfig(current => ({ ...current, controlSize, overrides: Object.fromEntries(Object.entries(current.overrides).filter(([name]) => !controlSizeTokens.has(name))) }))
  return { customColor: config.customColor, customPalette, setCustomColor: (color: string) => { const customColor = normalizeHex(color); if (customColor) setConfig(current => ({ ...current, customColor, palette: "custom" })) }, controlSize: config.controlSize, setControlSize, palette: config.palette, elevation: config.elevation, setPalette: (palette: Palette) => setConfig(current => ({ ...current, palette })), setElevation: (elevation: Elevation) => setConfig(current => ({ ...current, elevation })), density: config.density, values, overrides: config.overrides, setToken, setDensity, css, reset: () => setConfig({ customColor: surfaces.seed, controlSize: "auto", palette: "neutral", elevation: "soft", density: "compact", overrides: {} }) }
}
export type TokenPlayground = ReturnType<typeof useTokens>
