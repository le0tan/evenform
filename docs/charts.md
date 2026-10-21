# Evenform 数据可视化

Charts 页面使用 `@visactor/vchart` 2.2.0 的真实 Canvas 渲染。开发时访问 `/#charts`，也可从 Showcase 侧栏的 **Charts** 进入。所有数据均为确定性模拟数据，不连接业务接口。`/starter.html` 保留干净的应用入口，不加载 Charts 示例或 VChart 运行包。

## 已支持的范围

| 图表 | 示例用途 | 交互 |
| --- | --- | --- |
| Line | 日访问 / 注册趋势，前一周期对照 | 实线与虚线区分周期，Crosshair、Tooltip，Sessions / Sign-ups 切换 |
| Grouped bar | 渠道访问量对照 | Tooltip，统一数据色序 |
| Donut | 设备分布 | Tooltip，HTML 汇总、分类数量与占比 |
| Horizontal bar | 访问 → 注册 → 激活 → 订阅 | Tooltip，同一线性尺度，HTML 精确值与逐步转化率 |
| Radar | 六个 0–100 维度的基线 / 当前画像 | 虚实线、菱形/圆点区分，Tooltip、HTML 图例与精确源数据；不以多边形面积作数值对比 |
| Sankey | 获客 → 触点 → 结果 | 点击路径高亮，流量守恒、带宽编码 |
| Treemap | 层级产品收入 | 面积编码、父级标签、点击下钻和 Reset |
| Sunburst | 同一收入数据的层级结构 | 角度 / 环层编码、点击下钻和 Reset |
| Heatmap | 星期 × UTC 时段的活跃度 | 连续色阶、格子 Tooltip |
| BoxPlot | 各地区延迟分布 | 四分位、median、whiskers、IQR 外异常值 |
| Waterfall | 月经常性收入变动桥 | 自动累计、总量标记、增减语义色、连接线 |

当前示例共 11 张图：七张 Advanced 与四张 Analytics。默认打开 **Advanced charts**。七张高级图表使用独立于 Analytics 的模拟数据，其中 Treemap 与 Sunburst 共用同一收入层级；各图提供就地展开的源数据表，不受 Analytics 筛选影响。窄屏的 Sankey / Heatmap / Waterfall 保持必要画布宽度并局部横向滚动，不产生整页横向溢出。

**Overview** 和 **Data tables** 提供 7 / 14 / 30 天范围和设备筛选，四张 Analytics 图、四个指标、数据表与导出共用同一份数据。对照区间是紧邻当前区间、天数相等的上一周期；趋势按周期内天序对齐。CSV 导出当前筛选范围的每日记录及对照值。Conversion rate 卡片显示相对变化百分比，不是百分点。

## 在业务页面复用

```tsx
import { useMemo } from "react"
import type { ILineChartSpec } from "@visactor/vchart"
import { EvenformChart } from "@/components/ui/evenform-chart"

function Sessions({ rows }: { rows: { date: string; value: number }[] }) {
  const spec = useMemo<ILineChartSpec>(() => ({
    type: "line",
    animation: false,
    data: { id: "sessions", values: rows },
    xField: "date",
    yField: "value",
    axes: [
      { orient: "bottom", grid: { visible: false } },
      { orient: "left", grid: { visible: true } },
    ],
  }), [rows])

  return <EvenformChart
    spec={spec}
    label="Sessions over time"
    description="Daily sessions. Exact values are available in the adjacent table."
  />
}
```

`spec` 使用 VChart 原生配置；调用方负责数据、业务筛选、图例和表格。保持 spec 引用稳定，避免无关 React 更新重建实例。`EvenformChart` 提供加载提示、失败后重试、ResizeObserver、自定义主题更新和卸载释放；它不会模拟数据或引入示例业务状态。

Canvas 不提供逐点键盘阅读。必须提供可读的 `label` / `description`，并在业务层提供相应数据表；当前 Demo 的 **Data tables** 包含四张 Analytics 图的精确值，**Advanced charts** 的每张图下方提供 **View source data**。HTML 图例和摘要也保留文字标签，避免仅依赖颜色。

## 主题与参数

`src/styles/tokens.css` 中的 `--ds-chart-series-1` 至 `--ds-chart-series-8` 是分类数据色序；前五个引用 `src/index.css` 的 `--chart-*`，后三个引用同一 Primitive palette。八类颜色为 Blue / Teal / Violet / Amber / Rose / Cyan / Indigo / Lime，含 Light / Dark 配对；界面操作仍保持原来的中性色。颜色唯一值保存在 CSS，不另存 TS 色值表。

`palette="categorical"` 是默认值；`palette="sequential"` 读取 `--ds-chart-sequential-1` 至 `-5` 的连续强度色阶；`palette="change"` 读取 `--ds-chart-change-total/increase/decrease`。传入对象式 `spec.color` 时，封装保留其 domain/type，但将 range 绑定到所选 CSS 色板，因此可在 spec 中以空 range 占位。连续数值域需要与五段色阶对应，例如 `[0,25,50,75,100]`；分类语义使用稳定 domain。色彩不是唯一编码，仍保留线型、标签、明度和精确表格。

图表在自身位置读取 CSS，字号来自 `--ds-text-caption`，字体来自继承的 Geist，文字 / 网格 / Tooltip 表面引用 Evenform 的 foreground、muted-foreground、border、popover 和 radius。通过浏览器计算并将颜色转换为 sRGB，避免把 VRender 不一定能解析的 OKLCH / color-mix 表达式直接传入。主题更新监听根节点，以及图表和祖先的 class / style；密度更新监听根节点 data-density。媒体查询改变 Token 时会随容器 resize 更新；没有引发属性或尺寸变化的任意 CSSOM 修改不在自动监听范围内。

组件高度由 `--ds-chart-height` 控制，默认 280px；也可通过 utility 或 inline 属性有意覆盖 `.evenform-chart` 的 height。默认布局规则位于 components 层。例：

```tsx
<div style={{ "--ds-chart-height": "320px" } as React.CSSProperties}>
  <EvenformChart spec={spec} label="Sessions" description="See the data table for exact values." />
</div>
```

主题由封装统一注入，`spec.theme` 不会替换 Evenform 主题；个别图形差异使用 spec 中相应 mark / axis 配置。Charts 共用 Showcase 的 ThemeProvider 与 Design tokens 面板，使用 `evenform-theme` / `evenform-tokens-v1` 偏好。使用 System 时按钮遵循 resolvedTheme。HTML head 保留同步偏好初始化脚本。干净 Starter 继续使用隔离的 `app-theme` / `app-density`。

## 按需加载和扩展

`src/components/ui/vchart-runtime.ts` 注册 Line / Bar / Pie / Radar / Sankey / Treemap / Sunburst / Heatmap / BoxPlot / Waterfall、Label、直角与 Polar Band/Linear 坐标轴、Crosshair、Tooltip 和 DOM Tooltip handler。其他图表类型、VChart 原生 Legend、动画、DataZoom 等尚未注册；新增时在此文件引入对应注册函数，并补充该能力的交互验证。不要直接换成全量入口来隐式启用全部能力。

VChart 在 `EvenformChart` 挂载时异步加载，Showcase 首页不请求图表运行包。当前含 Radar 注册的构建运行包约 **1.41 MB minified / 394 KB gzip**（构建产物近似值，随构建变化）。历史九类注册版本约 **1.38 MB / 384 KB gzip**；同次全量入口对照约 **1.99 MB / 545 KB gzip**，仅作当时的体积参照。Vite 仍会提示单 chunk 超过 500 KB，这是当前可见的体积限制。后续可按产品需要进一步减少注册能力，或按页面加载更多图表类型。

## 文件与验证

- `src/components/ui/evenform-chart.tsx`：实例生命周期和 CSS → VChart 主题桥接。
- `src/components/ui/vchart-runtime.ts`：按需注册边界。
- `src/components/ui/evenform-chart.css`：图表容器和加载 / 错误样式。
- `src/playground/charts/analytics-data.ts`、`chart-specs.ts`：示例业务数据和图表配置。
- `src/playground/charts/advanced-gallery.tsx`、`advanced-specs.ts`：七张高级图表、层级数据、下钻重置和源数据表。
- `src/playground/charts/index.tsx`、`analytics.css`：Charts 页面与响应式排版；不创建另一套应用壳或主题状态。

验证方法见 [开发指南](development.md)：运行 typecheck、lint、导航检查和两个构建，再启动 Showcase 检查实际图表。图表场景应覆盖明暗主题、两种密度、桌面/窄屏、筛选与键盘 Tabs、层级下钻/重置、CSV 和源数据表的一致性，以及可访问的数据替代入口。通用浏览器脚本只覆盖代表性流程，不能替代这些图表专属检查。

本地历史截图与运行记录不随仓库发布，不作为当前版本已通过检查的依据。每次验证需记录所测提交、图表家族、场景、结果和未覆盖项；构建通过不代表任意图表类型、超大数据量、SSR 或后端接入已验证。

参考：[VChart 示例库](https://visactor.io/vchart/example)、[主题定制](https://visactor.io/vchart/guide/tutorial_docs/Theme/Customize_Theme)、[主题概念](https://visactor.io/vchart/guide/tutorial_docs/Theme/Theme_Concept_and_Design_Rules)。
