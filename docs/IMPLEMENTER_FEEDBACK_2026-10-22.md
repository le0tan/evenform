# Evenform 真实应用迁移反馈与实现交接

日期：2026-10-22。对象：Evenform implementer。

本轮把一个已有 React 19 数据工作台迁入 Evenform，以非 Vite 宿主、密集指标、横向流程图、详情检查器和移动端为实际使用场景。目标是尽量通过 design tokens、复用组件及少量私有组合改善可读性与操作。

结论：现有基础组件可以完成这个场景。主要成本在源码接入、信息层级和组合契约，暂不需要新增通用拓扑、监控或延迟分析组件。请先保留已完成的兼容性修复，再补足接入说明和可运行的组合示例；只有重复需求明确后，才提升为共享 API。

本文件已匿名化，可独立转交；不包含业务仓库地址、业务标识、截图或凭据。详细通用观察见 [adoption-field-notes.md](adoption-field-notes.md)。

## 1. 当前交接状态

- 已提交基线：`feature/real-app-adoption`，整理前 HEAD 为 `2d906b0`。下表“已修复”均指这条本地分支有实现，**不代表已经合入 main 或发布**。
- 关键代码提交：`d7af9b0`、`44fd0f3`。`ba71875` 是已有源码接入/组合能力基线，不应把它的全部改动归因于本轮实测。
- 本轮后续提交主要记录评审和组合经验：`dddf882`、`b6e78b6`、`ea4e051`、`7feb753`、`04b003e`、`2d906b0`。
- 当前工作区另有未提交的源码接入契约、工作区示例、Select 和部分 primitives 修改；其中包括 `docs/source-adoption-contracts.md`、`src/components/ui/option-select.tsx` 等。它们可能已覆盖下面部分建议，接手时先看 diff；本文件依据已提交源码与工作区 diff 区分状态，不把这些进行中改动列为已验收成果。不要整库重置或批量覆盖。

## 2. 已修复项：核对保留，不必重新实现

| ID | 实测问题 | 当前实现与位置 | 需要保留的验收条件 |
| --- | --- | --- | --- |
| F01 | 手工复制 TSX 容易漏掉 CSS、字体、class metadata、偏好初始化和许可证。 | `d7af9b0` 增加 `scripts/adopt-source.mjs`，递归收集本地依赖，输出文件/包依赖清单；不同内容的宿主文件默认阻止覆盖。依赖已有 `core.css` 接入基线。revision/hash/`--check` 属于当前未提交的后续增强。 | 最小宿主可构建；选用可选组件时包含对应 CSS/包/notice；冲突在写入前可发现；不得自动改宿主架构或安装依赖。后续只读校验能力另按 A2 验收。 |
| F02 | 保留旧 `moduleResolution: node` 的宿主无法解析 `cn/engine` 导出及显式 `.ts` import。 | `d7af9b0` 的 exporter 支持 `--legacy-node-resolution`，提供 extensionless class-table import 和上游类型桥接。 | 旧宿主实际 typecheck/build 通过；现代宿主默认路径不受影响；类型仍来自上游，不维护人工类型副本。 |
| F03 | Tabs 高度回退里的嵌套 `calc()` 触发宿主 PostCSS 警告。 | `d7af9b0`，`src/styles/tokens.css`：先解析私有 inset 变量，再计算 trigger 高度。 | 支持受影响的 PostCSS 宿主；公开 sizing tokens、竖向/横向 Tabs 和键盘契约保持一致。 |
| F04 | 指标组 auto-fit 在有用断点之前就拥挤；概览与 inspector 使用同一大数值字号，信息权重失衡。 | `d7af9b0`，`src/styles/extended-patterns.css`：新增 `--ds-stat-group-columns`、`--ds-stat-value-size`。组件仍是 StatGroup/Stat。 | 不设置时保持原默认值；局部配置可分别控制概览列数与详情字号；长标签、数值及窄屏不重叠；不把列数改成人工同步的 TS 参数。 |
| F05 | HeaderShell 窄屏仍保留较大的桌面横向 inset，和正文难对齐。 | `d7af9b0`，`src/styles/workflow-aids.css`：窄屏沿用 `min(page-padding, space-4)` 的既有 cap。 | Header/main/footer 对齐；不同内容的响应式布局仍由应用负责。当前另有 HeaderShell 未提交工作，注意合并后的真实 CSS 优先级。 |
| F06 | CSS reduced motion 不能自动关闭 VChart 的 JavaScript 动画。 | `d7af9b0`，`src/components/ui/evenform-chart.tsx`：读取媒体查询，匹配时禁用 animation，监听 change 并在 cleanup 移除。 | 初始匹配、运行中切换、卸载清理均需保留。此次有源码/构建覆盖；消费页本身一直关闭动画，**不能据此声称动画运行矩阵已测完**。 |
| F07 | 堆叠条中相邻同类别区段颜色一致，边界不可辨；直接在消费 spec 填 palette-key 对象曾产生意外描边。 | `44fd0f3`，`evenform-chart.css/tsx`：CSS 提供 `--ds-chart-bar-separator-width`（默认 `0px`）与 `--ds-chart-bar-separator-color`（回退 `--card`），在实例处解析并转换为 sRGB 后注入 bar theme。 | 默认外观不变；局部 separator 有效；Light/Dark 下相邻段清楚、极小段真实宽度不变；已有折线图保留原颜色。palette-key 试验已撤回，不是交付方案。 |

### 已有参数足够的地方

- 页面宽度、横纵 padding、section/panel gap、control height、文字大小使用既有 Semantic tokens。
- 概览和 inspector 用局部 Component tokens 调整，而不是全局缩放或复制一套 token。
- node width、横向流程几何、inspector 宽度属于产品布局，可留在产品 CSS；无需把所有局部尺寸提升为 Evenform token。
- DateRangePicker 已有 `isInvalid` / `errorMessage`，足以表达查询区间校验，无需新表单 primitive。

## 3. 建议 implementer 接着做的工作

### A. 优先整理接入契约与回归

**A1. 把“选中组件后还要带什么”变成可靠契约。**

已提交的 exporter 会处理本地 import，但部分 pattern CSS 仍需显式选择。请核对当前进行中的 source-adoption 工作是否已覆盖：组件入口、附加样式、可选包、字体、notice、bootstrap、`cn` metadata 及 alias 的接入路径。文档和 exporter 应一致，不要求用户靠打开 Showcase 才发现缺失项。

验收：从空宿主按文档选择一个基础控件、一个 layout pattern、一个带可选依赖的组件即可构建；不无意引入所有可选依赖；不同宿主文件保留冲突保护。现有说明入口为 [dependencies.md](dependencies.md)、[getting-started.md](getting-started.md)。

**A2. 明确复制后的升级、校验与归属。**

当前未提交实现已出现 revision/hash manifest 与 `--check`，但已提交基线只有文件/包依赖清单，未包含这两项；请完成并独立验收，不能把草案当成已发布能力。升级流程应包括只读校验、人工差异审查、宿主修改保护和 notices。`--overwrite` 是显式选择，不应成为升级默认值。区分“原始复制文件”“宿主兼容性转换”“产品私有组件”。若现有 source-adoption 契约已经实现，补齐示例与验收即可，避免做第二套工具。

**A3. 补齐图表新增行为的专项回归。**

优先覆盖 F06 的动态 reduced-motion 与 cleanup；F07 的默认零描边、实例局部覆盖、主题切换、同色相邻段、极小段，以及与已有折线图共存。新增测试应验证行为而非镜像实现。是否扩大至其他 bar 派生图型，按真实使用范围决定；当前不能从一次堆叠条实测推断所有图型通过。

### B. 增加匿名化组合示例，先不增加共享组件

下列例子均已在消费页用现有组件完成。建议放在 Patterns/组合文档，可共用合成数据；不要把原业务组件搬进 `ui/`。

| 组合案例 | 复用组件 | 需要展示的能力与验收 |
| --- | --- | --- |
| 紧凑运行概览 | Card、StatGroup/Stat、Hint | 异常优先，次要库存/元数据降低权重；不机械使用六张等大卡片。桌面与手机维持标签/数值对应。 |
| 列表或图形选择与 inspector | CardHeader/Content/Action、Badge、Tabs、Stat、DescriptionList | 一个 selection source；标题、状态、元数据和指标层次清楚；显式详情锚点可移动焦点。先比较现有 DetailLayout，别新增近似 API。 |
| 响应式比较 | Table、Badge、StatGroup/Stat | 桌面精确对齐，手机身份与对应数值一起出现；“能横向滚到”不等于“能读懂对应关系”。同一数据源生成两种布局。 |
| 渐进展开的分析 | 原生 details/summary、Badge | 折叠时保留核心总量、部分数据提示和当前选择；展开后再显示上下文。单个 disclosure 不需要新 primitive；协调一组展开项时再考虑 Accordion。 |
| 贡献构成与精确值 | EvenformChart、Stat、Table、Badge | 一条真实比例构成图加精确明细；完整名称、共同尺度、极小项、缺失/零值；上下文子项与计入总和的贡献分开。不要把各阶段分位数之和称为实测端到端分位数或执行时间轴。 |
| 图形与贡献的双向选择 | 上述组件加 Button | 图形、贡献行、子项共用选择入口；点贡献选择 owner，点子项选择该子项；相关 owner 高亮和直接 `aria-pressed` 分清。完整明细行为小图段提供较大替代目标，不扩宽数据几何。 |
| 主工作区与 inspector 的区域边界 | 两个 Card、现有 panel-gap/radius tokens | 每个独立阅读区一个轮廓；共同标题/Tabs 在外，面板之间用 gap；不让多条横线交汇到贯通竖线。相关图形与分析仍可共用一块 surface；保留有助读数的趋势/表格分隔。 |

组合交互的验收重点：

- 所有选择入口双向一致；不要只做图形到明细的单向效果。
- 选择后保留触发控件焦点和纵向阅读位置；只在需要时定位局部横向流程。
- 关系变化时可揭示对应上下文；用户手动关闭后，同一选择的数据刷新不要强行重开。
- 缺失、零值和可用数据变化后，重新解析 contribution owner，不保留过期关系。
- 可点击精确行支持 Enter/Space；原生 disclosure 仍能独立展开，不被整行覆盖按钮拦截。

### C. 把样式优先级与合法组合写成明确示例

这轮反复出现的是正确组件在组合时被错误覆盖，不是 primitive 本身失效。

1. **CSS layer 与 utility。** Component 层里更具体的 selector 仍不能覆盖 utility 层。嵌入式 Card 的 radius/ring 需要有意的 className override；独立 Card 则恢复自身轮廓，不给外层再叠边框。
2. **Button 与图形命中层。** Button 的 `outline-none` 会盖过 Component 层 outline。选中图段可用独立非交互 marker，hover 可用伪元素，键盘 focus 保留 primitive 契约。若命中层需要禁用按压位移，须匹配原 active modifier；不要无意删除全库 Button 动效。
3. **合法 HTML。** 不把 Stat 的 `dl` 和整个 flow-content 行直接嵌入原生 Button。可将有完整可访问名称的定位 Button 与展示内容作为兄弟；嵌套 disclosure 位于其命中范围之外。
4. **裁切与焦点。** Card overflow clipping 后，折叠 summary 可能丢失外扩焦点环。局部内收即可；详情锚点 wrapper 可采用同 Card radius。避免全局关闭裁切或修改全部 Card 圆角。

入口：[DESIGN.md](../DESIGN.md)、[compositions.md](compositions.md)、[motion.md](motion.md)。共享参数继续以 CSS 为唯一来源，不添加需要人工同步的 TS/JSON 配置副本。

### D. 单独核查 muted 阅读面的文字对比度

消费页切到 muted canvas 后，实测浅色 muted-foreground/canvas 约 **4.34:1**；局部映射到既有 neutral-600 后约 **7.15:1**，既有暗色组合约 **5.83:1**。这是被测配对的结果，不是全库对比度审计。

建议增加常用 surface × text-role 的实际配对检查，包括选中表面的 secondary text。先判断是角色使用不当、需要专门的语义组合，还是默认值确有问题；不要直接把消费页的局部覆盖推广为全局 palette 修改。

验收：普通小字号正文/辅助文字在目标阅读 surface 上达到 4.5:1；选中背景使用配对 foreground；Light/Dark 与相关 preset 一起检查。

## 4. 不应误报为 Evenform 缺陷的内容

| 观察 | 归属与处理 |
| --- | --- |
| Token 调整后页面仍挤、区域重点不明。 | 应用的信息架构和组件组合。现有 Card、Stat、Table、gap 足够解决本次案例；不能据此声称需要新的 dashboard 框架。 |
| 页面整页横向溢出。 | 本次由 grid intrinsic size 和宽图形的滚动边界引起，使用 `min-width: 0` / `minmax(0, 1fr)` 与局部 scroller 修复。不是全局缩放问题。 |
| 成功采集被显示为业务健康；空值显示零；刷新错误后仍显示旧状态。 | 应用状态与指标语义，需统一计算和恢复状态。Badge、颜色 token 无法推断业务健康。 |
| 时间轴用格式化小时分钟作坐标，跨日/亚分钟数据失去身份。 | 消费端应保留 raw timestamp，独立格式化 tick 和精确表格；缺失值断线，单样本显示点。 |
| 生产 SSO、本地 token、真实数据接入。 | 最终验收改用 mock；不构成组件库 backend/auth 验收。 |
| 开发态更新后出现 RouterWrapper invalid element-type/object。 | 非 Vite 宿主的 HMR 问题仍未定因。正常刷新未恢复，重启 dev 可恢复；显式 Page wrapper 试验无效且已撤回。只能作为宿主兼容性调查项，不能声称是 Evenform 已确认或已修复缺陷。正式 build-and-serve 可用不等于 HMR 健康。 |

## 5. 建议执行顺序与交付清单

1. 核对目标分支是否已包含 F01–F07；保留已有修复，不机械 cherry-pick 或覆盖进行中改动。
2. 完成 A1/A2 的源码接入契约和已有 draft 的整合，按实际覆盖更新文档与 fixture。
3. 补 A3 的专项行为回归，并核查 D 的颜色角色配对。
4. 将 B/C 整理为可运行匿名示例与明确组合说明。遇到第二个真实使用场景后，再提共享 API。
5. 交付代码/文档差异、相关 build/lint 与专项验证结果，明确哪些仅有源码覆盖、哪些已有浏览器证据。

当前仓库已有 `npm run verify:adoption`、`npm run verify:ui` 等入口；以接手时的 `package.json` 为准。纯文档整理无需启动 UI；共享 token/布局或图表行为修改则按受影响组件检查主题、相关密度、桌面与手机，不为一处改动重跑无关场景。

## 6. 本轮证据范围

已有记录包含库/宿主构建、宿主 typecheck 和迁移 lint，以及 Codex 内置浏览器下的合成数据操作。Luna 规划初轮动作，Astra 复核后续源码与截图；浏览器实际操作由主 agent 执行，不是多个独立浏览器执行。

不同迭代覆盖过 Light/Dark、Compact/Comfortable、375/390px 与桌面；最后的面板分区在桌面与 390px、明暗主题及键盘焦点下确认。不要把各轮覆盖合并描述成最终版本的全量矩阵。真实 backend/SSO、完整无障碍审计、所有宿主/图型和动态图表 reduced-motion 矩阵不在本轮已验证范围内。

通用依据保存在 [adoption-field-notes.md](adoption-field-notes.md)、[charts.md](charts.md)、[getting-started.md](getting-started.md)。内部源码与逐轮截图留在消费仓库；需要更多证据时向发起者索取，不将其复制进公开组件库。
