import { useMemo, useState, type ReactNode } from "react"
import { ArrowDownRight, ArrowUpRight, CalendarDays, Check, Download } from "lucide-react"
import { PageHeader } from "@/components/patterns/layouts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShowcasePagePanel } from "../showcase-page-panel"
import { chartEntries, chartValues } from "../showcase-navigation"
import { useShowcaseSection } from "../use-showcase-section"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EvenformChart } from "@/components/ui/evenform-chart"
import { dateLabel, devices, getAnalytics, number, type Audience, type Metric, type Period } from "./analytics-data"
import { channelSpec, deviceSpec, funnelSpec, trendSpec } from "./chart-specs"
import { AdvancedGallery } from "./advanced-gallery"
import "./analytics.css"

function Legend({ labels, dashed = false }: { labels: string[]; dashed?: boolean }) {
  return <div className="chart-legend">{labels.map((label, index) => <span key={label}><i className={dashed ? "legend-line" : "legend-square"} data-series={index + 1} data-dashed={dashed && index === 1 || undefined} />{label}</span>)}</div>
}
function ChartPanel({ title, description, type, children, actions, className = "" }: { title: string; description: string; type: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return <Card id={`example-chart-${type.toLowerCase().replaceAll(" ", "-")}`} className={`analytics-panel ${className}`}><CardHeader className={actions ? "max-sm:flex max-sm:flex-col max-sm:items-stretch" : undefined}><CardTitle><h2>{title}</h2></CardTitle><CardDescription>{description}</CardDescription><CardAction className={actions ? "max-sm:self-start" : undefined}>{actions ?? <Badge variant="outline" className="chart-type">{type}</Badge>}</CardAction></CardHeader><CardContent>{children}</CardContent></Card>
}
function DataTable({ title, headers, rows }: { title: string; headers: string[]; rows: (string | number)[][] }) {
  return <section className="analytics-data-section"><h2>{title}</h2><Table><caption className="sr-only">{title} — synthetic demonstration data</caption><TableHeader><TableRow>{headers.map((header) => <TableHead key={header}>{header}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={index}>{row.map((cell, column) => <TableCell key={column}>{typeof cell === "number" ? number.format(cell) : cell}</TableCell>)}</TableRow>)}</TableBody></Table></section>
}
/** Showcase-only demonstration state; shared chart primitives remain reusable. */
export function Charts() {
  const [view] = useShowcaseSection("charts", chartValues, "advanced")
  const current = chartEntries.find(item => item.id === view) ?? chartEntries[0]
  const [period, setPeriod] = useState<Period>("30")
  const [audience, setAudience] = useState<Audience>("all")
  const [metric, setMetric] = useState<Metric>("sessions")
  const [exported, setExported] = useState(false)
  const data = useMemo(() => getAnalytics(period, audience), [period, audience])
  const trend = useMemo(() => trendSpec(data, metric), [data, metric])
  const channels = useMemo(() => channelSpec(data), [data])
  const device = useMemo(() => deviceSpec(data), [data])
  const funnel = useMemo(() => funnelSpec(data), [data])
  const metrics = [
    { title: "Sessions", value: data.now.sessions, previous: data.before.sessions, format: (v: number) => number.format(v), note: "Total visits to your product" },
    { title: "Sign-ups", value: data.now.signups, previous: data.before.signups, format: (v: number) => number.format(v), note: "Visitors who created an account" },
    { title: "Conversion rate", value: data.now.signups / data.now.sessions * 100, previous: data.before.signups / data.before.sessions * 100, format: (v: number) => `${v.toFixed(2)}%`, note: "Sessions that became sign-ups" },
    { title: "Subscribers", value: data.now.subscribed, previous: data.before.subscribed, format: (v: number) => number.format(v), note: "Activated users who subscribed" },
  ]
  function exportData() {
    const csv = ["Date,Sessions,Previous period sessions,Sign-ups,Previous period sign-ups,Activated,Subscribers", ...data.daily.map((row) => [row.date, row.sessions, row.previousSessions, row.signups, row.previousSignups, row.activated, row.subscribed].join(","))].join("\r\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url; link.download = `evenform-analytics-${audience.toLowerCase()}-${data.start}-${data.end}.csv`; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }
  const range = `${dateLabel(data.start)} – ${dateLabel(data.end)}, 2026`
  return <div className="charts-page">
    <PageHeader title={current.title} description={current.description} actions={view === "advanced" ? <Badge variant="outline">11 chart examples</Badge> : <Button variant="outline" onClick={exportData}>{exported ? <Check /> : <Download />}{exported ? "Exported" : "Export CSV"}</Button>} />
    <div className="analytics-tabs">
      {view !== "advanced" && <div className="analytics-view-toolbar"><div className="toolbar analytics-filters">
        <Select value={audience} onValueChange={(value) => { if (value) setAudience(value as Audience) }}><SelectTrigger aria-label="Filter by device"><SelectValue>{audience === "all" ? "All devices" : audience}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">All devices</SelectItem>{devices.map((name) => <SelectItem value={name} key={name}>{name}</SelectItem>)}</SelectContent></Select>
        <Select value={period} onValueChange={(value) => { if (value) setPeriod(value as Period) }}><SelectTrigger aria-label="Date range"><CalendarDays /><SelectValue>{`Last ${period} days`}</SelectValue></SelectTrigger><SelectContent>{["7", "14", "30"].map((days) => <SelectItem key={days} value={days}>Last {days} days</SelectItem>)}</SelectContent></Select>
      </div></div>}
      {view !== "advanced" && <div className="analytics-period-note"><span>{range}</span><span>Compared with the previous {period} days</span></div>}
      <ShowcasePagePanel active={view === "advanced"}><AdvancedGallery /></ShowcasePagePanel>
      <ShowcasePagePanel active={view === "overview"} className="analytics-overview">
        <dl className="analytics-metrics">{metrics.map((item) => {
          const change = (item.value - item.previous) / item.previous * 100
          const positive = change >= 0
          return <div key={item.title}><dt>{item.title}</dt><dd className="analytics-metric-value">{item.format(item.value)}</dd><dd className="analytics-metric-change" data-positive={positive}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{positive ? "+" : ""}{change.toFixed(1)}%<span>vs. previous period</span></dd><dd className="analytics-metric-note">{item.note}</dd></div>
        })}</dl>
        <ChartPanel title="Traffic over time" description="Daily activity, compared with the previous period." type="Line" className="analytics-trend" actions={<div className="toolbar">{(["sessions", "signups"] as const).map((key) => <Button key={key} size="sm" variant={metric === key ? "secondary" : "ghost"} aria-pressed={metric === key} onClick={() => setMetric(key)}>{key === "sessions" ? "Sessions" : "Sign-ups"}</Button>)}</div>}>
          <div className="analytics-chart-meta"><Legend labels={["Current period", "Previous period"]} dashed /><span>{metric === "sessions" ? "Sessions" : "Sign-ups"}</span></div>
          <EvenformChart spec={trend} label={`${metric === "sessions" ? "Sessions" : "Sign-ups"} over time`} description={`Daily current and previous period comparison for ${range}. Exact values are available in Data tables.`} className="analytics-trend-chart" />
        </ChartPanel>
        <div className="analytics-chart-grid">
          <ChartPanel title="Acquisition channels" description="Where your sessions come from." type="Bar"><Legend labels={["Current period", "Previous period"]} /><EvenformChart spec={channels} label="Sessions by acquisition channel" description={`Organic search, Direct, Referral, and Social. ${number.format(data.now.sessions)} total sessions. Exact values are available in Data tables.`} /></ChartPanel>
          <ChartPanel title="Device breakdown" description="How people access your product." type="Donut"><div className="analytics-device-layout"><div className="analytics-donut"><EvenformChart spec={device} label="Sessions by device" description={data.deviceData.map((row) => `${row.device}: ${number.format(row.sessions)}`).join(". ")} /><div className="analytics-donut-center" aria-hidden="true"><strong>{number.format(data.now.sessions)}</strong><span>sessions</span></div></div><ul className="analytics-device-list">{data.deviceData.map((row) => <li key={row.device}><span><i data-series={devices.indexOf(row.device) + 1} />{row.device}</span><strong>{(row.sessions / data.now.sessions * 100).toFixed(1)}%<small>{number.format(row.sessions)}</small></strong></li>)}</ul></div></ChartPanel>
        </div>
        <ChartPanel title="Conversion journey" description="From a first visit to a paid subscription." type="Horizontal bar"><div className="analytics-funnel-layout"><EvenformChart spec={funnel} label="Conversion journey" description={data.funnel.map((row) => `${row.stage}: ${number.format(row.value)}`).join(". ")} /><dl className="analytics-funnel-stats">{data.funnel.map((row, index) => <div key={row.stage}><dt>{row.stage}</dt><dd>{number.format(row.value)}<span>{index === 0 ? "100% of sessions" : `${(row.value / data.funnel[index - 1].value * 100).toFixed(1)}% of previous step`}</span></dd></div>)}</dl></div><p className="analytics-footnote">Each step is a subset of the previous one. Bars share a linear scale; labels preserve smaller values.</p></ChartPanel>
      </ShowcasePagePanel>
      <ShowcasePagePanel active={view === "data"} className="analytics-tables">
        <p className="text-muted-foreground text-label">The values behind every chart. Filters apply to this view and the CSV export.</p>
        <DataTable title="Daily activity" headers={["Date", "Sessions", "Previous sessions", "Sign-ups", "Previous sign-ups", "Activated", "Subscribed"]} rows={data.daily.map((row) => [dateLabel(row.date), row.sessions, row.previousSessions, row.signups, row.previousSignups, row.activated, row.subscribed])} />
        <DataTable title="Acquisition channels" headers={["Channel", "Sessions", "Previous sessions", "Sign-ups"]} rows={data.acquisition.map((row) => [row.channel, row.sessions, row.previous, row.signups])} />
        <DataTable title="Device breakdown" headers={["Device", "Sessions", "Share"]} rows={data.deviceData.map((row) => [row.device, row.sessions, `${(row.sessions / data.now.sessions * 100).toFixed(1)}%`])} />
        <DataTable title="Conversion journey" headers={["Step", "People / sessions", "From previous step"]} rows={data.funnel.map((row, index) => [row.stage, row.value, index === 0 ? "100%" : `${(row.value / data.funnel[index - 1].value * 100).toFixed(1)}%`])} />
      </ShowcasePagePanel>
    </div>
    <details className="analytics-integration"><summary>Built with Evenform + VChart <span>Integration notes</span></summary><div><p>One chart component. The same typography, data palette, and theme as the rest of your application. Chart styling is read from CSS variables at runtime.</p><pre><code>{`import { EvenformChart } from "@/components/ui/evenform-chart"\n\n<EvenformChart\n  spec={spec}\n  label="Sessions over time"\n  description="Daily sessions. Exact values in the data table."\n/>`}</code></pre><p>Override <code>--ds-chart-series-1</code> through <code>--ds-chart-series-8</code> for a product palette, or <code>--ds-chart-height</code> for an individual chart. Keep data tables available alongside canvas charts.</p><a href="https://visactor.io/vchart/guide/tutorial_docs/Theme/Customize_Theme" target="_blank" rel="noreferrer">VChart theme documentation <ArrowUpRight size={13} /></a></div></details>
    <footer className="analytics-footer"><span>Illustrative data · Evenform + VChart</span><span>Evenform / VChart <span aria-live="polite">{exported ? "· CSV downloaded" : ""}</span></span></footer>
  </div>
}
