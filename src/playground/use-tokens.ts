import { useLayoutEffect, useState } from "react"
import { allTokenControls, type TokenName } from "./token-controls"
export { tokenControls } from "./token-controls"
export type { TokenName } from "./token-controls"
export type Density = "compact" | "comfortable"
type Config = { density: Density; overrides: Partial<Record<TokenName, number>> }
const storageKey = "evenform-tokens-v1"
const cssValue = (name: TokenName, value: number) => `${value}${allTokenControls.find(control => control.name === name)?.unit ?? "px"}`
function loadConfig(): Config {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null")
    const overrides: Config["overrides"] = {}
    for (const control of allTokenControls) {
      const raw = saved?.overrides?.[control.name]
      const value = typeof raw === "number" ? raw : typeof raw === "string" && /^\d+(\.\d+)?(px)?$/.test(raw) ? Number.parseFloat(raw) : undefined
      if (value !== undefined && Number.isFinite(value) && value >= control.min && value <= control.max) overrides[control.name] = value
    }
    return { density: saved?.density === "comfortable" ? "comfortable" : "compact", overrides }
  } catch { return { density: "compact", overrides: {} } }
}
function readValues() {
  // Resolve calc() and variable aliases through the browser, including unitless leading.
  const probe = document.createElement("div")
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;height:0;font-size:1px"
  document.body.append(probe)
  const values: Config["overrides"] = {}
  for (const { name, unit } of allTokenControls) {
    probe.style.width = unit === "" ? "0" : `var(${name})`
    probe.style.lineHeight = unit === "" ? `var(${name})` : "normal"
    const style = getComputedStyle(probe)
    values[name] = Number.parseFloat(unit === "" ? style.lineHeight : style.width)
  }
  probe.remove()
  return values
}
export function useTokens() {
  const [config, setConfig] = useState<Config>(loadConfig)
  const [values, setValues] = useState<Config["overrides"]>({})
  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.density = config.density
    for (const { name } of allTokenControls) {
      const value = config.overrides[name]
      if (value === undefined) root.style.removeProperty(name)
      else root.style.setProperty(name, cssValue(name, value))
    }
    try { localStorage.setItem(storageKey, JSON.stringify({ density: config.density, overrides: Object.fromEntries(Object.entries(config.overrides).map(([name, value]) => [name, cssValue(name as TokenName, value!)])) })) } catch { /* Preview still works without storage. */ }
    const frame = requestAnimationFrame(() => setValues(readValues()))
    return () => cancelAnimationFrame(frame)
  }, [config])
  const setDensity = (density: Density) => setConfig({ density, overrides: {} })
  const setToken = (name: TokenName, value: number) => {
    const control = allTokenControls.find(entry => entry.name === name)
    if (!control || !Number.isFinite(value)) return
    setConfig(current => ({ ...current, overrides: { ...current.overrides, [name]: Math.min(control.max, Math.max(control.min, value)) } }))
  }
  const css = `/* Set data-density="${config.density}" on <html>. Import after the design system CSS. */\n:root[data-density="${config.density}"] {\n${Object.entries(config.overrides).map(([name, value]) => `  ${name}: ${cssValue(name as TokenName, value!)};`).join("\n") || "  /* Density defaults; no custom overrides. */"}\n}`
  return { density: config.density, values, overrides: config.overrides, setToken, setDensity, css, reset: () => setConfig({ density: "compact", overrides: {} }) }
}
export type TokenPlayground = ReturnType<typeof useTokens>
