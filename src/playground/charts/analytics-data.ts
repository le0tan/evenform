export type Period = "7" | "14" | "30"
export type Metric = "sessions" | "signups"
export const devices = ["Desktop", "Mobile", "Tablet"] as const
export type Device = typeof devices[number]
export type Audience = "all" | Device
const deviceShares = [0.58, 0.35, 0.07]
const channels = [
  { name: "Organic search", share: 0.42, rate: 0.048 },
  { name: "Direct", share: 0.28, rate: 0.042 },
  { name: "Referral", share: 0.18, rate: 0.061 },
  { name: "Social", share: 0.12, rate: 0.029 },
]

/** Deterministic synthetic traffic. All charts, KPIs and exports share these rows. */
const rows = Array.from({ length: 60 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 7, 2 + index))
  const baseline = 1540 + index * 17 + Math.sin(index * 1.7) * 170 + Math.cos(index * 0.45) * 120
  const weekend = [0, 6].includes(date.getUTCDay()) ? 0.77 : 1
  return devices.flatMap((device, d) => channels.map((channel) => {
    const sessions = Math.round(baseline * weekend * deviceShares[d] * channel.share)
    const signups = Math.round(sessions * channel.rate * (d === 0 ? 1.1 : 0.9))
    const activated = Math.round(signups * 0.68)
    return { date: date.toISOString().slice(0, 10), device, channel: channel.name, sessions, signups, activated, subscribed: Math.round(activated * 0.46) }
  }))
}).flat()
type Row = typeof rows[number]
export const number = new Intl.NumberFormat("en-US")
export const shortNumber = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : String(value)
export const dateLabel = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
const sum = (items: Row[], key: "sessions" | "signups" | "activated" | "subscribed") => items.reduce((total, row) => total + row[key], 0)
export function getAnalytics(period: Period, audience: Audience) {
  const days = Number(period)
  const dates = [...new Set(rows.map((row) => row.date))]
  const currentDates = dates.slice(-days)
  const previousDates = dates.slice(-days * 2, -days)
  const filtered = rows.filter((row) => audience === "all" || row.device === audience)
  const current = filtered.filter((row) => currentDates.includes(row.date))
  const previous = filtered.filter((row) => previousDates.includes(row.date))
  const totals = (items: Row[]) => ({ sessions: sum(items, "sessions"), signups: sum(items, "signups"), activated: sum(items, "activated"), subscribed: sum(items, "subscribed") })
  const now = totals(current)
  const before = totals(previous)
  const daily = currentDates.map((date, index) => {
    const day = totals(current.filter((row) => row.date === date))
    const previousDay = totals(previous.filter((row) => row.date === previousDates[index]))
    return { date, label: dateLabel(date), ...day, previousSessions: previousDay.sessions, previousSignups: previousDay.signups }
  })
  const acquisition = channels.map(({ name }) => {
    const active = current.filter((row) => row.channel === name)
    return { channel: name, sessions: sum(active, "sessions"), signups: sum(active, "signups"), previous: sum(previous.filter((row) => row.channel === name), "sessions") }
  })
  const deviceData = devices.map((device) => ({ device, sessions: sum(current.filter((row) => row.device === device), "sessions") })).filter((item) => item.sessions > 0)
  const funnel = [
    { stage: "Sessions", value: now.sessions },
    { stage: "Signed up", value: now.signups },
    { stage: "Activated", value: now.activated },
    { stage: "Subscribed", value: now.subscribed },
  ]
  return { now, before, daily, acquisition, deviceData, funnel, start: currentDates[0], end: currentDates.at(-1)! }
}
