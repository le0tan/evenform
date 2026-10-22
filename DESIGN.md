# Evenform Design System

这套系统面向 React Web App 和使用 Web 视图的 Desktop App。官方 **shadcn base-nova + Base UI** 是视觉和交互基线。不同产品可以相似；可预测的质量优先于独特性。

## 如何使用这份规范

区分三类内容：**工程契约**用于保障可维护性和可访问性（例如 CSS 参数单一来源、主题继承、键盘操作和焦点管理）；**设计原则**帮助权衡信息层级、任务和使用环境；**当前实现**记录 Starter 的默认值与 API，不自动成为所有后续产品的强制要求。

做视觉选择时，先识别用户任务与内容关系，再比较已有 Pattern 和样式能否满足；只有确有缺口时才扩展。调整需要说明具体收益，并保持同一用途的一致性。无需为每个局部细节写论证，也不要为了遵守字面规则，牺牲可读性、必要状态或合适的页面结构。用户明确指定的产品约束优先。

## 默认风格

- Calm / minimal / professional；Geist 自托管字体，中性色，紧凑但可读。
- 用标题、对齐和留白组织页面。内容需要独立身份、背景或操作边界时，Card 是合适的选择；连续阅读或紧密关联的内容通常可以直接排版。按分组关系判断，避免给每个 section 自动套 Card，也不因追求简洁而删除有助理解的容器。
- 默认 Compact：正文 14px，控件 32px，Card padding 16px，section gap 32px，Sidebar 224px。
- Comfortable：正文仍为 14px，控件 40px，Card padding 24px，section gap 40px。
- 当前实现对触摸设备的主要交互控件设置了 44px 的最小目标尺寸，优先于 Compact 的视觉高度。后续组件应根据输入方式、目标间距与误触风险检查可操作性；视觉图形和有效点击区域不必同样大，不能为了统一密度削弱操作体验。
- 当前默认页面标题 28px；小标题 16px；标签 13px；辅助文字 12px。这些字号从基础字号派生。内容层级或阅读距离发生变化时可扩展字号语义，并考虑长文本、换行和窄屏表现；数值是起点，不是所有页面的上限。
- 普通内容优先通过排版和表面关系建立层级，需要轮廓时使用轻边界或细 ring。阴影适合表达浮起、遮挡或可拖动等关系，也可用于确有层次需求的面板；避免边框与阴影重复强调同一边界。渐变、大圆角和强调色应服务于明确的含义、品牌约束或交互，不作为通用装饰惯例，并检查其对层级和一致性的影响。
- 颜色沿用 shadcn 的 background / foreground / primary / muted / border 等变量。当前额外实现 success / info / warning 状态语义，含 Light / Dark 配对；错误复用 destructive。Badge、StatusMessage、Steps 和指标变化按各自用途使用相同含义。分类图表色不承担业务状态语义。若业务还需新状态，先检查已有语义是否适用，避免仅为换色重复命名。

主题色用于主操作、链接、控件的选中/激活态、进度与评分填充，以及焦点提示；选中态优先使用 accent / accent-foreground 配对，实心操作使用 primary / primary-foreground。普通内容、控件未选中态、Card、页面背景与一般边框保持中性；成功/警告/错误、图表分类、语法色及用户选择的内容颜色保持独立。选中表面上的辅助文字采用配对前景色，避免直接继承中性 muted 文字而降低对比度。组件专属覆盖仍可有意改变默认值，例如评分的 `--ds-rating-selected-color`。

全局 Elevation 使用 control / surface / popup / modal 四级语义。Flat 清除可见立体阴影，Soft 保留轻微控件凸起和现有浮层深度，Layered 加强浮动布局与浮层层级；Tabs 等控件保持轻量。边界、状态隔离和焦点圈不属于立体装饰，不能随 Flat 一起删除。组件可通过专属 shadow token 或 utility 有意覆盖；普通 Card 不因选择 Layered 自动获得阴影。

Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining.

Demo 的可见文案服务于操作和内容。设计理由、组件归属与实现契约放在文档或源码注释中，不写成页内解释；保留必要的使用帮助、状态反馈和本地预览边界。

## 分割线的使用判断

分割线是否需要，应根据信息层级、内容密度和阅读任务判断。增加、保留或移除都需要有具体理由；不要习惯性加线，也不要机械地删线。间距、对齐、字重、背景与分割线都是可用的组织手段，选择能让关系更清楚、视觉负担更小的组合。

- **可以使用**：密集表格需要跨列追踪同一行；相邻但职责不同的区域需要明确边界；滚动内容与固定操作区需要区分；仅靠留白容易误读分组关系。线应表达实际边界，并使用统一的语义颜色和线宽。
- **应考虑减少**：标题、间距或背景已经充分表达相同层级；一条线重复强调已有容器边框；连续多条线使视线被切碎，却没有改善扫描或理解。保留真正有帮助的线，不要求同一页面的所有区域采用同一种分隔方式。
- **修改时检查**：这条线分隔的是什么，删除后是否更难阅读，是否在重复已有信号。根据真实内容和实际渲染判断，不能只因组件类型、官方默认或“极简”偏好决定。

Tabs 的选中标记表达状态，整条轨道是否需要另行判断。Table 的行线按数据密度与横向对照需求选择；当前实现的 `--ds-table-divider-width` 回退值为 0，可设置为 `var(--ds-border-width)`。这是当前实现的起始值，不是禁止其他表格使用行线的规范。Card / Dialog footer、设置分组与页面章节也按相同原则判断，不设一律有线或一律无线的要求。控件轮廓和焦点反馈还承担可识别性与可访问性职责，不应被当作装饰线批量移除。

## 唯一参数来源与三层结构

`src/styles/tokens.css` 是设计参数的 CSS 唯一来源，没有需要人工同步的 JSON / TS token 副本。

1. **Primitive**：`--ds-space-*`、`--ds-neutral-*`、`--ds-font-size-base`、字体族、字重、行高、基础圆角、边界、浮层阴影和动效。间距基于 4px。图标和分割线等固定细节可以继续使用官方 utility。
2. **Semantic**：`--ds-page-padding-x/y`、`--ds-section-gap`、`--ds-card-padding`、`--ds-control-height` 等有用途的参数。本 Starter 的密度预设集中覆盖这一层，便于协调组件。组件有不同密度需求时可通过 Component 层适配，但应继续响应同一个预设，避免分散维护互相脱节的尺度。颜色在 `src/index.css` 保留官方 Light / Dark 结构，值引用 primitive palette。
3. **Component**：每个常用组件使用自己的可覆盖参数，回退到 Semantic。比如 Card 的 `--ds-card-inset` 回退到 `--ds-card-padding`；Button 的 `--ds-button-height` 回退到对应 size 的语义高度。

Component 层在组件所在元素解析变量，因此也支持局部 override，不依赖从祖先预先计算的 alias。以 `--_` 开头的变量是实现细节，不能作为公共 API。

`@theme inline` 把需要 utility 的语义暴露为 `px-page-x`、`py-page-y`、`gap-section`、`gap-panel`、`p-card`、`gap-field`、`gap-toolbar`、`h-input` 等。共享布局和组件尺寸优先使用这些语义或已有 Pattern。确实只服务于单个场景的视觉细节可以按其用途局部表达，并检查受影响的主题、密度和响应式表现；不要把每个一次性数值都升级为共享 Token，也不要用散落的 utility 重新定义同一套共享尺度。

## 外观配置

主题色、Elevation、控件尺寸与 Appearance lab 已上线，使用说明见 [Appearance](docs/appearance.md)。默认 Neutral / Soft / Compact / Auto；mode 默认 Light，由 ThemeProvider 独立管理。`data-palette` 选择 Neutral / Indigo / Teal / Rose / Custom，`data-elevation` 选择 Flat / Soft / Layered，`data-control-size` 选择 Auto / Small / Medium / Large。密度与控件尺寸独立，显式组件覆盖继续优先。

Appearance lab 的 General / Tokens / Export 与全局 Design tokens 面板共享状态、编辑器和 CSS 导出。预设值分别由 `src/styles/appearance.css`、`control-sizing.css` 和 `tokens.css` 管理；自定义颜色由用户种子计算 Light/Dark 角色，不维护 TS 预设副本。颜色检查范围与接入要求见使用指南。

## Motion

动效契约与当前审计见 [Motion](docs/motion.md)。沿用 `--ds-duration-fast` / `--ds-duration-standard` / `--ds-ease-out`，进入距离和缩放仍由 CSS 定义。普通状态与浮层使用可中断 CSS transition；Tabs 的滑动标记和非虚拟 SortableList 的布局过渡是 opt-in。视觉默认值不复制到 JS；原生布局动画按实际元素解析 CSS，并响应系统 Reduced Motion。保留 Primitive 的 presence、焦点、键盘与 ARIA；不增加全局页面转场或自动章节入场。

## 常用参数

| 用途 | CSS variable |
| --- | --- |
| 页面左右 / 上下内边距 | `--ds-page-padding-x` / `--ds-page-padding-y` |
| 内容最大宽度 | `--ds-content-max-width` |
| 章节 / 面板间距 | `--ds-section-gap` / `--ds-panel-gap` |
| Sidebar / Header | `--ds-sidebar-width` / `--ds-header-height` |
| Card 内边距 / 内部堆叠 | `--ds-card-padding` / `--ds-card-gap` |
| 共用控件高度 | `--ds-control-height` |
| Button xs / sm / md / lg | `--ds-button-height-xs/sm/md/lg` |
| Input 与 Select 高度 | `--ds-input-height` |
| 控件横向 padding / 图文 gap | `--ds-control-padding-x` / `--ds-control-gap` |
| 表单字段 / 表单组间距 | `--ds-form-field-gap` / `--ds-form-group-gap` |
| Toolbar | `--ds-toolbar-gap` |
| 属性列表条目纵向内边距 / 标签宽度 | `--ds-description-item-padding-y` / `--ds-description-label-width` |
| Table 行高 / 单元格内边距 | `--ds-table-row-height` / `--ds-table-cell-padding-x/y` |
| Dialog 内边距 / 宽度 | `--ds-dialog-padding` / `--ds-dialog-width` |
| Sheet 宽度 / 内边距 | `--ds-sheet-width` / `--ds-sheet-padding` |
| Select 选项高度 / 纵向内边距 | `--ds-select-item-height` / `--ds-select-item-padding-y` |
| 浮层内容分组间距 | `--ds-overlay-gap` |
| Sidebar item 高度 / 间距 | `--ds-sidebar-item-height` / `--ds-sidebar-item-gap` |
| 基础字号 / 圆角 | `--ds-font-size-base` / `--ds-radius-base` |
| 正文 / 标签 / 辅助 / 页面标题字号 | `--ds-text-body/label/caption/page-title` |
| 正文 / 标题字体 | `--ds-font-body` / `--ds-font-heading` |

## 调整全局样式

在 `src/styles/tokens.css` 修改默认值，或新建一个在 `index.css` 最后导入的产品覆盖文件。调整应用密度时，使用相应的语义与组件参数，不通过修改 Tailwind 全局 `--spacing` 或 CSS `zoom` 来模拟；这些整体缩放方式无法分别照顾文字、控件和内容间距。

```css
/* 产品覆盖文件；如果保留密度切换，用同等或更高 specificity */
:root[data-density="compact"] {
  --ds-page-padding-x: 28px;
  --ds-card-padding: 24px;
  --ds-control-height: 36px;
  --ds-sidebar-width: 232px;
}
```

在 HTML 根节点设置 `data-density="compact"` 或 `comfortable`。Dark theme 使用根节点的 `.dark`；ThemeProvider 负责持久化与系统主题监听。主题和密度是两个独立维度。

Playground 的修改施加在根节点，因此 Portal 中的 Dialog / Sheet / Select 也会继承。面板默认值由浏览器从 CSS 解析；会用测量元素解析 `calc()` 和变量别名，避免把 `calc(...)` 当成数字。TS 中只有 label、分类、编辑范围、step 和单位等开发工具 metadata。保留 7 个主要滑杆，Advanced Tokens 按 Layout / Controls / Forms / Data / Overlays / Typography 折叠分组。切换密度会清除当前覆盖值，保证 preset 不被旧值遮蔽。选择 **Copy token overrides** 导出修改过的 CSS 值，不复制一份完整 Token 表。覆盖值和主题存储在浏览器 localStorage，不写回源码。Advanced 可以固定原本派生的语义（例如 input-height），因此主要滑杆改变后该显式值可能保持不变；Reset 或切换密度会清除这些覆盖，恢复派生关系。导出保留 px 与无单位值的区别，行高不会带 px；采用时将 HTML 的 density 设为导出注释指定的值，并最后导入覆盖文件。

滑杆恢复到当前 CSS 回退值时会自动移除对应覆盖，同时清除标记、持久化条目和导出值；回退值按当前 density、control size 及其他覆盖计算，不在 TypeScript 维护默认数字。加载已保存的偏好时也会清除这类冗余覆盖。

窄屏上页面横向 padding 上限为 16px，避免过大的桌面参数挤压内容。移动端 Sidebar 使用单独宽度上限；桌面 `sidebar-width` 控件仅影响桌面导航。Inspector 的固定字号和内边距属于开发工具本身，避免调整产品参数时工具失去可用性。

## 首次绘制与主题状态

`index.html`（Showcase）和 `starter.html`（干净 App）在 head 中、样式和 React 入口之前同步加载 `public/evenform-init.js`。不要给它添加 async / defer：它负责提前恢复主题、density 和已保存的 CSS overrides，没有另存设计默认值。ThemeProvider 和编辑器的 layout effect 负责运行时更新；存储不可用时使用 HTML/CSS 与 Provider 默认值。

采用到其他项目时，把 bootstrap 脚本与 HTML 一起保留。`data-theme-key` 要与 ThemeProvider 的 `storageKey` 一致，`data-default-theme` 与 `defaultTheme` 一致；density key 用于偏好记录，Showcase 还保存 control size、palette、custom color 和 elevation；Starter 的基础记录为 `{ density, overrides }`。Showcase 使用 `evenform-theme` / `evenform-tokens-v1`；Starter 使用 `app-theme` / `app-density`，避免演示偏好进入业务入口。脚本支持旧版数字 overrides，也支持带单位的 CSS 值字符串。

`useTheme()` 保留 `theme` / `setTheme`，并提供响应式的 `resolvedTheme`。Theme 为 system 时，使用 resolvedTheme 渲染图标、按钮名称等；它通过系统媒体查询订阅更新。ThemeProvider 不注册应用快捷键。若产品需要快捷键，应在产品或 Playground 层定义、处理输入焦点，并明确呈现给用户。

独立 App 如需切换密度，可由产品状态更新根节点 `data-density`，并按 bootstrap 使用的 key 持久化 `{ density, overrides }`；无需导入 Playground 的编辑器 Hook。CSS 仍负责全部密度参数。

## Cascade Layers 与局部覆盖

组件尺寸规则、Layout Patterns 和 Showcase 排版放在 `@layer components`，Tailwind 的 `utilities` 层在它之后。颜色/参数定义仍是 CSS Variables。不要新增未分层的通用组件属性规则来覆盖这一契约：普通未分层 CSS 会高于所有普通分层声明。需要页面样式时优先使用 components 层，确有意覆盖层级时说明作用范围。

有两种不同的优先级：**变量取值**由局部 Component Token 回退到 Semantic 决定；**最终属性**则由 CSS cascade 决定。设置一个 inline 自定义变量不等于设置 inline height。

| 实例（Comfortable） | 实测高度 | 含义 |
| --- | --- | --- |
| `<Button />` | 40px | 跟随密度语义 |
| `style={{ "--ds-button-height": "44px" }}` | 44px | 局部组件变量，其他属性仍共享 |
| `className="h-12"` | 48px | utility 覆盖 token-based height 声明 |
| 同时设置上面的组件变量与 `h-12` | 48px | utility 决定属性，变量不会反过来压过它 |
| `className="h-12" style={{ height: 52 }}` | 52px | inline 属性覆盖普通 utility |

`<Card style={{ "--ds-card-inset": "24px" }}>` 会同步影响 Header / Content；`<CardContent className="px-8">` 只让该 Content 变为 32px，不改变 Header。需要共享传播时优先用变量；刻意脱离某个共享属性时可用 utility。组件自身不再同时携带与 Token 争夺同一属性的尺寸 utility；调用方的 `className` 用于明确的局部选择，不需要 `!important` 才能生效。

属性覆盖后，该属性不再跟随相关全局 Token，这是 CSS 的预期结果。触摸设备的 min-height 仍可能使 h-8 渲染到至少 44px；显式覆盖 min-height 前检查有效点击区域。自定义未分层 CSS、important 与外部主题可能改变上述契约，接入时需按真实级联检查。

Components 的 **Local overrides** 页提供上述实际组件，可以切换密度、调整参数并观察。`scripts/verify-refinements.mjs` 用 computed styles 验证优先级。

## Component 参数化契约

| 组件 | Component token / fallback |
| --- | --- |
| Button（全部 size，含 icon） | `--ds-button-height` → size semantic；`--ds-button-padding-x` → control padding；`--ds-button-gap` → control gap |
| Input / Select trigger | `--ds-input-control-height` → input height；`--ds-input-padding-x` → control padding |
| SelectItem | `--ds-select-option-height` → select item height；纵向 padding 跟随密度 |
| Textarea | `--ds-textarea-height` → textarea minimum；共用 control padding |
| Card / Header / Content / Footer | `--ds-card-inset` → card padding；`--ds-card-stack-gap` → card gap |
| Dialog | `--ds-dialog-inset` → dialog padding；`--ds-dialog-max-width` → dialog width |
| Sheet / Header / Body / Footer | `--ds-sheet-inset` → sheet padding；`--ds-sheet-max-width` → sheet width；分组间距跟随 overlay gap |
| Tabs | `--ds-tabs-inset`、`--ds-tabs-item-gap`、`--ds-tabs-trigger-height`；默认导航 trigger 跟随 control height；`TabsList size="control"` 的水平外框跟随 `--ds-tabs-control-height` → control height，内部减去双侧 inset；触摸目标仍至少 44px，可撑大外框 |
| Table | `--ds-table-height`、`--ds-table-padding-x/y` → row height/cell padding；`--ds-table-divider-width` 当前回退值为 0，按表格的阅读需求选择 |
| DescriptionList / DescriptionItem | `--ds-description-padding-y` → description item padding；`--ds-description-term-width` → description label width；`--ds-description-column-gap` → panel gap；`--ds-description-content-gap` → control gap（窄容器为 form field gap） |
| Sidebar | width 语义；`--ds-sidebar-inset`、`--ds-sidebar-menu-gap`、`--ds-sidebar-button-height` |
| Toolbar / FormField / 官方 Field | toolbar gap / field gap / form group gap |

Button 和 Input 使用稳定的 `data-ds-component`，避免官方 `render` 组合 API 改写 `data-slot` 时丢失尺寸。基础组件仍保留官方 API、状态、键盘交互、Portal 和 ARIA。组件共享尺寸由 Token 管理，调用方调整尺寸时优先使用 `size` 或组件变量。局部样式有真实需求时可以扩展，但应先确认 CSS 级联关系，避免 Token 和 `h-* px-*` 同时争夺同一属性，造成修改不生效或破坏密度切换。

```tsx
<Card style={{ "--ds-card-inset": "var(--ds-space-6)" } as React.CSSProperties}>
  <CardHeader><CardTitle>Independent panel</CardTitle></CardHeader>
  <CardContent>Local override; other Cards keep the shared setting.</CardContent>
</Card>
```

保留 Card 的 `size` API；当前两种 Card size 共用 spacing contract，sm 只影响标题层级。单个场景需要更紧凑的 Card 时，可用局部 Component token；若多个场景反复出现同一需求，应评估正式 size 变体并让它继续响应密度。避免为解决局部需求另造一套与现有系统脱节的全局密度机制。

## Table 与详情属性列表的选择

先看阅读任务，再选组件；数据呈现为 key/value 并不意味着必须用 Table，也不意味着 Table 不适合详情。

| 阅读任务 | 优先考虑 | 判断依据 |
| --- | --- | --- |
| 比较多条项目、运行、用户或订单记录 | `Table` + 适用时的 `DataListLayout` | 每行是同一类记录，列是稳定字段，需要逐列扫描、排序、筛选或选择 |
| 理解一条记录的配置、运行信息或摘要 | `DescriptionList` + `DescriptionItem` | 每项是一个标签和值，各字段类型或长度可以不同，通常不需要跨行逐列比较 |
| 单条记录包含需要严格二维对照的数据 | `Table` | 即使只有一条业务记录，矩阵或多组可比较参数仍可能需要表格；不要机械按记录数量决定 |
| 修改字段 | `FormField` / 官方 `Field` | 属性列表用于展示，不替代表单的 label、描述与错误关联 |

`src/components/patterns/description-list.tsx` 使用原生 `<dl>`，每项 `<div>` 包含相邻的 `<dt>` / `<dd>`。不添加 table/grid 角色，也不让静态属性获得多余焦点。值可以是文字、Badge、time、链接或其他 React 内容；链接与按钮继续使用各自的交互与焦点契约。缺失值由业务明确表达，如“未设置”，数字 0 不应当成缺失值。

```tsx
import { DescriptionList, DescriptionItem } from "@/components/patterns/description-list"

<PageSection title="运行信息">
  <DescriptionList columns={2} aria-label="运行信息">
    <DescriptionItem label="模型">GPT-6.1-Sol</DescriptionItem>
    <DescriptionItem label="Provider">pangle-sol</DescriptionItem>
    <DescriptionItem label="停止条件">agent_finished</DescriptionItem>
    <DescriptionItem label="动作预算">80</DescriptionItem>
    <DescriptionItem label="结果" className="col-span-full">核心循环已展示；其他机制尚未评估。</DescriptionItem>
  </DescriptionList>
</PageSection>
```

默认 `columns={1}`；`columns={2}` 表示空间足够时每排两组属性，DOM 顺序与从左到右、再向下的视觉顺序一致。外层无视觉样式的容器用于 Container Query：可用宽度达到 40rem 时允许两组，低于 24rem 时每项标签和值上下排列。因此放进 Sheet 或窄面板也会适配，不只看屏幕宽度。长文本与无空格 ID 可换行，不默认截断；宽内容可用 `col-span-full`。这些断点是当前排版策略，不是新的设计参数副本。

条目纵向内边距的 Semantic Token `--ds-description-item-padding-y` 派生自 `--ds-table-cell-padding-y`，默认随 Compact / Comfortable 为 8px / 12px；可以独立调整，不必让业务重复补 CSS。标签宽度 `--ds-description-label-width` 为 128px。两组属性之间沿用 panel gap，标签和值之间沿用 control / form field gap；字号、行高与颜色直接使用现有 Evenform 语义，无独立灰阶、背景或圆角体系。Advanced Tokens → Data 可调前述两个语义，Reset / Copy CSS Overrides 继续适用。

局部变量与 utility 的优先级沿用现有 components → utilities 契约。例如在 DescriptionList 上设置 `--ds-description-padding-y`，会传到所有条目；单个 DescriptionItem 的 `className="py-0"` 则只覆盖该条目的内边距。变量和 className 作用于 `<dl>`，自动响应容器宽度的外包装不承担视觉样式。

默认靠标签的次要文字色、对齐与间距分组；可传 `divided` 在每项底部使用现有 border 语义。在长说明、密集信息或需要沿行追踪时考虑分隔线；已有分组信号足够时可省略。分隔线不是必须或禁止的风格。不要习惯性给所有标签添加整块灰底，也不禁止有明确分组或阅读收益的背景处理。

Playground → Components → In context 展示真实运行信息、长结果与路径、带分隔线的复核信息；Workspace 的项目 Sheet 使用同一组件，验证它在窄浮层中的复用。

## 数据可视化

`EvenformChart` 为 VChart 提供 CSS Token 主题桥接、实例生命周期、响应式尺寸和加载 / 错误反馈。当前注册 Line / Bar / Pie / Radar / Sankey / Treemap / Sunburst / Heatmap / BoxPlot / Waterfall（含 Polar Band/Linear axes）；图例与数据表由业务层组合。界面保持中性，数据使用独立的 Light / Dark 彩色 palette：分类用 `--ds-chart-series-1` 至 `--ds-chart-series-8`，连续强度用 `--ds-chart-sequential-*`，增减总量用 `--ds-chart-change-*`；不把数据分类色解释为操作或业务状态。高度为组件参数 `--ds-chart-height`。折线对照同时使用线型，分类同时提供文字与精确值，不仅靠颜色阅读。Canvas 图表必须配可读摘要与数据表入口。具体 API、已注册能力和运行边界见 [charts.md](docs/charts.md)。

## Layout Patterns

`src/components/patterns/layouts.tsx` 是组合层，不取代 shadcn。

- **AppShell**：适合带持久导航的工作台，带官方 SidebarProvider 的应用壳；接收 sidebar、header、children 和可选 aside。集成 Skip link、统一 header 和内容最大宽度。
- **PageHeader**：适合常规内容页的标题、副标题和操作区。编辑器等特殊页面可采用任务适配的顶部结构，同时保持清楚的页面身份与标题语义。
- **PageSection**：同页逻辑内容组，自动关联 section heading；不默认套 Card。
- **SettingsLayout / SettingsGroup**：设置页侧向或窄屏顶部导航、分组表单、统一间距。
- **DataListLayout**：工具栏、表格或列表、空状态和 footer。搜索/分页/数据逻辑由业务持有。
- **DescriptionList / DescriptionItem**：一条记录的属性与摘要，支持容器响应式列数与可选分隔线；选择依据和 API 见上节。
- **Toolbar**：一组可换行的操作。
- **FormField**：label、control、描述、错误的统一节奏。调用方提供 id，并把 `${id}-description` / `${id}-error` 传给控件的 aria-describedby。

新页面先判断任务是否适合已有 Pattern，再组合官方组件。登录页、全屏编辑器、阅读页等不应被强行塞进 Sidebar 工作台结构；可组合或扩展布局，同时沿用适用的 Tokens、交互和无障碍约定。示例中的业务状态保留在页面中；真实产品可按路由、跨页共享或持久化需求放置状态。只有重复的页面结构和演进需求足够明确时，才考虑通用配置层，不为抽象而抽象。

```tsx
<PageHeader title="People" description="Manage your team." actions={<Button>Invite person</Button>} />
<PageSection title="Members">
  <DataListLayout toolbar={<Input aria-label="Search people" />} isEmpty={!people.length}
    empty={<p>No people yet.</p>}>
    <Table>{/* header/body */}</Table>
  </DataListLayout>
</PageSection>
```

新增视觉参数时，先区分共享需求与局部细节。相同用途复用已有语义；不同用途即使数值相同，也不必绑定成同一语义。共享需求优先扩展 Semantic，再由 Component token 回退引用；组件特有的稳定参数可放在 Component 层，一次性排版细节可以保持局部。需要业务 utility 时再加 `@theme inline`。验证范围跟随影响面：共享参数在实际使用点检查传播（有多个使用点时至少覆盖两个），并检查受影响的主题、密度与视口；不为凑覆盖而制造无用示例。

## 干净 App 入口与 Showcase

两者共享 `src/index.css`、`styles/tokens.css`、`styles/patterns.css`、`components/ui`、`components/patterns` 和 ThemeProvider。

- Showcase：`index.html` → `src/main.tsx` → `src/App.tsx`，包含完整演示与编辑器，单独导入 playground.css。Charts 是独立导航页面（`/#charts`），示例、数据与局部样式位于 `src/playground/charts/`，共用 Showcase 的应用壳、主题和 Token 编辑器；页面与图表运行包按需加载。
- Showcase 目录：Components / Patterns / Charts 的分类、具体组件和示例共用一条可折叠侧栏；正文直接展示当前页面，不叠加第二条分类导航。保留同一任务内的局部 Tabs。当前页使用原生链接与 `aria-current`，hash 路由支持分享、刷新和浏览器历史；移动端复用目录到 Sidebar Sheet。目录搜索优先匹配具体组件，结果与目录共用 `src/playground/showcase-examples.ts` 的真实示例索引。`?anchor=example-…` 定位并聚焦示例；存在局部 Tabs 时由 `?preview=…` 同步打开对应面板。原有分类链接继续可用。只有可见目标且浮层已关闭时才移交焦点，避免定位到未挂载或隐藏的面板；应用层注册 ⌘ / Ctrl + K，并避开输入编辑焦点。Workspace / Settings 归入 Application examples，Token Inspector 默认关闭、按需打开。导航尺寸和颜色复用现有语义参数，元数据只在 Playground，不进入共享组件或 Starter。
- App Starter：`starter.html` → `src/starter/main.tsx` → `src/starter/App.tsx`，只包含可替换的应用壳与 Home 内容，不导入 Showcase 页面、图表 Demo、模拟数据或编辑器。独立构建不包含 VChart 运行包；共享 `EvenformChart` 组件保留在 components 层，业务可按需采用。
- `npm run build` 构建两个入口；`npm run build:starter` 只构建业务入口并在 dist-starter 输出 index.html。两个构建没有复制设计系统。源码中保留 Showcase 作为参考，未来开发直接编辑 src/starter/App.tsx 即可，无需先删演示文件。

Accordion 正文默认继承内容色；内容是否为辅助说明由调用方决定，可在 `AccordionContent` 上显式使用 `text-muted-foreground`。带主报告的组合见 [Compositions](docs/compositions.md)。

所有组件通过 `@/lib/utils` 合并类名。`lib/cn-tables.ts` 从 CSS `@theme` 自动生成；修改 theme scales 后重新生成，不手工维护一份字号表。基础接入可用 `src/core.css`，全库入口 `src/index.css` 复用它再补充扩展组件样式。

Sheet 正文优先组合 `SheetBody`，与 Header / Footer 使用同一 inset，并负责内部滚动。全出血区域可用 `className="p-0"` 明确覆盖 Body；例如移动端 TokenPanel 自己管理开发工具内边距。Dialog / Sheet 的 Comfortable inset 为 32px，Compact 为 24px；SelectItem 同步调整高度和 padding。触摸目标、表格自然撑高和正文可读性优先于强制固定尺寸。

## 官方来源与升级

初始化使用 `shadcn@4.22.1 init --template vite --base base --preset nova --css-variables`。CLI 的 preset 参数为 `nova`，生成的 style 为 **base-nova**；不是仅将配置名称改为 Nova。组件通过同一官方 CLI `add` 下载。

- [Official create](https://ui.shadcn.com/create)
- [Theming](https://ui.shadcn.com/docs/theming)
- [components.json](https://ui.shadcn.com/docs/components-json)
- [Tailwind theme variables](https://tailwindcss.com/docs/theme)

升级前用 `npx shadcn add button --diff` 检查官方变更；不要直接 `--overwrite` 所有本地 Token 接线。对照上游的样式、API、行为与无障碍变化，保留或适配本地 Token 接线；如升级涉及交互修复，也应检查焦点、键盘和状态行为，不能为了保持源码不变而跳过必要更新。`use-mobile` 保留官方 768px 断点，改用 useSyncExternalStore 以符合模板自带 lint 且避免移动端首次显示桌面侧栏。

## 有意保留的固定细节

官方图标大小、checkbox/switch 内部几何、Avatar、Badge、Tooltip 的小内边距、focus ring、popup 的定位和进退场细节目前主要沿用 shadcn Nova 自带样式。分割线的采用与否按前述信息层级原则判断。Sidebar 的折叠 icon 模式、子菜单和 action 附件尺寸保留官方默认，本 Playground 使用 offcanvas 模式。这些细节当前较稳定，不是全局密度的主要调整面，因此尚未全部参数化。若它们成为反复调整的共享需求，或影响可读性和操作体验，应在对应层级补充参数；不必提前为每一个像素增加 Token。

响应式断点、Skeleton 演示尺寸、开发面板宽度属于局部 composition。Table row height 是最小自然排版约束：多行内容或较大的字号会合理撑高，不强制裁切文字。当前示例在窄屏保留表格局部横向滚动。业务表格可按列数和对照任务选择局部滚动、折叠次要列或改为列表，但应保留字段关联和重要信息，并避免页面整体横向溢出。

## 验收与边界

本 Starter 的完整基准验收包括 `npm run build`、`npm run lint`，以及桌面/窄屏、Light/Dark、Compact/Comfortable 的实际页面与截图检查。后续改动按影响范围选择验证：较大 UI 改动应启动页面检查实际渲染；共享布局、Token 或主题变动应覆盖相关视口、主题和密度；局部改动检查对应场景与交互；纯文档修改检查表述和引用即可。`npm run verify:ui` 可重跑完整基准，保存 `evidence/` 下的截图和 computed style 结果，无需对每次小改动机械重跑全部组合。没有后端；示例项目存在当前页面内存，设置、主题和 Token overrides 保存在本地浏览器。Desktop App 复用的是同一个 Web UI；系统窗口栏、安全区、原生菜单、Electron/Tauri 的 CSP 和平台行为由具体 App 负责接入。

## 扩充组件与组合的边界

完整目录、导入和示例见 [components.md](docs/components.md)，参考目录逐项映射与能力边界见 [reference-audit.md](docs/reference-audit.md)，依赖和完整 CSS 清单见 [dependencies.md](docs/dependencies.md)。本次累计扩展不新增全局 Token；VirtualList 的数据身份/完整内容策略、InputTag 的提交数据、PeriodPicker 的周期序列化、DataTable 的树行/列状态，以及 ResizeBox/可编辑文本的业务保存都通过当前组件 API 交给应用。控件专属几何在 components 层局部回退到已有语义，CSS 仍是参数唯一来源。新增交互继续组合 Base UI，保留受控/非受控状态、render、ref、键盘和 ARIA 契约；菜单命令、远程查询、过滤、选择、分页数据和提交均由业务持有。`AlertDialogAction` 是同步 Close 组合；异步任务用 controlled Root + 普通 Button，成功后再关闭。

新增的 EmptyState、StatusMessage、Stat、Timeline、Steps、FilterBar、DetailLayout、AuthLayout、FormSection 和 SelectionBar 不导入 Playground。StatusMessage 默认没有 live role；异步反馈按需传 `role="status"` / `alert`。Steps 是静态有序进度，按状态设置 aria-current 与文字说明，不伪装成可点击向导。FormSection 保留原生 fieldset/legend 与 disabled。容器响应式处理详情辅栏、登录分栏、表单列数和步骤方向，不要求采用 AppShell。

共享状态扩充限定为 `--ds-info` / `--ds-info-surface`、`--ds-warning` / `--ds-warning-surface` 四项。深色只更换前景原色，surface 从相同状态语义和背景以 Oklab 混合；不为每个 Badge、提示条或步骤单独定义配色。既有 success 也使用同样的混合方式，避免中性背景在 Oklch 中参与 hue 插值时偏色。其余新控件复用现有空间、文字、control、input、select、overlay 参数。浮层可读宽度、图标/滑块几何与结构断点保持局部；需要稳定局部覆盖的组件参数在 CSS 中回退到现有语义，不维护 TS 数值副本。

Button 的默认圆角与尺寸一起放在 components 层，ButtonGroup 的连接边角通过稳定的 data-ds-component 标记生效；调用方的 rounded-* utility 仍能有意覆盖。InputGroup 让内层输入去除重复轮廓，并从输入高度减去外层边框，保证单独输入与组合控件遵循同一高度；禁用附加操作不会把可用输入误显为禁用。

Showcase 默认进入 Foundations。Components 默认展示 Core controls；In context 与既有验证例子继续保留。Patterns 为独立按需加载页面（`/#patterns`），提供数据工作台、记录详情和账号布局。它们的模拟数据、校验与审核状态均在 playground 页面，Starter 不导入这些内容。

## Source adoption compositions

Select 的 items 与延迟挂载标签、OptionSelect、HeaderShell workspace、菜单 GroupLabel、Card 滚动流与公共表面参数见 [Source adoption contracts](docs/source-adoption-contracts.md)。Card 默认不参与 flex 压缩；确需压缩的布局通过 shrink utility 或 --ds-card-shrink 显式选择并提供内容滚动边界。浮层 tint / opacity / blur 共享语义参数，继续保留原有 presence 与 reduced-motion。

匿名运行概览、双向选择、响应式精确比较与 inspector 示例见 [Compositions](docs/compositions.md#operational-review-one-selection-several-views)。muted 阅读面的辅助文字使用 --ds-reading-muted-foreground，选中面使用配对 accent-foreground；该局部角色不更改全局 palette。
