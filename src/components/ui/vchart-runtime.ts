import { VChart } from "@visactor/vchart/esm/core"
import { registerLineChart } from "@visactor/vchart/esm/chart/line"
import { registerBarChart } from "@visactor/vchart/esm/chart/bar"
import { registerRadarChart } from "@visactor/vchart/esm/chart/radar"
import { registerPolarBandAxis } from "@visactor/vchart/esm/component/axis/polar/band-axis"
import { registerPolarLinearAxis } from "@visactor/vchart/esm/component/axis/polar/linear-axis"
import { registerPieChart } from "@visactor/vchart/esm/chart/pie"
import { registerSankeyChart } from "@visactor/vchart/esm/chart/sankey"
import { registerSunburstChart } from "@visactor/vchart/esm/chart/sunburst"
import { registerTreemapChart } from "@visactor/vchart/esm/chart/treemap"
import { registerHeatmapChart } from "@visactor/vchart/esm/chart/heatmap"
import { registerBoxplotChart } from "@visactor/vchart/esm/chart/box-plot"
import { registerWaterfallChart } from "@visactor/vchart/esm/chart/waterfall"
import { registerLabel } from "@visactor/vchart/esm/component/label/label"
import { registerCartesianBandAxis } from "@visactor/vchart/esm/component/axis/cartesian/band-axis"
import { registerCartesianLinearAxis } from "@visactor/vchart/esm/component/axis/cartesian/linear-axis"
import { registerCartesianCrossHair } from "@visactor/vchart/esm/component/crosshair/cartesian"
import { registerTooltip } from "@visactor/vchart/esm/component/tooltip/tooltip"
import { registerDomTooltipHandler } from "@visactor/vchart/esm/plugin/components/tooltip-handler"

// Add registrations here when a product needs more chart families.
// Importing the all-in-one entry also includes maps, word clouds, and 3D charts.
// VChart's static registry API is unrelated to React hooks.
// eslint-disable-next-line react-hooks/rules-of-hooks
VChart.useRegisters([
  registerLineChart, registerBarChart, registerPieChart, registerRadarChart,
  registerPolarBandAxis, registerPolarLinearAxis,
  registerSankeyChart, registerSunburstChart, registerTreemapChart,
  registerHeatmapChart, registerBoxplotChart, registerWaterfallChart, registerLabel,
  registerCartesianBandAxis, registerCartesianLinearAxis,
  registerCartesianCrossHair, registerTooltip, registerDomTooltipHandler,
])
export default VChart
