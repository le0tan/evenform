/** Anonymous recipe data and host-owned path rules; never imported by components. */
export type Category = "intake" | "processing" | "delivery"
export type Contribution = {
  id: string
  name: string
  category: Category
  entry?: "collection" | "import"
}
export const contributions: Contribution[] = [
  {
    id: "collect",
    name: "Source collection and normalization",
    category: "intake",
    entry: "collection",
  },
  { id: "import", name: "Batch import", category: "intake", entry: "import" },
  {
    id: "enrich",
    name: "Content enrichment and verification",
    category: "processing",
  },
  { id: "publish", name: "Publication and indexing", category: "delivery" },
  { id: "audit", name: "Sample audit", category: "processing" },
  { id: "idle", name: "Archive maintenance", category: "delivery" },
  { id: "unknown", name: "External delivery", category: "delivery" },
  { id: "absent", name: "Partner receipt", category: "delivery" },
]
export const routes = [
  {
    id: "collection",
    name: "Collection path",
    entry: "collect",
    tone: "intake",
  },
  { id: "import", name: "Import path", entry: "import", tone: "processing" },
] as const
export type RouteId = (typeof routes)[number]["id"]
export const scenarios = [
  { id: "skewed", name: "Dominant contribution" },
  { id: "zero", name: "Recorded zeros" },
  { id: "unknown", name: "All observations unknown" },
  { id: "rounding", name: "Near 100%" },
] as const
export type Scenario = (typeof scenarios)[number]["id"]
export type Observation = {
  units: number | null
  status: "Ready" | "Needs review"
}
export function observations(
  scenario: Scenario
): Partial<Record<string, Observation>> {
  const amounts: Record<string, number | null> = {
    collect: 998,
    import: 600,
    enrich: 1.9,
    publish: 0.08,
    audit: 0.02,
    idle: 0,
    unknown: null,
  }
  if (scenario === "rounding")
    Object.assign(amounts, {
      collect: 999.99998,
      import: 999.99998,
      enrich: 0,
      publish: 0,
      audit: 0.00002,
    })
  return Object.fromEntries(
    Object.entries(amounts).map(([id, units]) => [
      id,
      {
        units:
          scenario === "unknown"
            ? null
            : scenario === "zero" && units !== null
              ? 0
              : units,
        status: id === "enrich" ? "Needs review" : "Ready",
      },
    ])
  )
}
export function pathItems(route: RouteId) {
  // Filter the mutually exclusive entries BEFORE resolving containment or fallback.
  return contributions.filter((item) => !item.entry || item.entry === route)
}
export function pathTotal(
  items: Contribution[],
  records: Partial<Record<string, Observation>>
) {
  const known = items.flatMap((item) => {
    const value = records[item.id]?.units
    return typeof value === "number" ? [value] : []
  })
  return known.length ? known.reduce((sum, value) => sum + value, 0) : null
}
export function contextOwner(route: RouteId, revision: number) {
  const candidates = pathItems(route)
  // Simulate a relationship that is unchanged, changes to this path's entry, then disappears.
  const contains =
    revision % 4 < 2
      ? ["enrich"]
      : revision % 4 === 2
        ? ["collect", "import"]
        : []
  return candidates.find((item) => contains.includes(item.id))?.id ?? null
}
export function units(value: number | null | undefined) {
  if (value == null) return "Not available"
  if (value > 0 && value < 0.00001) return "<0.00001"
  return value.toLocaleString("en-US", { maximumFractionDigits: 5 })
}
export function share(value: number | null | undefined, total: number | null) {
  if (value == null) return "Not available"
  if (!total) return "—"
  const percent = (value / total) * 100
  if (percent > 0 && percent < 0.01) return "<0.01%"
  if (percent < 100 && percent > 99.99) return ">99.99%"
  return `${percent.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`
}
