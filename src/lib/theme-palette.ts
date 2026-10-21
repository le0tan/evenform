/** WCAG 2.x sRGB luminance, evaluated on the final rounded hex colors. */
type RGB = [number, number, number]
export type PaletteSurfaces = { seed: string; light: string[]; dark: string[] }
export function normalizeHex(value: unknown): string | null {
  if (typeof value !== "string") return null
  const hex = value.trim().replace(/^#/, "")
  if (/^[\da-f]{3}$/i.test(hex))
    return `#${[...hex]
      .map((c) => c + c)
      .join("")
      .toLowerCase()}`
  return /^[\da-f]{6}$/i.test(hex) ? `#${hex.toLowerCase()}` : null
}
function rgb(hex: string): RGB {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB
}
function hex(channels: RGB) {
  return `#${channels.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`
}
function mix(from: string, to: string, amount: number) {
  const a = rgb(from),
    b = rgb(to)
  return hex(a.map((c, i) => c + (b[i] - c) * amount) as RGB)
}
export function contrast(a: string, b: string) {
  const luminance = (color: string) =>
    rgb(color)
      .map((c) => {
        const n = c / 255
        return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4
      })
      .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0)
  const x = luminance(a),
    y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
function adjust(
  seed: string,
  endpoint: string,
  acceptable: (color: string) => boolean
) {
  // Scan actual 8-bit output; never round a failing contrast ratio into a pass.
  for (let i = 0; i <= 255; i++) {
    const color = mix(seed, endpoint, i / 255)
    if (acceptable(color)) return color
  }
  throw new Error("Theme surfaces cannot meet the requested contrast.")
}
export function createThemePalette(seed: string, surfaces: PaletteSurfaces) {
  const normalized = normalizeHex(seed)
  if (!normalized) throw new Error("Invalid theme color")
  const colorSeed: string = normalized
  const shades = Object.fromEntries([
    ...[
      [50, 0.95],
      [100, 0.9],
      [200, 0.75],
      [300, 0.55],
      [400, 0.3],
    ].map(([n, weight]) => [n, mix(normalized, "#ffffff", weight)]),
    [500, normalized],
    ...[
      [600, 0.15],
      [700, 0.3],
      [800, 0.5],
      [900, 0.7],
      [950, 0.85],
    ].map(([n, weight]) => [n, mix(normalized, "#000000", weight)]),
  ]) as Record<string, string>
  function mode(backgrounds: string[], dark: boolean) {
    const background = backgrounds[0]
    const foreground = dark ? surfaces.dark[0] : surfaces.light[0]
    const endpoint = dark ? "#ffffff" : "#000000"
    const accentFor = (color: string) =>
      mix(background, color, dark ? 0.12 : 0.1)
    // Leave headroom above WCAG minima for color conversion/compositing.
    const primary = adjust(
      colorSeed,
      endpoint,
      (c) =>
        contrast(c, foreground) >= 4.6 &&
        backgrounds.every((bg) => contrast(c, bg) >= 4.6) &&
        contrast(c, accentFor(c)) >= 4.6
    )
    const accent = accentFor(primary)
    const ring = adjust(primary, endpoint, (c) =>
      [...backgrounds, accent].every((bg) => contrast(mix(bg, c, 0.5), bg) >= 3.1)
    )
    return {
      primary,
      foreground,
      hover: mix(primary, endpoint, 0.1),
      accent,
      "accent-foreground": primary,
      ring,
    }
  }
  const light = mode(surfaces.light, false),
    dark = mode(surfaces.dark, true)
  const variables: Record<string, string> = {}
  for (const [name, color] of Object.entries(shades))
    variables[`--ds-custom-${name}`] = color
  for (const [name, roles] of Object.entries({ light, dark }))
    for (const [role, color] of Object.entries(roles))
      variables[`--ds-custom-${name}-${role}`] = color
  return {
    seed: normalized,
    shades,
    light,
    dark,
    variables,
    textContrast: {
      light: contrast(light.primary, light.foreground),
      dark: contrast(dark.primary, dark.foreground),
    },
  }
}
export type ThemePalette = ReturnType<typeof createThemePalette>

/** Resolve the existing CSS neutrals; the generator keeps no duplicate defaults. */
export function readPaletteSurfaces(): PaletteSurfaces {
  const root = getComputedStyle(document.documentElement)
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!
  const resolve = (name: string) => {
    ctx.fillStyle = root.getPropertyValue(name).trim()
    ctx.fillRect(0, 0, 1, 1)
    return hex([...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3) as RGB)
  }
  return {
    seed: resolve("--ds-palette-indigo"),
    light: [0, 50, 100].map((n) => resolve(`--ds-neutral-${n}`)),
    dark: [950, 900, 800].map((n) => resolve(`--ds-neutral-${n}`)),
  }
}
