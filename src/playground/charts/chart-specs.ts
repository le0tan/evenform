import type { ILineChartSpec, IBarChartSpec, IPieChartSpec } from "@visactor/vchart"
import { devices, getAnalytics, shortNumber, type Metric } from "./analytics-data"

type Analytics = ReturnType<typeof getAnalytics>
const base = { animation: false, legends: { visible: false }, padding: { top: 12, right: 12, bottom: 0, left: 0 } }
const valueAxis = { orient: "left" as const, label: { formatMethod: (value: string | string[]) => shortNumber(Number(value)) }, grid: { visible: true } }

export function trendSpec(data: Analytics, metric: Metric): ILineChartSpec {
  return {
    ...base, type: "line", xField: "date", yField: "value", seriesField: "period",
    data: { id: "trend", values: data.daily.flatMap((day) => [
      { date: day.label, value: day[metric], period: "Current period" },
      { date: day.label, value: metric === "sessions" ? day.previousSessions : day.previousSignups, period: "Previous period" },
    ]) },
    line: { style: { lineDash: (datum) => datum.period === "Previous period" ? [5, 5] : [0], lineWidth: 2 } },
    point: { visible: false },
    axes: [{ orient: "bottom", sampling: true, label: { autoHide: true, autoHideSeparation: 24 }, grid: { visible: false } }, valueAxis],
    crosshair: { xField: { visible: true, line: { type: "line", style: { lineDash: [3, 3] } } } },
  }
}
export function channelSpec(data: Analytics): IBarChartSpec {
  return {
    ...base, type: "bar", xField: ["channel", "period"], yField: "sessions", seriesField: "period",
    data: { id: "channels", values: data.acquisition.flatMap((row) => [
      { channel: row.channel, sessions: row.sessions, period: "Current period" },
      { channel: row.channel, sessions: row.previous, period: "Previous period" },
    ]) },
    axes: [{ orient: "bottom", grid: { visible: false }, label: { autoRotate: false, autoHide: false, formatMethod: (text) => text === "Organic search" ? "Organic" : text } }, valueAxis],
  }
}
export function deviceSpec(data: Analytics): IPieChartSpec {
  return { ...base, padding: 0, type: "pie", valueField: "sessions", categoryField: "device", color: { type: "ordinal", domain: [...devices], range: [] }, outerRadius: 0.88, innerRadius: 0.72, pie: { style: { padAngle: 0.025 } }, data: { id: "devices", values: data.deviceData }, label: { visible: false } }
}
export function funnelSpec(data: Analytics): IBarChartSpec {
  return {
    ...base, type: "bar", direction: "horizontal", xField: "value", yField: "stage", barMaxWidth: 23,
    bar: { style: { cornerRadius: [0, 3, 3, 0] } },
    data: { id: "funnel", values: data.funnel },
    axes: [{ orient: "left", grid: { visible: false } }, { orient: "bottom", label: { formatMethod: (value: string | string[]) => shortNumber(Number(value)) }, grid: { visible: true } }],
  }
}
