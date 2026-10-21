import type { IRadarChartSpec, IBoxPlotChartSpec, IHeatmapChartSpec, ISankeyChartSpec, ISunburstChartSpec, ITreemapChartSpec, IWaterfallChartSpec } from "@visactor/vchart"

const base = { animation: false, legends: { visible: false }, padding: { top: 12, right: 12, bottom: 8, left: 0 } }

export const flowLinks = [
  { source: "Organic", target: "Explore", value: 420 }, { source: "Organic", target: "Docs", value: 240 },
  { source: "Paid", target: "Explore", value: 280 }, { source: "Paid", target: "Pricing", value: 180 },
  { source: "Referral", target: "Docs", value: 160 }, { source: "Referral", target: "Pricing", value: 120 },
  { source: "Explore", target: "Trial", value: 310 }, { source: "Explore", target: "Contact", value: 130 }, { source: "Explore", target: "Exit", value: 260 },
  { source: "Docs", target: "Trial", value: 240 }, { source: "Docs", target: "Contact", value: 60 }, { source: "Docs", target: "Exit", value: 100 },
  { source: "Pricing", target: "Trial", value: 140 }, { source: "Pricing", target: "Contact", value: 110 }, { source: "Pricing", target: "Exit", value: 50 },
]
export const sankeySpec: ISankeyChartSpec = {
  ...base, type: "sankey", categoryField: "name", valueField: "value", nodeKey: "name",
  data: { id: "journey", values: [{ nodes: ["Organic", "Paid", "Referral", "Explore", "Docs", "Pricing", "Trial", "Contact", "Exit"].map((name) => ({ name })), links: flowLinks }] },
  nodeWidth: 12, nodeGap: 24, nodeAlign: "justify",
  label: { visible: true, position: "outside", style: { fontWeight: 500 } },
  node: { state: { selected: { fillOpacity: 1 }, blur: { fillOpacity: 0.18 } } },
  link: { style: { fillOpacity: 0.24 }, state: { hover: { fillOpacity: 0.65 }, selected: { fillOpacity: 0.65 }, blur: { fillOpacity: 0.05 } } },
  emphasis: { enable: true, trigger: "click", effect: "related" },
}

export const productTree = [
  { name: "Platform", children: [{ name: "Core API", value: 124 }, { name: "Storage", value: 76 }, { name: "Compute", value: 98 }] },
  { name: "Analytics", children: [{ name: "Reports", value: 84 }, { name: "Live events", value: 62 }, { name: "Insights", value: 48 }] },
  { name: "Collaboration", children: [{ name: "Teams", value: 72 }, { name: "Workflows", value: 56 }, { name: "Comments", value: 24 }] },
  { name: "Developer tools", children: [{ name: "SDK", value: 38 }, { name: "CLI", value: 30 }, { name: "Integrations", value: 46 }] },
]
export const hierarchyRows = productTree.flatMap((parent) => parent.children.map((child) => [parent.name, child.name, child.value] as const))
export const treemapSpec: ITreemapChartSpec = {
  ...base, type: "treemap", categoryField: "name", valueField: "value",
  data: [{ id: "revenue", values: productTree }],
  drill: true, splitType: "squarify", aspectRatio: 1.6, gapWidth: 3, nodePadding: 4,
  label: { visible: true, style: { fontWeight: 500 } },
  nonLeafLabel: { visible: true, position: "top", padding: 20 },
  nonLeaf: { visible: true, style: { fillOpacity: 0.12 } },
}
export const sunburstSpec: ISunburstChartSpec = {
  ...base, type: "sunburst", categoryField: "name", valueField: "value",
  data: [{ id: "portfolio", values: productTree }],
  drill: true, innerRadius: 0.14, outerRadius: 0.94, gap: 2,
  label: { visible: true, style: { fontWeight: 500 } },
  labelAutoVisible: { enable: true, circumference: 25 },
}

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const hours = ["00", "03", "06", "09", "12", "15", "18", "21"]
export const heatRows = weekdays.flatMap((day, d) => hours.map((hour, h) => ({ day, hour, value: Math.round(Math.max(3, Math.min(98, (d < 5 ? 47 : 24) + Math.sin((h - 2) * 0.7) * 31 + Math.cos(d * 1.6 + h) * 14))) })))
export const heatmapSpec: IHeatmapChartSpec = {
  ...base, type: "heatmap", xField: "hour", yField: "day", valueField: "value",
  data: { id: "activity", values: heatRows, fields: { day: { domain: weekdays }, hour: { domain: hours } } },
  color: { type: "linear", domain: [0, 25, 50, 75, 100], range: [] },
  cell: { style: { padding: 2, cornerRadius: 3 } },
  axes: [{ orient: "bottom", type: "band", grid: { visible: false }, label: { autoHide: false, formatMethod: (text) => `${text}:00` } }, { orient: "left", type: "band", grid: { visible: false } }],
}

export const boxRows = [
  { region: "US", min: 28, q1: 47, median: 62, q3: 83, max: 118, outliers: [145, 158] },
  { region: "Europe", min: 34, q1: 59, median: 76, q3: 98, max: 132, outliers: [163] },
  { region: "Asia", min: 42, q1: 68, median: 89, q3: 116, max: 152, outliers: [190, 207] },
  { region: "Oceania", min: 53, q1: 79, median: 104, q3: 129, max: 165, outliers: [214] },
]
export const boxplotSpec: IBoxPlotChartSpec = {
  ...base, type: "boxPlot", xField: "region", seriesField: "region", direction: "vertical",
  minField: "min", q1Field: "q1", medianField: "median", q3Field: "q3", maxField: "max", outliersField: "outliers",
  data: { id: "latency", values: boxRows }, boxWidth: 28,
  boxPlot: { style: { fillOpacity: 0.2, lineWidth: 1.5 } },
  outliersStyle: { size: 5 },
  axes: [{ orient: "bottom", grid: { visible: false }, label: { autoHide: false } }, { orient: "left", grid: { visible: true }, label: { formatMethod: (text) => `${text}ms` } }],
}

export const waterfallRows = [
  { stage: "Opening", value: 120 }, { stage: "New", value: 38 }, { stage: "Expansion", value: 24 },
  { stage: "Reactivation", value: 8 }, { stage: "Contraction", value: -12 }, { stage: "Churn", value: -15 },
]
export const waterfallSpec: IWaterfallChartSpec = {
  ...base, type: "waterfall", xField: "stage", yField: "value",
  data: { id: "revenue-bridge", values: [...waterfallRows.map((row) => ({ ...row, isTotal: row.stage === "Opening" })), { stage: "Closing", value: 163, isTotal: true }] },
  color: { type: "ordinal", domain: ["total", "increase", "decrease"], range: [] },
  total: { type: "field", tagField: "isTotal", valueField: "value" },
  stackLabel: { visible: true, valueType: "change", position: "withChange", formatMethod: (text, datum) => `${!datum?.isTotal && Number(text) > 0 ? "+" : ""}${text}` },
  leaderLine: { visible: true, style: { lineDash: [3, 3], lineWidth: 1 } },
  axes: [{ orient: "bottom", grid: { visible: false }, label: { autoHide: false, autoRotate: false } }, { orient: "left", grid: { visible: true }, label: { formatMethod: (text) => `$${text}k` } }],
}


export const radarRows = [
  {dimension: "Reliability", baseline: 72, current: 89}, {dimension: "Performance", baseline: 64, current: 82},
  {dimension: "Accessibility", baseline: 58, current: 90}, {dimension: "Observability", baseline: 76, current: 85},
  {dimension: "Documentation", baseline: 62, current: 79}, {dimension: "Security", baseline: 80, current: 92},
]
export const radarSpec: IRadarChartSpec = {
  ...base, type: "radar", categoryField: "dimension", valueField: "score", seriesField: "profile",
  data: { id: "readiness", values: radarRows.flatMap(row => [{dimension: row.dimension, profile: "Baseline", score: row.baseline}, {dimension: row.dimension, profile: "Current", score: row.current}]) },
  area: {visible: true, style: {fillOpacity: 0.06}},
  line: {style: {lineWidth: 2, lineDash: datum => datum.profile === "Baseline" ? [5, 4] : []}},
  point: {visible: true, style: {size: 5, shape: datum => datum.profile === "Baseline" ? "diamond" : "circle"}},
  axes: [{orient: "radius", type: "linear", min: 0, max: 100, domainLine: {visible:false}, grid: {visible:true}, tick:{visible:false}}, {orient: "angle", type: "band", domainLine: {visible:false}, grid: {visible:true}, label:{autoHide:false}}],
}
