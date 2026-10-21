import { useEffect, useRef, useState } from "react"
import type { ISpec, ITheme } from "@visactor/vchart"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import "./evenform-chart.css"

/** Resolve CSS at the chart's actual location, including local token overrides.
 * Canvas colors are converted to sRGB for VRender's color utilities. */
type ChartPalette = "categorical" | "sequential" | "change"
function readTheme(element: HTMLElement, mode: ChartPalette): ITheme {
  const probe = document.createElement("span")
  probe.style.cssText = "position:absolute;visibility:hidden;font-size:var(--ds-text-caption);border-radius:var(--radius);"
  element.append(probe)
  const style = getComputedStyle(probe)
  const fontSize = parseFloat(style.fontSize)
  const fontFamily = style.fontFamily
  const radius = parseFloat(style.borderRadius)
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!
  const color = (token: string) => {
    probe.style.color = `var(${token})`
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = getComputedStyle(probe).color
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    return `rgba(${r},${g},${b},${a / 255})`
  }
  const foreground = color("--foreground")
  const muted = color("--muted-foreground")
  const border = color("--border")
  const surface = color("--popover")
  const palette = mode === "change"
    ? ["total", "increase", "decrease"].map((name) => color(`--ds-chart-change-${name}`))
    : Array.from({ length: mode === "sequential" ? 5 : 8 }, (_, index) => color(`--ds-chart-${mode === "sequential" ? "sequential" : "series"}-${index + 1}`))
  const onFill = color("--ds-chart-label-on-fill")
  probe.remove()
  return {
    name: "evenform",
    type: document.documentElement.classList.contains("dark") ? "dark" : "light",
    background: "transparent",
    padding: 0,
    fontFamily,
    colorScheme: { default: palette },
    mark: { text: { style: { fill: foreground, fontFamily, fontSize } } },
    series: {
      line: { line: { style: { lineWidth: 2 } }, point: { visible: false } },
      bar: { barMaxWidth: 28, bar: { style: { cornerRadius: [3, 3, 0, 0] } } },
      pie: { pie: { style: { cornerRadius: 2 } } },
      treemap: { label: { style: { fill: onFill, fontSize, fontFamily } }, nonLeafLabel: { style: { fill: foreground, fontSize, fontFamily } } },
      sunburst: { label: { style: { fill: onFill, fontSize, fontFamily } } },
      waterfall: { seriesFieldName: { total: "total", increase: "increase", decrease: "decrease" }, leaderLine: { style: { stroke: muted } }, stackLabel: { style: { fill: foreground, fontSize, fontFamily } } },
    },
    component: {
      axis: {
        label: { style: { fill: muted, fontSize, fontFamily }, space: 10 },
        grid: { style: { stroke: border, lineDash: [3, 4] } },
        domainLine: { visible: false },
        tick: { visible: false },
        title: { visible: false },
      },
      legend: { item: { label: { style: { fill: muted, fontSize, fontFamily } } } },
      tooltip: {
        panel: { backgroundColor: surface, border: { color: border, width: 1, radius }, shadow: { x: 0, y: 0, blur: 0, spread: 0, color: "transparent" } },
        titleLabel: { fill: foreground, fontSize, fontFamily },
        keyLabel: { fill: muted, fontSize, fontFamily },
        valueLabel: { fill: foreground, fontSize, fontFamily },
      },
    },
  }
}

export type EvenformChartProps = {
  spec: ISpec
  label: string
  description: string
  className?: string
  palette?: ChartPalette
}

/** VChart owns rendering and pointer interactions; React owns its lifecycle.
 * The caller owns data, legends, filters, and an accessible table alternative. */
export function EvenformChart({ spec, label, description, className, palette = "categorical" }: EvenformChartProps) {
  const container = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const host = container.current!
    let disposed = false
    let chart: import("@visactor/vchart").default | undefined
    let frame = 0
    const root = document.documentElement
    const fail = () => { if (!disposed) setStatus("error") }
    const themedSpec = () => {
      const theme = readTheme(host, palette)
      return { ...spec, theme, ...(spec.color && !Array.isArray(spec.color) ? { color: { ...spec.color, range: theme.colorScheme!.default as string[] } } : {}) }
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!chart || disposed) return
        try {
          chart.updateSpecSync(themedSpec())
          chart.resize(host.clientWidth, host.clientHeight)
        } catch { fail() }
      })
    }
    const resize = new ResizeObserver(sync)
    resize.observe(host)
    const preferences = new MutationObserver(sync)
    preferences.observe(root, { attributes: true, attributeFilter: ["class", "style", "data-density"] })
    // Observe ancestor attributes without watching VChart's own DOM mutations.
    for (let ancestor: HTMLElement | null = host; ancestor && ancestor !== root; ancestor = ancestor.parentElement) {
      preferences.observe(ancestor, { attributes: true, attributeFilter: ["class", "style"] })
    }
    void import("./vchart-runtime").then(async ({ default: VChart }) => {
      await document.fonts.ready
      if (disposed) return
      try {
        chart = new VChart(themedSpec(), { dom: host, autoFit: true, onError: fail })
        chart.renderSync()
        setStatus("ready")
      } catch { fail() }
    }).catch(fail)
    return () => {
      disposed = true
      resize.disconnect()
      preferences.disconnect()
      cancelAnimationFrame(frame)
      chart?.release()
    }
  }, [spec, attempt, palette])

  return <div className={cn("evenform-chart", className)}>
    <div ref={container} className="evenform-chart-canvas" role="img" aria-label={`${label}. ${description}`} aria-busy={status === "loading"} />
    {status === "loading" && <div className="evenform-chart-message" role="status">Loading chart…</div>}
    {status === "error" && <div className="evenform-chart-message" role="alert"><p>Unable to render this chart.</p><Button variant="outline" size="sm" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1) }}>Try again</Button></div>}
  </div>
}
