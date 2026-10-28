import { useLayoutEffect, useRef, useState } from "react"
import { Check, CircleHelp, Link2 } from "lucide-react"
import { DetailLayout } from "@/components/patterns/detail-layout"
import {
  DescriptionItem,
  DescriptionList,
} from "@/components/patterns/description-list"
import { Stat, StatGroup } from "@/components/patterns/stat"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  contributions,
  contextOwner,
  observations,
  pathItems,
  pathTotal,
  routes,
  scenarios,
  share,
  units,
  type Contribution,
  type RouteId,
  type Scenario,
} from "./operations-model"
import "./operations-example.css"

// Intent: compare path totals, choose even tiny contributions, and inspect shared context.
// Keep the established Card/Geist/token hierarchy; category color identifies, status evaluates.
const selectionClasses =
  "aria-pressed:bg-[var(--op-selected)] aria-pressed:text-foreground aria-pressed:border-[var(--op-tone)] aria-pressed:hover:bg-[var(--op-selected)] data-linked:border-dashed data-linked:border-[var(--op-tone)] dark:aria-pressed:bg-[var(--op-selected)] dark:aria-pressed:border-[var(--op-tone)] dark:aria-pressed:hover:bg-[var(--op-selected)] dark:data-linked:border-[var(--op-tone)]"

/** Synthetic host composition, not a shared topology or monitoring API. */
export function OperationsExample() {
  const [selectedId, setSelectedId] = useState("enrich")
  const [route, setRoute] = useState<RouteId>("collection")
  const [scenario, setScenario] = useState<Scenario>("skewed")
  const [revision, setRevision] = useState(0)
  const [contexts, setContexts] = useState<Record<string, boolean>>({})
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const inspector = useRef<HTMLHeadingElement>(null)
  const flow = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const records = observations(scenario)
  const items = pathItems(route)
  const total = pathTotal(items, records)
  const missing = items.filter((item) => records[item.id]?.units == null).length
  const relationship = contextOwner(route, revision)
  const ownerId = selectedId === "validation" ? relationship : selectedId
  const owner = items.find((item) => item.id === ownerId)
  const observation = owner ? records[owner.id] : undefined
  const selectedName =
    selectedId === "validation"
      ? "Validation rules"
      : (owner?.name ?? "Selection unavailable")
  const currentRoute = routes.find((item) => item.id === route)!

  useLayoutEffect(() => {
    // The workflow reveals the selected item, not its related owner. Otherwise
    // choosing context at the end scrolls its own focused trigger out of view.
    // The contribution-only strip can still reveal the context's linked owner.
    // Instant horizontal scrolling preserves focus and reduced-motion behavior.
    for (const region of [flow.current, strip.current]) {
      const selector =
        region === flow.current
          ? '[aria-pressed="true"]'
          : `[data-owner="${ownerId}"]`
      const node = region?.querySelector<HTMLElement>(selector)
      if (!region || !node) continue
      const bounds = region.getBoundingClientRect(),
        target = node.getBoundingClientRect()
      const offset =
        target.left < bounds.left
          ? target.left - bounds.left
          : target.right > bounds.right
            ? target.right - bounds.right
            : 0
      if (offset)
        region.scrollTo({
          left: region.scrollLeft + offset,
          behavior: "instant",
        })
    }
  }, [selectedId, ownerId, route, analysisOpen])

  function choose(id: string) {
    if (id !== "validation" && !records[id]) return
    const entry = contributions.find((item) => item.id === id)?.entry
    if (entry) setRoute(entry)
    if (id === "validation" && id !== selectedId && relationship)
      setContexts((previous) => ({
        ...previous,
        [`${route}:${relationship}`]: true,
      }))
    setSelectedId(id)
  }
  function changeRoute(next: RouteId) {
    if (next === route) return
    const nextOwner = contextOwner(next, revision)
    if (selectedId === "validation" && nextOwner)
      setContexts((previous) => ({
        ...previous,
        [`${next}:${nextOwner}`]: true,
      }))
    if (contributions.find((item) => item.id === selectedId)?.entry)
      setSelectedId(routes.find((item) => item.id === next)!.entry)
    setRoute(next)
  }
  function refresh() {
    const nextOwner = contextOwner(route, revision + 1)
    if (selectedId === "validation" && nextOwner && nextOwner !== relationship)
      setContexts((previous) => ({
        ...previous,
        [`${route}:${nextOwner}`]: true,
      }))
    setRevision(revision + 1)
  }
  function context(item: Contribution) {
    if (relationship !== item.id) return null
    const key = `${route}:${item.id}`
    return (
      <details
        open={contexts[key] ?? false}
        onToggle={(event) => {
          const open = event.currentTarget.open
          setContexts((previous) =>
            previous[key] === open ? previous : { ...previous, [key]: open }
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
  function identity(item: Contribution) {
    return (
      <>
        <span className="operations-item-name">{item.name}</span>
        <span className="operations-item-meta">
          <Badge
            variant="outline"
            className="operations-category border-[var(--op-tone)] bg-[var(--op-surface)] text-foreground"
          >
            {item.category}
          </Badge>
          <span className="operations-selected-label">
            {selectedId === item.id ? (
              <>
                <Check aria-hidden="true" className="size-3" />
                <span className="sr-only">Selected</span>
              </>
            ) : ownerId === item.id ? (
              <>
                <Link2 aria-hidden="true" className="size-3" />
                <span className="sr-only">Linked</span>
              </>
            ) : null}
          </span>
        </span>
      </>
    )
  }
  function amount(item: Contribution) {
    return records[item.id]
      ? units(records[item.id]?.units)
      : "Record unavailable"
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
            <Stat label="Missing observations" value={missing} />
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
                Sample work units.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
      <div className="operations-heading">
        <h2>Work review</h2>
        <div className="operations-toolbar">
          <label htmlFor="operations-scenario">Sample</label>
          <select
            id="operations-scenario"
            value={scenario}
            onChange={(event) => setScenario(event.target.value as Scenario)}
          >
            {scenarios.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={refresh}>
            Refresh sample
          </Button>
        </div>
      </div>
      <div
        className="operations-routes"
        role="group"
        aria-label="Compare paths"
      >
        {routes.map((item) => (
          <Button
            key={item.id}
            variant="outline"
            data-category={item.tone}
            className={`operations-route items-stretch justify-start text-left whitespace-normal ${selectionClasses}`}
            aria-label={item.name}
            aria-pressed={route === item.id}
            onClick={() => changeRoute(item.id)}
          >
            <span className="operations-route-name">
              {item.name}
              <span>{route === item.id ? "Current path" : "View path"}</span>
            </span>
            <span className="operations-route-total">
              {units(pathTotal(pathItems(item.id), records))}
              <span>known units</span>
            </span>
          </Button>
        ))}
      </div>
      <Tabs defaultValue="review">
        <TabsList aria-label="Work review views">
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="notes">
          <p>
            Paths include separate entries and shared downstream work.
            Totals include overlapping contributions.
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
                <CardHeader
                  className="operations-identity"
                  data-category={owner?.category ?? "context"}
                >
                  <h3
                    id="operations-inspector-heading"
                    tabIndex={-1}
                    ref={inspector}
                  >
                    {selectedName}
                  </h3>
                  <Badge
                    variant={
                      observation?.status === "Needs review"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {selectedId === "validation"
                      ? owner
                        ? "Excluded context"
                        : "Owner unavailable"
                      : (observation?.status ?? "Record unavailable")}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <StatGroup>
                    <Stat
                      label="Recorded units"
                      value={
                        selectedId === "validation"
                          ? "Excluded"
                          : units(observation?.units)
                      }
                    />
                    <Stat
                      label="Share of known total"
                      value={
                        selectedId === "validation"
                          ? "Excluded"
                          : share(observation?.units, total)
                      }
                    />
                  </StatGroup>
                  <DescriptionList>
                    <DescriptionItem label="Owner">
                      {owner?.name ?? "Not available"}
                    </DescriptionItem>
                    <DescriptionItem label="Path">
                      {currentRoute.name}
                    </DescriptionItem>
                    <DescriptionItem label="Observation">
                      {selectedId === "validation"
                        ? "Excluded"
                        : observation?.units == null
                          ? "Not available"
                          : "Recorded"}
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
                      variant="outline"
                      data-owner={item.id}
                      data-category={item.category}
                      className={`operations-node items-stretch justify-start text-left whitespace-normal ${selectionClasses}`}
                      disabled={!records[item.id]}
                      aria-label={item.name}
                      aria-pressed={selectedId === item.id}
                      data-linked={
                        (ownerId === item.id && selectedId !== item.id) ||
                        undefined
                      }
                      onClick={() => choose(item.id)}
                    >
                      {identity(item)}
                      <span className="operations-amount">{amount(item)}</span>
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    data-category="context"
                    className={`operations-node items-stretch justify-start text-left whitespace-normal ${selectionClasses}`}
                    aria-pressed={selectedId === "validation"}
                    onClick={() => choose("validation")}
                  >
                    <span className="operations-item-name">
                      Validation rules
                    </span>
                    <span className="operations-amount">Context</span>
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
                    {missing > 0 && (
                      <Badge variant="warning">Partial data</Badge>
                    )}
                    <span className="operations-current">
                      {currentRoute.name} · {selectedName}
                    </span>
                  </summary>
                  <p className="operations-caveat" id="operations-width-note">
                    Minimum-width segments; percentages show each share of known work.
                  </p>
                  {total === null || total === 0 ? (
                    <p className="operations-empty" role="status">
                      {total === null
                        ? "No known observations. Open a record below to inspect missing data."
                        : "Recorded total: 0. Shares unavailable."}
                    </p>
                  ) : (
                    <div
                      className="operations-strip"
                      role="region"
                      aria-label="Readable contribution strip"
                      aria-describedby="operations-width-note"
                      tabIndex={0}
                      ref={strip}
                    >
                      {items
                        .filter((item) => records[item.id])
                        .map((item) => (
                          <Button
                            key={item.id}
                            variant="outline"
                            className={`operations-segment items-stretch justify-start text-left whitespace-normal ${selectionClasses}`}
                            style={{
                              flexGrow:
                                records[item.id]?.units == null
                                  ? 0
                                  : records[item.id]!.units! / total,
                            }}
                            data-owner={item.id}
                            data-category={item.category}
                            data-linked={
                              (ownerId === item.id && selectedId !== item.id) ||
                              undefined
                            }
                            aria-label={`Select ${item.name} in contribution strip`}
                            aria-pressed={selectedId === item.id}
                            onClick={() => choose(item.id)}
                          >
                            {identity(item)}
                            <span className="operations-amount">
                              {amount(item)} units
                            </span>
                            <span>{share(records[item.id]?.units, total)}</span>
                          </Button>
                        ))}
                    </div>
                  )}
                  <p className="operations-caveat">
                    Totals include known contributions.
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
                        {items.map((item) => (
                          <TableRow
                            key={item.id}
                            className="data-[state=selected]:bg-[var(--op-selected)]"
                            data-category={item.category}
                            data-state={
                              ownerId === item.id ? "selected" : undefined
                            }
                          >
                            <TableCell>
                              <Button
                                variant="link"
                                disabled={!records[item.id]}
                                aria-pressed={selectedId === item.id}
                                onClick={() => choose(item.id)}
                              >
                                {item.name}
                              </Button>
                              {context(item)}
                            </TableCell>
                            <TableCell>{amount(item)}</TableCell>
                            <TableCell>
                              {share(records[item.id]?.units, total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="operations-comparison-mobile">
                    {items.map((item) => (
                      <div
                        className="operations-mobile-row"
                        key={item.id}
                        data-category={item.category}
                        data-related={ownerId === item.id || undefined}
                      >
                        <Button
                          variant="ghost"
                          className="h-auto w-full items-start justify-start text-left whitespace-normal"
                          disabled={!records[item.id]}
                          aria-label={`Select ${item.name}`}
                          aria-pressed={selectedId === item.id}
                          onClick={() => choose(item.id)}
                        >
                          {item.name}
                        </Button>
                        <StatGroup>
                          <Stat label="Units" value={amount(item)} />
                          <Stat
                            label="Share"
                            value={share(records[item.id]?.units, total)}
                          />
                        </StatGroup>
                        {context(item)}
                      </div>
                    ))}
                  </div>
                  {!relationship && (
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
