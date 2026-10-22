# Evenform dependency and adoption boundaries

Evenform 复用成熟交互模型，CSS 继续是外观参数的唯一来源。依赖负责日期、文档、表格、拖动等实际状态与行为；Token 负责主题、密度、间距和层级，不能用样式替代交互引擎，也不从第三方 theme 另建一份 TS/JSON 设计参数表。

本页依据当前 package.json、lockfile 与共享模块。版本应与 lockfile 一起采用；以下 major/API 提示不是可随意跨版本升级的保证。API 目录见 [components.md](components.md)，设计契约见 [DESIGN.md](../DESIGN.md)。

## 依赖按实际复用入口划分

| 依赖 | 共享入口与保留能力 | 采用边界 |
| --- | --- | --- |
| React / React DOM、TypeScript、Vite | 当前 React 19 + TS/Vite Starter，React ref props 与 hooks | 宿主构建/SSR/renderer 由产品对齐；不能直接复制到不兼容 React 版本 |
| @base-ui/react | Button、输入/选择、菜单/导航、浮层、Toast、OTP、Meter、Toolbar 等 | 首选交互 primitive；保留键盘、焦点、事件、render/ref 与表单语义，Evenform CSS 管外观 |
| react-aria-components + @internationalized/date | 日期/时间字段与选择器、Calendar/RangeCalendar、Tree、Cascader ListBox、Color、SortableList | 补充成熟日期/颜色/collection/拖动模型；isDisabled/onChange 等 API 不与 Base UI 强行同名；区域与日期序列化由产品决定 |
| @tanstack/react-table（v9） | ui/data-table 的 feature registry、useDataTable、语义 renderer | 排序/过滤/可见性/选择/分页/展开/列固定/尺寸/调整；表格本身不依赖 query 或 virtualization 包；远程请求归业务 |
| @tanstack/react-virtual（v3） | ui/virtual-list 的窗口范围、动态行测量与滚动定位 | 独立语义列表；稳定 key、估算行高与焦点保留由 wrapper 连接，数据删除/完整内容可访问策略归应用；不自动虚拟化 DataTable/Tree |
| @tiptap/react、@tiptap/starter-kit、@tiptap/extension-placeholder、@tiptap/pm（v3） | ui/rich-text-editor 的真实 JSON 文档/编辑器 | 标准 schema、历史、文本格式、列表/链接与扩展入口；持久化/协作/额外 schema 兼容归产品；不另造 contentEditable 假编辑器 |
| @fullcalendar/react（v7） | ui/event-calendar；daygrid/timegrid/interaction/themes/classic 子路径 | 月/周/日事件网格与事件交互；当前插件由同一 v7 包子路径提供，勿混装 v6 独立插件；高级资源调度/付费插件不在默认接入范围 |
| cmdk | ui/command 的搜索/分组/键盘命令选择 | Dialog 仍组合 Evenform/Base UI；没有全局快捷键或业务命令注册器 |
| react-resizable-panels（v4） | ui/resizable 的 Group/Panel/Separator wrappers 和 ref/layout hooks | 保留指针/键盘分栏、约束与布局 API；旧版 PanelGroup/PanelResizeHandle 示例不直接适用 |
| embla-carousel-react | ui/carousel | 拖动/触摸、snap、方向与插件入口；默认不附带自动播放插件 |
| qrcode.react | ui/qr-code 的 QRCodeSVG | 真正编码 SVG，保持可访问名称与 quiet zone；不把 QR 模拟图片当编码器 |
| react-mentions-ts | ui/mentions | caret、markup/明文映射、候选列表、异步请求取消、refs；查人/权限/通知由业务实现 |
| @visactor/vchart | ui/evenform-chart、ui/vchart-runtime | 共享图表生命周期/主题桥接，运行包动态导入，按图表族注册；范围与数据替代入口见 [charts.md](charts.md) |
| @fontsource-variable/geist、lucide-react | 共用字体/图标 | 字体本地构建；图标沿现有尺寸/颜色语义，不引入平行视觉库 |
| class-variance-authority、cn | 组件 variant 与 class 合并、lib/utils | 组合类名工具，不保存主题/密度参数 |
| Tailwind v4、@tailwindcss/vite、shadcn、tw-animate-css | src/index.css 与构建链 | shadcn/tailwind.css 是样式构建依赖；生产部署采用已构建 CSS，不能因 shadcn 位于 devDependencies 而在构建前省略安装 |

原生 File、Clipboard、video、CSS aspect-ratio/sticky 和 SVG 适用时直接复用浏览器。Transfer、Rating、Image/Preview、ImageEditor、GradientPicker、Countdown 等组合使用既有 primitives/原生能力，没有为每个目录名称新增第三方框架。InputTag、ResizeBox、EditableText 与 ExpandableText 也复用原生输入/指针/键盘/ResizeObserver 和已有 Evenform parts；PeriodPicker 复用既有 React Aria 与日期包。ImageEditor 的配置预览无需像素处理包；真实像素导出若成为产品需求再选择相应实现。

这里没有 Arco/Untitled 运行依赖。它们帮助审视能力覆盖；Evenform 的 props、视觉和数据边界由共享源码定义。

## 样式与复制边界

完整复用时以 `src/index.css` 为合并入口，包含以下全部共享 CSS。不能沿用早期只复制五个 CSS 的清单；新增组件也依赖这些基础规则。`design-tools.css` 内还导入 FullCalendar v7 skeleton 与 classic theme，并放在 components layer。

```text
src/index.css
src/styles/tokens.css
src/styles/appearance.css
src/styles/control-sizing.css
src/styles/patterns.css
src/styles/extended-controls.css
src/styles/extended-patterns.css
src/styles/compositions.css
src/styles/advanced-controls.css
src/styles/data-controls.css
src/styles/date-controls.css
src/styles/choice-tools.css
src/styles/layout-aids.css
src/styles/data-forms.css
src/styles/media-aids.css
src/styles/utility-aids.css
src/styles/product-patterns.css
src/styles/workflow-aids.css
src/styles/design-tools.css
src/styles/specialized-aids.css
src/styles/period-controls.css
src/styles/list-input-aids.css
src/styles/content-aids.css
```

`ui/evenform-chart.tsx` 自行导入同目录的 evenform-chart.css，按需采用图表时也要复制该文件和 vchart-runtime.ts。不要只复制 JSX 不带相邻的 CSS。ThemeProvider、hooks/use-mobile.ts、lib/utils.ts、alias 配置和 public/evenform-init.js 也随共享入口一起采用。产品覆盖文件最后导入，普通组件属性留在 components layer，让 utilities 可有意覆盖。

完整 Starter 保留 package.json/lockfile 与上面 imports。仅按需采用部分模块时，可裁剪未使用模块及其依赖/样式，但要先追踪 transitive imports：例如 DatePicker 依赖 Calendar/DateField，TreeSelect 依赖 Tree/Button/Popover，ImageEditor 依赖 Image/FileUpload/Slider/RadioGroup，EventCalendar CSS 依赖 FullCalendar。单独不用 EventCalendar 的轻量项目可不接入它的包与专属样式；完整 index.css 仍含它的 CSS imports，必须同步调整，不能仅删除 npm 包。

不复制 `src/playground/` 的页面状态、图表数据、Token 控制器或演示 CSS 作为业务 API。Showcase 的开发样式和部分 gallery 排版即使与组件 CSS 同文件，也不代表业务入口需要导入 gallery。新页面使用 src/starter/App.tsx，并保留与 ThemeProvider 对齐的 head 初始化参数。

## 浏览器与服务端边界

日期/颜色/collection primitives 保留上游对应契约，不意味着整个 Starter 已支持服务端渲染。ThemeProvider 读取浏览器偏好；图表、图片配置预览和水印依赖 DOM 测量；Tiptap 使用 immediatelyRender=false；Clipboard、媒体、FileUpload 仍是浏览器能力。SSR 消费方需要相应客户侧入口、稳定 locale/timeZone 与首帧数据，并验证 hydration 和 Portal。Countdown 的时钟值尤其需要避免服务端/客户端时间差造成不一致。

ref 的目标也随引擎区分：SearchField/PasswordInput/Image 的 ref 指向实际 input/img；React Aria parts 保留其元素 ref；Resizable 保留 elementRef/panelRef/groupRef；EventCalendar 使用 CalendarRef.getApi()；Mentions 的 ref 是 MentionsInputHandle，inputRef 才是原生输入元素。不要把所有 wrapper ref 都假设为根 div。

业务传输、认证、权限、持久化、远程查询、支付与通知送达不成为这些依赖的隐式职责。接入的组件保留可用的状态/事件入口，应用提供真实数据与完成/失败策略；验证应针对实际使用模块和宿主环境进行。
