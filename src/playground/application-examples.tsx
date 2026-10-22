import { useMemo, useState } from "react"
import { ArrowLeft, Download, Send } from "lucide-react"
import { PageHeader, FormField } from "@/components/patterns/layouts"
import { Stat, StatGroup } from "@/components/patterns/stat"
import { SplitLayout } from "@/components/patterns/split-layout"
import { EmptyState } from "@/components/patterns/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EvenformChart } from "@/components/ui/evenform-chart"
import "./application-examples.css"

const channels = ["Organic search", "Direct", "Referrals"]
// Deterministic illustrative data. All summaries and exports use these same rows.
const traffic = Array.from({ length: 30 }, (_, day) =>
  channels.map((channel, index) => ({
    date: `2026-10-${String(day + 1).padStart(2, "0")}`,
    channel,
    visitors: 180 + (2 - index) * 95 + day * 9 + ((day * 17 + index * 11) % 80),
    signups: 12 + (2 - index) * 4 + (day % 7),
  }))
).flat()
const number = new Intl.NumberFormat("en-US")
export function DataDashboard() {
  const [period, setPeriod] = useState("7")
  const [showData, setShowData] = useState(false)
  const [notice, setNotice] = useState("")
  const rows = useMemo(
    () =>
      traffic.filter((row) => Number(row.date.slice(-2)) > 30 - Number(period)),
    [period]
  )
  const totals = channels.map((channel) => ({
    channel,
    visitors: rows
      .filter((row) => row.channel === channel)
      .reduce((sum, row) => sum + row.visitors, 0),
    signups: rows
      .filter((row) => row.channel === channel)
      .reduce((sum, row) => sum + row.signups, 0),
  }))
  const visitors = totals.reduce((sum, row) => sum + row.visitors, 0)
  const signups = totals.reduce((sum, row) => sum + row.signups, 0)
  const spec = useMemo(
    () => ({
      type: "line" as const,
      data: [{ id: "traffic", values: rows }],
      xField: "date",
      yField: "visitors",
      seriesField: "channel",
      axes: [
        {
          orient: "bottom" as const,
          type: "band" as const,
          label: {
            formatMethod: (value: string) => `Oct ${Number(value.slice(-2))}`,
          },
        },
        { orient: "left" as const, type: "linear" as const },
      ],
      legends: [{ visible: false }],
      tooltip: { visible: true },
    }),
    [rows]
  )
  function exportData() {
    const csv = [
      "date,channel,visitors,signups",
      ...rows.map(
        (row) => `${row.date},${row.channel},${row.visitors},${row.signups}`
      ),
    ].join("\n")
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `evenform-traffic-${period}-days.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(`Exported ${rows.length} source rows for the selected period.`)
  }
  return (
    <div className="application-example">
      <PageHeader
        title="Acquisition dashboard"
        actions={
          <Button variant="outline" onClick={exportData}>
            <Download />
            Export CSV
          </Button>
        }
      />
      <div className="application-filter">
        <p className="quiet-meta">Illustrative data · October 2026 · UTC</p>
        <div className="toolbar">
          <label htmlFor="dashboard-period">Reporting period</label>
          <Select
            value={period}
            onValueChange={(value) => {
              if (value) {
                setPeriod(value)
                setNotice("")
              }
            }}
          >
            <SelectTrigger id="dashboard-period">
              <SelectValue>{`Last ${period} days`}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <StatGroup>
        <Stat
          label="Visitors"
          value={number.format(visitors)}
          help={`Oct ${31 - Number(period)}–30, 2026`}
        />
        <Stat
          label="Sign-ups"
          value={number.format(signups)}
          help="Completed account registrations"
        />
        <Stat
          label="Conversion rate"
          value={`${((signups / visitors) * 100).toFixed(2)}%`}
          help="Sign-ups divided by visitors"
        />
      </StatGroup>
      <Card>
        <CardHeader>
          <CardTitle>Visitors by channel</CardTitle>
          <CardDescription>
            Daily visitors across the selected reporting period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EvenformChart
            spec={spec}
            label="Daily visitors by acquisition channel"
            description="Line chart comparing organic search, direct traffic and referrals. Exact daily values are available in the source table below."
          />
          <ul className="application-chart-legend" aria-label="Chart channels">
            {channels.map((channel, index) => (
              <li key={channel}>
                <span
                  style={{ background: `var(--ds-chart-series-${index + 1})` }}
                />
                {channel}
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={showData}
            aria-controls="dashboard-source"
            onClick={() => setShowData(!showData)}
          >
            {showData ? "Hide" : "Show"} source data
          </Button>
          {showData && (
            <div
              id="dashboard-source"
              className="application-source"
              tabIndex={0}
              role="region"
              aria-label="Daily traffic source data"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Date", "Channel", "Visitors", "Sign-ups"].map(
                      (title) => (
                        <TableHead key={title}>{title}</TableHead>
                      )
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={`${row.date}-${row.channel}`}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.channel}</TableCell>
                      <TableCell>{number.format(row.visitors)}</TableCell>
                      <TableCell>{row.signups}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <section aria-labelledby="channel-performance">
        <h2 id="channel-performance" className="application-section-title">
          Channel performance
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>Visitors</TableHead>
              <TableHead>Sign-ups</TableHead>
              <TableHead>Conversion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {totals.map((row) => (
              <TableRow key={row.channel}>
                <TableCell className="font-medium">{row.channel}</TableCell>
                <TableCell>{number.format(row.visitors)}</TableCell>
                <TableCell>{number.format(row.signups)}</TableCell>
                <TableCell>
                  {((row.signups / row.visitors) * 100).toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      {notice && (
        <p role="status" className="quiet-meta">
          {notice}
        </p>
      )}
    </div>
  )
}

type Ticket = {
  id: number
  title: string
  person: string
  category: string
  message: string
  resolved: boolean
  replies: string[]
}
const initialTickets: Ticket[] = [
  {
    id: 1048,
    title: "Can I export a filtered report?",
    person: "Jordan Lee",
    category: "Reporting",
    message:
      "I need to share this week’s organic traffic with my team. Does the CSV keep the current filters?",
    resolved: false,
    replies: [],
  },
  {
    id: 1047,
    title: "Invite a new workspace member",
    person: "Alex Morgan",
    category: "Accounts",
    message: "Where can I invite a teammate and choose their access level?",
    resolved: false,
    replies: [],
  },
  {
    id: 1046,
    title: "Change the billing contact",
    person: "Sam Rivera",
    category: "Billing",
    message:
      "Our finance team has a new contact. How do we update the invoice recipient?",
    resolved: false,
    replies: [],
  },
  {
    id: 1045,
    title: "Thanks for the quick help",
    person: "Casey Park",
    category: "Accounts",
    message: "The access issue is resolved. Thank you!",
    resolved: true,
    replies: [],
  },
]
export function SupportInbox() {
  const [tickets, setTickets] = useState(initialTickets)
  const [selected, setSelected] = useState<number | null>(1048)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("open")
  const [reply, setReply] = useState("")
  const [notice, setNotice] = useState("")
  const current = tickets.find((ticket) => ticket.id === selected)
  const filtered = tickets.filter(
    (ticket) =>
      (status === "all" || ticket.resolved === (status === "resolved")) &&
      `${ticket.title} ${ticket.person}`
        .toLowerCase()
        .includes(query.toLowerCase())
  )
  function update(ticket: Ticket) {
    setTickets(tickets.map((item) => (item.id === ticket.id ? ticket : item)))
  }
  return (
    <div className="application-example">
      <PageHeader
        title="Support inbox"
      />
      <p className="quiet-meta">
        Demo workspace · Replies and status changes stay in this page. No
        messages are sent.
      </p>
      <SplitLayout
        activePane={selected === null ? "list" : "detail"}
        listLabel="Support requests"
        detailLabel="Request conversation"
        list={
          <div className="application-inbox-list">
            <Input
              aria-label="Search requests"
              placeholder="Search requests…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Select
              value={status}
              onValueChange={(value) => {
                if (value) setStatus(value)
              }}
            >
              <SelectTrigger aria-label="Request status">
                <SelectValue>
                  {status === "all"
                    ? "All requests"
                    : status === "open"
                      ? "Open requests"
                      : "Resolved requests"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open requests</SelectItem>
                <SelectItem value="resolved">Resolved requests</SelectItem>
                <SelectItem value="all">All requests</SelectItem>
              </SelectContent>
            </Select>
            <p className="quiet-meta" role="status">
              {filtered.length} requests
            </p>
            {filtered.length ? (
              filtered.map((ticket) => (
                <button
                  key={ticket.id}
                  className="application-ticket"
                  aria-pressed={selected === ticket.id}
                  onClick={() => {
                    setSelected(ticket.id)
                    setReply("")
                    setNotice("")
                  }}
                >
                  <span className="application-ticket-meta">
                    #{ticket.id} · {ticket.person}
                  </span>
                  <strong>{ticket.title}</strong>
                  <span className="application-ticket-meta">
                    {ticket.category} · {ticket.resolved ? "Resolved" : "Open"}
                  </span>
                </button>
              ))
            ) : (
              <EmptyState
                title="No matching requests"
                description="Try another search or choose a different status."
              />
            )}
          </div>
        }
      >
        {current ? (
          <div className="application-conversation">
            <Button
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => setSelected(null)}
            >
              <ArrowLeft />
              Back to requests
            </Button>
            <div className="application-filter">
              <h2>{current.title}</h2>
              <Badge variant="secondary">
                {current.resolved ? "Resolved" : "Open"}
              </Badge>
            </div>
            <p className="quiet-meta">
              #{current.id} · {current.category}
            </p>
            <article className="application-message">
              <h3>{current.person}</h3>
              <p>{current.message}</p>
            </article>
            {current.replies.map((message, index) => (
              <article className="application-message" key={index}>
                <h3>
                  You <span className="quiet-meta">· Local draft reply</span>
                </h3>
                <p>{message}</p>
              </article>
            ))}
            <form
              className="application-reply"
              onSubmit={(event) => {
                event.preventDefault()
                if (!reply.trim()) return
                update({
                  ...current,
                  replies: [...current.replies, reply.trim()],
                })
                setReply("")
                setNotice(
                  "Reply added to this local preview. No message was sent."
                )
              }}
            >
              <FormField id="support-reply" label="Reply">
                <Textarea
                  id="support-reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Write a helpful reply…"
                  required
                />
              </FormField>
              <div className="toolbar">
                <Button type="submit" disabled={!reply.trim()}>
                  <Send />
                  Add preview reply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    update({ ...current, resolved: !current.resolved })
                    setNotice(
                      current.resolved
                        ? "Request reopened."
                        : "Request resolved."
                    )
                  }}
                >
                  {current.resolved ? "Reopen request" : "Resolve request"}
                </Button>
              </div>
            </form>
            {notice && (
              <p role="status" className="quiet-meta">
                {notice}
              </p>
            )}
          </div>
        ) : (
          <EmptyState
            title="Select a request"
            description="Choose a customer question to read and reply."
          />
        )}
      </SplitLayout>
    </div>
  )
}
