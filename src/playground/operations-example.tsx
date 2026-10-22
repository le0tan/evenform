import { useMemo, useRef, useState } from "react"
import type { ISpec } from "@visactor/vchart"
import { CircleHelp } from "lucide-react"
import { DetailLayout } from "@/components/patterns/detail-layout"
import {
  DescriptionItem,
  DescriptionList,
} from "@/components/patterns/description-list"
import { Stat, StatGroup } from "@/components/patterns/stat"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EvenformChart } from "@/components/ui/evenform-chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import "./operations-example.css"

type Contribution = {
  id: string
  name: string
  units: number | null
  status: "Ready" | "Review" | "Unavailable"
}
const contributions: Contribution[] = [
  {
    id: "collect",
    name: "Source collection and normalization",
    units: 360,
    status: "Ready",
  },
  {
    id: "enrich",
    name: "Content enrichment and verification",
    units: 570,
    status: "Review",
  },
  {
    id: "publish",
    name: "Publication and indexing",
    units: 69.98,
    status: "Ready",
  },
  { id: "audit", name: "Sample audit", units: 0.02, status: "Ready" },
  { id: "idle", name: "Archive maintenance", units: 0, status: "Ready" },
  {
    id: "unknown",
    name: "External delivery",
    units: null,
    status: "Unavailable",
  },
]
const units = (value: number | null) =>
  value === null
    ? "Not available"
    : value.toLocaleString("en-US", { maximumFractionDigits: 2 })
const share = (value: number | null, total: number) =>
  value === null
    ? "Not available"
    : `${((value / total) * 100).toLocaleString("en-US", { maximumFractionDigits: 3 })}%`

/** Synthetic composition, not a new topology or monitoring API. */
export function OperationsExample() {
  const [selectedId, setSelectedId] = useState("enrich")
  const [revision, setRevision] = useState(0)
  const [contexts, setContexts] = useState<Record<string, boolean>>({})
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const inspector = useRef<HTMLHeadingElement>(null)
  const flow = useRef<HTMLDivElement>(null)
  // Refresh intentionally exercises unchanged, changed and missing relationships.
  const contextOwner =
    revision % 4 < 2 ? "enrich" : revision % 4 === 2 ? "collect" : null
  const ownerId = selectedId === "validation" ? contextOwner : selectedId
  const owner = contributions.find((item) => item.id === ownerId)
  const selectedName =
    selectedId === "validation"
      ? "Validation rules"
      : (owner?.name ?? "Selection unavailable")
  const total = contributions.reduce((sum, item) => sum + (item.units ?? 0), 0)
  const missing = contributions.filter((item) => item.units === null).length
  const included = contributions.filter(
    (item): item is Contribution & { units: number } =>
      item.units !== null && item.units > 0
  )
  const composition = useMemo(
    () =>
      ({
        type: "bar",
        direction: "horizontal",
        stack: true,
        animation: false,
        padding: 0,
        data: [
          {
            id: "contributions",
            values: contributions
              .filter((item) => item.units !== null && item.units > 0)
              .map((item) => ({
                group: "Recorded",
                segment: item.id,
                units: item.units,
              })),
          },
        ],
        xField: "units",
        yField: "group",
        seriesField: "segment",
        color: {
          type: "ordinal",
          domain: contributions.map((item) => item.id),
          range: [],
        },
        axes: [
          { orient: "bottom", visible: false, min: 0, max: 1000, nice: false },
          { orient: "left", visible: false },
        ],
        legends: { visible: false },
        tooltip: { visible: false },
        bar: { style: { cornerRadius: 0 } },
      }) as ISpec,
    []
  )

  function choose(id: string) {
    const nextOwner = id === "validation" ? contextOwner : id
    if (
      id === "validation" &&
      (id !== selectedId || nextOwner !== ownerId) &&
      nextOwner
    ) {
      setContexts((previous) => ({ ...previous, [nextOwner]: true }))
    }
    setSelectedId(id)
    // Reveal only the local horizontal workspace; preserve vertical position/focus.
    const node = flow.current?.querySelector<HTMLElement>(
      `[data-owner="${nextOwner}"]`
    )
    if (node && flow.current) {
      const region = flow.current.getBoundingClientRect(),
        target = node.getBoundingClientRect()
      if (target.left < region.left)
        flow.current.scrollLeft -= region.left - target.left
      else if (target.right > region.right)
        flow.current.scrollLeft += target.right - region.right
    }
  }
  function refresh() {
    const nextRevision = revision + 1
    const nextOwner =
      nextRevision % 4 < 2
        ? "enrich"
        : nextRevision % 4 === 2
          ? "collect"
          : null
    if (selectedId === "validation" && nextOwner && nextOwner !== ownerId)
      setContexts((previous) => ({ ...previous, [nextOwner]: true }))
    setRevision(nextRevision)
  }
  function context(item: Contribution) {
    if (contextOwner !== item.id) return null
    return (
      <details
        open={contexts[item.id] ?? false}
        onToggle={(event) => {
          const open = event.currentTarget.open
          setContexts((previous) =>
            previous[item.id] === open
              ? previous
              : { ...previous, [item.id]: open }
          )
        }}
        className="operations-context"
      >
        <summary>Excluded context</summary>
        <Button
          variant="ghost"
          aria-pressed={selectedId === "validation"}
          onClick={() => choose("validation")}
        >
          Validation rules
        </Button>
        <p>Policy context; excluded from the recorded work total.</p>
      </details>
    )
  }
  return (
    <div
      className="operations-example"
      id="example-operational-review"
      role="group"
      aria-label="Operational review example"
    >
      <Card className="operations-summary">
        <CardContent>
          <StatGroup>
            <Stat
              label="Requires review"
              value="1"
              change={{
                label: "Verification needs attention",
                tone: "adverse",
              }}
            />
            <Stat label="Recorded work units" value={units(total)} />
            <Stat label="Missing sources" value={missing} />
          </StatGroup>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="About recorded work"
                  />
                }
              >
                <CircleHelp />
              </TooltipTrigger>
              <TooltipContent>
                Illustrative work units, not elapsed time or summed percentiles.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
      <div className="operations-heading">
        <h2>Work review</h2>
        <Button variant="outline" onClick={refresh}>
          Refresh sample
        </Button>
      </div>
      <Tabs defaultValue="review">
        <TabsList aria-label="Work review views">
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="notes">
          <p>
            Illustrative records. The missing delivery source is excluded from
            the known total.
          </p>
        </TabsContent>
        <TabsContent value="review">
          <DetailLayout
            className="operations-layout"
            aside={
              <Card
                className="operations-inspector"
                aria-labelledby="operations-inspector-heading"
              >
                <CardHeader>
                  <h3
                    id="operations-inspector-heading"
                    tabIndex={-1}
                    ref={inspector}
                  >
                    {selectedName}
                  </h3>
                  <Badge
                    variant={
                      owner?.status === "Review" ? "warning" : "secondary"
                    }
                  >
                    {owner?.status ?? "Owner unavailable"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <StatGroup>
                    <Stat
                      label="Recorded units"
                      value={
                        selectedId === "validation"
                          ? "Excluded"
                          : units(owner?.units ?? null)
                      }
                    />
                    <Stat
                      label="Share of known total"
                      value={
                        selectedId === "validation"
                          ? "Excluded"
                          : share(owner?.units ?? null, total)
                      }
                    />
                  </StatGroup>
                  <DescriptionList>
                    <DescriptionItem label="Owner">
                      {owner?.name ?? "Not available"}
                    </DescriptionItem>
                    <DescriptionItem label="Selection">
                      {selectedId === "validation" ? "Context" : "Contribution"}
                    </DescriptionItem>
                    <DescriptionItem label="Sample revision">
                      {revision + 1}
                    </DescriptionItem>
                  </DescriptionList>
                </CardContent>
              </Card>
            }
          >
            <Card className="operations-workspace">
              <CardHeader className="operations-workspace-header flex flex-wrap items-center justify-between">
                <CardTitle>Recorded contributions</CardTitle>
                <Button
                  variant="link"
                  onClick={() => {
                    inspector.current?.focus({ preventScroll: true })
                    inspector.current?.scrollIntoView({
                      block: "nearest",
                      behavior: "instant",
                    })
                  }}
                >
                  Inspect selection
                </Button>
              </CardHeader>
              <CardContent>
                <div
                  className="operations-flow"
                  role="region"
                  aria-label="Contribution workflow"
                  tabIndex={0}
                  ref={flow}
                >
                  {contributions.map((item) => (
                    <Button
                      key={item.id}
                      data-owner={item.id}
                      className="min-w-0 items-start justify-start text-left whitespace-normal"
                      variant="outline"
                      aria-pressed={selectedId === item.id}
                      data-related={
                        (ownerId === item.id && selectedId !== item.id) ||
                        undefined
                      }
                      onClick={() => choose(item.id)}
                    >
                      <span>{item.name}</span>
                      <span>{units(item.units)}</span>
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    aria-pressed={selectedId === "validation"}
                    onClick={() => choose("validation")}
                  >
                    <span>Validation rules</span>
                    <span>Context</span>
                  </Button>
                </div>
                <details
                  className="operations-analysis"
                  open={analysisOpen}
                  onToggle={(event) =>
                    setAnalysisOpen(event.currentTarget.open)
                  }
                >
                  <summary>
                    <span>Contribution analysis</span>
                    <span>{units(total)} units</span>
                    <Badge variant="warning">Partial data</Badge>
                    <span className="operations-current">{selectedName}</span>
                  </summary>
                  <div
                    className="operations-composition"
                    aria-label="Recorded work composition"
                  >
                    <EvenformChart
                      spec={composition}
                      label="Recorded contributions"
                      description="Proportional work units. Exact values and selection controls follow in the comparison."
                    />
                    <div className="operations-chart-targets">
                      {included.map((item, index) => {
                        const left =
                          (included
                            .slice(0, index)
                            .reduce((sum, item) => sum + item.units, 0) /
                            total) *
                          100
                        return (
                          <div
                            key={item.id}
                            className="operations-segment"
                            style={{
                              left: `${left}%`,
                              width: `${(item.units / total) * 100}%`,
                            }}
                          >
                            <Button
                              variant="ghost"
                              className="operations-segment-button h-full w-full rounded-none border-0 p-0 active:not-aria-[haspopup]:translate-y-0"
                              aria-label={`Select ${item.name} in composition`}
                              aria-pressed={selectedId === item.id}
                              onClick={() => choose(item.id)}
                            />
                            {ownerId === item.id && (
                              <span
                                className="operations-segment-marker"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <p className="operations-caveat">
                    Known contributions only. One source is missing; zero and
                    unavailable remain distinct.
                  </p>
                  <div className="operations-comparison-desktop">
                    <Table>
                      <caption className="sr-only">
                        Recorded contributions and exact work units
                      </caption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contribution</TableHead>
                          <TableHead>Units</TableHead>
                          <TableHead>Share</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contributions.map((item) => (
                          <TableRow
                            key={item.id}
                            data-state={
                              ownerId === item.id ? "selected" : undefined
                            }
                          >
                            <TableCell>
                              <Button
                                variant="link"
                                aria-pressed={selectedId === item.id}
                                onClick={() => choose(item.id)}
                              >
                                {item.name}
                              </Button>
                              {context(item)}
                            </TableCell>
                            <TableCell>{units(item.units)}</TableCell>
                            <TableCell>{share(item.units, total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="operations-comparison-mobile">
                    {contributions.map((item) => (
                      <div
                        className="operations-mobile-row"
                        key={item.id}
                        data-related={ownerId === item.id || undefined}
                      >
                        <div className="operations-row-main">
                          <Button
                            variant="ghost"
                            className="operations-row-target h-full w-full p-0 active:not-aria-[haspopup]:translate-y-0"
                            aria-label={`Select ${item.name}`}
                            aria-pressed={selectedId === item.id}
                            onClick={() => choose(item.id)}
                          />
                          <strong>{item.name}</strong>
                          <StatGroup>
                            <Stat label="Units" value={units(item.units)} />
                            <Stat
                              label="Share"
                              value={share(item.units, total)}
                            />
                          </StatGroup>
                        </div>
                        {context(item)}
                      </div>
                    ))}
                  </div>
                  {!contextOwner && (
                    <div className="operations-unassigned">
                      <p>Unassigned context</p>
                      <Button
                        variant="outline"
                        aria-pressed={selectedId === "validation"}
                        onClick={() => choose("validation")}
                      >
                        Validation rules
                      </Button>
                    </div>
                  )}
                </details>
              </CardContent>
            </Card>
          </DetailLayout>
        </TabsContent>
      </Tabs>
    </div>
  )
}
