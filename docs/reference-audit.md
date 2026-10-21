# Evenform capability migration

目标是把 Arco / Untitled UI 中适合通用产品的控件、布局与设计辅助纳入可复用 Evenform 系统。以独立交互价值、内容结构与配置能力判断，不按目录数量、展示变体数量或名称相似度判定完成。

本页是 **源码覆盖审计**。`源码具备` 只表示当前共享模块实现了表中所述任务；`组合覆盖` 表示无需平行实现，可以用已列出的原生语义/成熟 primitives 组合；`部分` 表示仍有值得处理的实际能力差异。本表不逐项宣称运行通过；当前命令、浏览器脚本与主题/密度/视口检查方法见 [development.md](development.md)。运行时应记录所测提交、通过项和未覆盖项；文档、类型检查或构建通过不等于键盘/焦点与真实交互已验收。本地历史记录不随仓库发布，也不作为读者判断当前版本的依据。

2026-10-21 逐项对照的官方来源：[Arco 根组件导出](https://raw.githubusercontent.com/arco-design/arco-design/main/components/index.tsx)、[Untitled UI 完整分类目录](https://www.untitledui.com/react/components)。这里不引入它们的运行库，也不承诺 props 一致或所有历史特性兼容。实际 API 和依赖边界见 [components.md](components.md)、[dependencies.md](dependencies.md)。

CSS 是参数单一来源；本次扩展没有新增全局 Token，继续复用已有语义和组件局部回退。此前 info/warning 四个状态语义仍属既有参数。共享源码不承载 Playground 演示数据、假网络、认证或支付客户端。

## Arco 根导出逐项映射

本表覆盖参考 index.tsx 中的每个组件值导出，另列 version；Props/type 导出归到对应组件任务。不能因为 VirtualList 没有根导出便遗漏虚拟化：它通过 List 等组件的 virtualListProps 暴露，见下一节。`ui/` 与 `patterns/` 均指 src/components 下的共享模块。

| Arco 导出 | Evenform 源码入口 / 等价组合 | 源码状态与边界 |
| --- | --- | --- |
| Alert | patterns/status-message、banner | 源码具备；tone 不自动设 live role |
| Anchor | patterns/page-navigation + ui/affix | 组合覆盖；原生锚点，activeId 来自应用 |
| Affix | ui/affix | 源码具备；正常流 sticky/局部 offset |
| AutoComplete | ui/autocomplete | 源码具备；自由文本建议 |
| Avatar | ui/avatar、avatar-group | 源码具备；加载/fallback/组/数量 |
| BackTop | ui/back-to-top | 源码具备；滚动容器、目标焦点、减少动效 |
| Badge | ui/badge、indicator | 源码具备；Evenform Badge 为状态，数量/点用 Indicator |
| Breadcrumb | ui/breadcrumb | 源码具备；原生链接与当前页 |
| Button | ui/button、button-group | 源码具备；普通动作分组 |
| Calendar | ui/calendar、event-calendar；patterns/calendar-agenda | 源码具备；分别处理日期选择、事件网格与日程阅读 |
| Card | ui/card；patterns/dashboard-layout | 源码具备；内容/操作插槽，不逐种复制 CardGrid 变体 |
| Carousel | ui/carousel | 源码具备；Embla，默认无自动播放 |
| Cascader | ui/cascader | 源码具备；按列选择路径、默认提交叶子 |
| Checkbox | ui/checkbox、checkbox-group、form/fieldset | 源码具备；组选项需独立 Field.Item 标签 scope |
| Collapse | ui/accordion、collapsible | 源码具备；单/多展开与基础 disclosure |
| ColorPicker | ui/color-picker | 源码具备；React Aria 颜色/channel/alpha |
| Comment | patterns/comments | 源码具备；内容/回复/编辑动作由应用提供 |
| ConfigProvider | theme-provider、CSS density、DateLocaleProvider、部件文案 props | 组合覆盖主题/密度/日期区域；不是 Arco 全局 locale/default props API；组合英文文案仍需按产品配置/扩展 |
| DatePicker | ui/date-picker、calendar、date-field、period-picker | 源码具备日期/范围/分段/时间与独立月/季/年/周选择；周期值和日期值分开，周期范围选择不在当前 API |
| Descriptions | patterns/description-list | 源码具备；语义 dl 和容器响应式 |
| Divider | ui/separator；排版/留白 | 组合覆盖；由实际信息边界决定分隔 |
| Drawer | ui/sheet | 源码具备；四边浮层、焦点与正文滚动 |
| Dropdown | ui/dropdown-menu、button-group | 源码具备；菜单/子级/选择与按钮组合 |
| Empty | patterns/empty-state | 源码具备；标题、说明、恢复动作 |
| Form | ui/form、fieldset、field；patterns/form-layout、form-section | 源码具备基础表单/校验/结构；重复字段数组的数据身份与跨字段业务规则归应用，不宣称等同 Arco FormInstance/FormList 状态库 |
| Grid | patterns/dashboard-layout；CSS Grid utilities/局部样式 | 组合覆盖响应栅格与 span；不复制另一套 Row/Col 断点数值表 |
| Icon | lucide-react + Button 等图标 slots | 组合覆盖；不复制 Arco 图标集 |
| Input | ui/input、textarea、input-group、search-field、password-input | 源码具备；原生/primitive 输入与前后缀 |
| InputTag | ui/input-tag；tag、combobox 的多选 chips | 源码具备自由建值/分隔符/粘贴/验证/去重/限制/删除；已知选项选择仍用 Combobox |
| InputNumber | ui/number-field | 源码具备；数字解析/格式/步长/上下界 |
| VerificationCode | ui/otp-field | 源码具备；粘贴/填充/输入/校验，发送核验归业务 |
| Layout | patterns/layouts、header-layout、content-layout、detail-layout、split-layout | 源码具备；按任务选择 shell，不强套持久 Sidebar |
| Link | 原生 a + Button render / Typography | 组合覆盖；保留 href/路由语义，不为外观另建导航客户端 |
| List | ui/virtual-list；patterns/layouts 的 DataListLayout + 原生 ul/ol；activity-feed 等 | 源码具备普通列表组合与独立窗口渲染；动态行测量、焦点行保留、完整 DOM 模式；非隐式树/表格虚拟化 |
| Message | ui/toast | 源码具备；短时反馈与计时/关闭/播报 |
| Menu | ui/sidebar、navigation-menu、menubar、context-menu、dropdown-menu | 源码具备；按站点导航/应用命令/上下文动作分别选取 |
| Modal | ui/dialog、alert-dialog | 源码具备；应用明确异步状态/成功关闭 |
| Notification | ui/toast；patterns/notification-list | 源码具备；临时队列与持久通知内容分开，持久化归业务 |
| PageHeader | patterns/layouts 的 PageHeader | 源码具备；h1/description/actions |
| Pagination | ui/pagination；data-table 的 DataTablePagination | 源码具备；普通 UI 1-based，table state 0-based |
| Popconfirm | ui/popover + title/description + 普通 Button | 组合覆盖；可受控 anchored confirmation，异步成功后关闭；不可把模态 AlertDialog 说成完全相同交互 |
| Popover | ui/popover | 源码具备；成熟定位/焦点 primitive |
| Portal | Base UI 各浮层 Portal；React DOM createPortal | 组合覆盖；底层能力，不复制第二个门户层 |
| Progress | ui/progress、meter | 源码具备；任务进度与有界测量分开 |
| Radio | ui/radio-group；patterns/plan-picker | 源码具备；单选语义和套餐信息结构 |
| Rate | ui/rating | 源码具备整分输入、allowClear、只读比例显示/摘要；交互 half-step 是未提供的配置边界 |
| ResizeBox | ui/resize-box、resizable | 源码具备独立二维/单轴表面与相邻分栏；ResizeBox 支持边缘、指针/键盘、约束/回调和 ref |
| Result | patterns/result | 源码具备；结果与恢复动作，不自动跳转 |
| Select | ui/select、combobox | 源码具备；已知单/多选，搜索按任务组合 |
| Skeleton | ui/skeleton、image 的 loadingFallback | 组合覆盖骨架/媒体占位 |
| Slider | ui/slider | 源码具备；单值/范围、多 thumb |
| Space | patterns/layouts 的 Toolbar；gap/stack/grid CSS | 组合覆盖；同一套语义间距，不另建 spacing API |
| Spin | ui/spinner 的 Spinner/LoadingState/BusyRegion | 源码具备；loading 文案、区域 busy 与装饰图标分开 |
| Statistic | patterns/stat、ui/countdown | 源码具备；数值/变化与真实倒计时；业务计算归消费方 |
| Steps | patterns/steps、step-form | 源码具备；进度与受控步骤导航，校验/提交归应用 |
| Switch | ui/switch | 源码具备 |
| Table | ui/table、data-table | 源码具备排序/过滤/选择/列可见/分页、getSubRows 树行/展开、start/end 固定列、列尺寸/调整；不含表格虚拟化或电子表格编辑 |
| Tabs | ui/tabs | 源码具备；受控选择/方向/挂载策略 |
| Tag | ui/tag、badge | 源码具备；移除与状态展示分开 |
| Timeline | patterns/timeline、activity-feed | 源码具备；事件结构，顺序由应用提供 |
| TimePicker | ui/date-field 的 TimeField；两个 TimeField 的时间范围组合 | 组合覆盖分段时间/范围输入；尚无 popup 时间选项列表，不冒充完全相同的 picker UX |
| Tooltip | ui/tooltip | 源码具备；不代替控件名称或必要信息 |
| Transfer | ui/transfer | 源码具备；双列表/搜索/勾选/移动/数量，远程事务归业务 |
| Tree | ui/tree | 源码具备层级/展开/键盘/独立选择；业务级联勾选规则和虚拟化不自动存在 |
| TreeSelect | ui/tree-select | 源码具备；父子独立单/多选，非隐式 cascade |
| Trigger | Base UI Popover/Menu/Tooltip/PreviewCard 等触发/定位 primitives | 组合覆盖；按实际浮层语义选取，避免造无语义通用 trigger |
| Typography | ui/typography、editable-text、expandable-text、copy-button、code-block | 源码具备标题/正文/prose/引用/代码/复制、草稿编辑/异步保存/取消与真实溢出展开；不解析任意 HTML |
| Upload | ui/file-upload 的 FileUpload/FileUploadList | 源码具备文件选择/拖放/约束/进度反馈/重试动作；真实传输/取消/存储归业务 |
| Mentions | ui/mentions | 源码具备；caret、markup、明文、异步候选、ref，由成熟引擎提供 |
| Watermark | ui/watermark | 源码具备；文字/多行/图片与局部参数，不是权限/防篡改 |
| Image | ui/image、image-preview、aspect-ratio | 源码具备；加载/失败/预览组/缩放/键盘，不承诺 Arco 每种 action parity |
| version | package.json/lockfile | 非 UI 功能；记录本仓库依赖版本，不输出假 Arco version |

## 参考 API 审计发现的缺口与配置边界

下列独立家族缺口已提供共享源码和实际 Gallery 入口；这里记录源码覆盖与仍存在的配置差异，不用目录出现、构建或展示变体数量替代交互验收。表格、评分步长和 popup 时间输入继续按任务区分；不承诺全面 props parity，运行证据以最终记录为准。

| 能力 | 参考依据与判断 | 当前状态 |
| --- | --- | --- |
| 虚拟列表 | [Arco List interface](https://raw.githubusercontent.com/arco-design/arco-design/main/components/List/interface.ts) 暴露 virtualListProps；ScrollArea 提供滚动、DataTable 提供表格数据模型，二者不能替代可见窗口渲染 | 源码具备 ui/virtual-list + list-input-aids Gallery；TanStack Virtual v3、动态行测量、稳定 key、焦点行保留和非虚拟化模式 |
| 自由标签输入 | [Arco InputTag interface](https://raw.githubusercontent.com/arco-design/arco-design/main/components/InputTag/interface.ts) 包含新增/删除/清空、分隔符与验证；已知选项 chips 不等于任意输入建值 | 源码具备 ui/input-tag + list-input-aids Gallery；受控标签、可控草稿、分隔/粘贴/验证/限制和键盘删除 |
| 月/年/周/季度选择 | [Arco DatePicker interface](https://raw.githubusercontent.com/arco-design/arco-design/main/components/DatePicker/interface.tsx) 定义独立 period modes；日期字符串格式化不能冒充周期选择 | 源码具备 ui/period-picker + period-picker Gallery；月/季/年/周独立列表、周期边界/可用性、焦点和 locale 文案入口 |
| 独立二维 ResizeBox | [Arco ResizeBox interface](https://raw.githubusercontent.com/arco-design/arco-design/main/components/ResizeBox/interface.ts) 包含 width/height 与边缘伸缩；Split panels 只覆盖其中一类任务 | 源码具备 ui/resize-box + content-aids Gallery；独立二维/单轴、边缘/键盘/指针、约束和生命周期回调 |
| 可编辑/可展开文本 | [Arco Typography interface](https://raw.githubusercontent.com/arco-design/arco-design/main/components/Typography/interface.tsx) 包含 editing/ellipsis expand；Text + CopyButton 不能提供该交互 | 源码具备 ui/editable-text、expandable-text + content-aids Gallery；草稿/校验/异步保存/取消和真实溢出测量 |
| 评分步长增强 | [Arco Rate interface](https://raw.githubusercontent.com/arco-design/arco-design/main/components/Rate/interface.ts) 提供 allowHalf/allowClear；当前 Rating 已有 clear 和只读小数比例显示，交互选值仍为整分 | 增强边界；不宣称交互 half-step 支持 |
| 表格展开/树状、固定/可调列 | [Arco Table interface](https://raw.githubusercontent.com/arco-design/arco-design/main/components/Table/interface.tsx) 包含展开与列相关独立交互；当前 dataTableFeatures 已注册 expanding/pinning/sizing/resizing | 源码具备 DataTableTreeCell、分区 sticky renderer 与 DataTableResizeHandle，Gallery 组合树行/固定/调整；不含表格虚拟化 |
| 弹出时间选项 | [Arco TimePicker interface](https://raw.githubusercontent.com/arco-design/arco-design/main/components/TimePicker/interface.tsx) 的时间列表/步长/禁用时间；分段 TimeField 覆盖输入任务，未覆盖 popup 选择方法 | 同家族的可选输入方法；本次保留成熟的分段输入，不另造平行时间选择流程，不宣称 popup 模式支持 |

## Untitled UI 分类完整映射

下面覆盖目录中的 Base 与 Application UI 所有分类；同类页面/营销分类随后单列。一个分类中多种展示变体不自动对应多个 Evenform 组件。`组合覆盖` 保留可读结构和实际 primitive 交互；不表示已逐个复刻全部参考页面。

### Base components

| 参考分类 | Evenform 入口 / 采用判断 |
| --- | --- |
| Avatars | ui/avatar、avatar-group |
| Badge groups | ui/badge-group |
| Badges | ui/badge、indicator |
| Button groups | ui/button-group、toggle-group，按普通动作/选值分别采用 |
| Buttons | ui/button |
| Checkboxes | ui/checkbox、checkbox-group、fieldset/form |
| Context menus | ui/context-menu |
| Credit cards | 品牌/卡面视觉作为产品内容；支付数据采集和合规客户端由应用负责，不复制卡号存储或支付逻辑 |
| Dropdowns | ui/dropdown-menu、select，按动作/选值区分 |
| Featured icons | lucide-react + 现有表面/颜色/尺寸，可局部组合；不另造图标系统 |
| Illustrations | 产品提供有来源的 Image/slots；不复制未经来源确认的素材库 |
| Inputs | ui/input、input-group、search-field、password-input、number-field |
| Mobile app store buttons | 原生外链 + Button/Image/文字；商店品牌资源由产品提供 |
| Progress indicators | ui/progress、meter；patterns/steps |
| QR codes | ui/qr-code |
| Radio buttons | ui/radio-group |
| Radio groups | ui/radio-group、fieldset/form、patterns/plan-picker |
| Rating badge and stars | ui/rating + Badge；支持清空和只读小数比例；交互整分，半步输入未提供 |
| Select | ui/select、combobox |
| Multi-select | ui/combobox multiple、tree-select multiple、transfer；自由建标签由 ui/input-tag 承担 |
| Sliders | ui/slider |
| Social buttons | Button + 原生链接/业务回调/品牌 slots；不捆绑第三方认证 SDK |
| Tags | ui/tag 展示与移除；ui/input-tag 自由创建、校验与键盘编辑 |
| Text editors | ui/rich-text-editor、editor-toolbar |
| Textarea | ui/textarea、input-group |
| Toggles | ui/switch、toggle、toggle-group，按状态语义选择 |
| Tooltips | ui/tooltip |
| Utility buttons | Button、CopyButton、BackToTop 与可访问 icon action 组合 |
| Verification code inputs | ui/otp-field |
| Video players | ui/video，原生 controls/track |

### Application UI components

| 参考分类 | Evenform 入口 / 采用判断 |
| --- | --- |
| Activity feeds | patterns/activity-feed、comments、timeline |
| Activity gauges | ui/meter；更复杂可视化用 EvenformChart，不能把 Progress 错当测量 |
| Alerts | patterns/status-message、banner；模态确认用 AlertDialog |
| Breadcrumbs | ui/breadcrumb |
| Calendars | ui/event-calendar；日期选择 ui/calendar；阅读 patterns/calendar-agenda |
| Card headers | ui/card 的 Header/Title/Description/Action |
| Carousels | ui/carousel |
| Code snippets | ui/code-block、copy-button、typography 的 InlineCode |
| Color pickers | ui/color-picker |
| Command menus | ui/command |
| Content dividers | ui/separator + 标题/留白/排版；按实际分组采用 |
| Date pickers | ui/date-picker、date-field、calendar；ui/period-picker 提供月/季/年/周选择 |
| Empty states | patterns/empty-state、result |
| File uploaders | ui/file-upload；传输归业务 |
| Filter bars | patterns/filter-bar、SearchField/Select 等控件 |
| Gradient pickers | ui/gradient-picker；角度/色标与序列化已具备，参考 2D 拖拽区域方法未复制 |
| Header navigations | patterns/header-layout、ui/navigation-menu、menubar |
| Image pickers | ui/image-editor + FileUpload/Image；配置/CSS 预览已具备，非完整照片调色/像素导出 |
| Inline CTAs | Banner/StatusMessage/Card + Button/原生链接与文字；普通内容动作无额外状态机，不为展示变体造新组件 |
| Line & bar charts | ui/evenform-chart，已注册 line/bar |
| Loading indicators | Spinner/LoadingState/BusyRegion/Skeleton |
| Messaging | patterns/conversation、comments；送达/持久化归业务 |
| Metrics | patterns/stat/StatGroup；统计数据归业务 |
| Modals | ui/dialog、alert-dialog |
| Notifications | ui/toast、patterns/notification-list |
| Page headers | patterns/layouts 的 PageHeader |
| Paginations | ui/pagination、data-table 的 pagination |
| Pie charts | ui/evenform-chart，已注册 pie |
| Progress steps | patterns/steps、step-form |
| Radar charts | ui/vchart-runtime 已注册 radar + polar band/linear axes；通过 EvenformChart spec 采用，不另造雷达外观系统 |
| Section footers | CardFooter/DialogFooter/SheetFooter、FormLayout footer、DetailLayout footer 或原生 footer + Toolbar；按内容边界组合 |
| Section headers | PageSection、CardHeader、FormSection，按 landmark/标题关系组合 |
| Sidebar navigations | ui/sidebar、patterns/layouts、SettingsLayout |
| Drawers | ui/sheet |
| Tables | ui/table、data-table，包含树行展开、逻辑固定列及可调列宽；配置边界见上表 |
| Tabs | ui/tabs |
| Tree views | ui/tree、tree-select；级联路径用 Cascader |

### 页面、资源和营销分类的采用边界

这些分类不是被目录遗漏；按是否有独立通用交互逐组处理。内容/品牌/路由不同的完整页面不自动建立一套平行页面组件。已有组合只能覆盖表中实际结构，不承诺所有参考视觉变体。

| 全部参考分类 | Evenform 复用与明确边界 |
| --- | --- |
| Application examples：Dashboards 01/02 | DashboardLayout/Grid/Item + Stat/DataTable/EvenformChart；数据与面板任务由业务配置 |
| Application examples：Settings pages 01/02 | SettingsLayout/SettingsGroup、FormLayout/FormSection、Field/控件，提交归业务 |
| Application examples：Informational pages 01/02 | ContentLayout/PageNavigation/Prose、DescriptionList/DetailLayout；原生目录与正文 |
| Shared pages：Log in、Sign up、Verification、Forgot password | AuthLayout + Form/PasswordInput/OTPField/StatusMessage/Result；认证、邮件/短信与恢复协议归应用 |
| Shared pages：404 sections | Result/not-found + 标题/动作，路由归应用 |
| Shared pages：Email templates | 不把 Web App CSS 当邮件客户端兼容库；模板内容可复用设计语义，邮件 HTML/投递/兼容验证属于独立宿主任务 |
| Resources：Figma files、Icons、File icons、Flag icons、Avatars、Logos | 字体/图标沿现有系统；Image/Avatar/slots 接产品有来源的资源，不批量复制品牌或素材授权内容 |
| Marketing components：Banners | Banner + 显式动作/关闭 |
| Marketing components：Blog、Careers、Contact sections | ContentLayout/Prose、Card/表单/原生列表与链接；招聘/联系/内容查询是业务数据 |
| Marketing components：Content & rich text、CTA、FAQ、Features sections | Prose/RichTextEditor、Button/Banner、Accordion、PageSection/Card/Grid 按任务组合；不引入重复 shell/Token |
| Marketing components：Footers、Header navigations、Hero header、Header sections | HeaderShell 的 header/footer、NavigationMenu、PageHeader/Title、原生 footer/section；品牌排版以产品局部配置实现 |
| Marketing components：Metrics、Newsletter CTA、Pricing sections | StatGroup、Form/Input/Button、PlanPicker；订阅与计费接口归业务 |
| Marketing components：Social proof、Team、Testimonial sections | AvatarGroup、Image、Blockquote、Prose、Card、Carousel 等组合；真实人物、评价和品牌资源归产品 |
| Marketing examples：About、Blog posts、Blogs、Contact、FAQ、Landing、Legal、Pricing、Team、404 pages | 以上内容/表单/导航/套餐/结果组合覆盖结构基础；不复制每种页面配图、文案和业务路由为设计系统组件 |

### 六项曾经的独立缺口与 Radar

| 能力 | 当前共享源码 | 源码审计结论 | 可复现检查入口 |
| --- | --- | --- | --- |
| Gradient picker | ui/gradient-picker + styles/design-tools.css | 已有受控模型、色标增删/反转、位置/角度和 CSS 输出；参考 [2D area](https://www.untitledui.com/react/components/gradient-pickers) 的指针编辑方法未复制 | 按 [开发指南](development.md#browser-verification) 检查对应场景 |
| Image picker/editor | ui/image-editor + styles/design-tools.css | 已有选图回调、fill/fit/crop/tile、滤镜与配置；参考 [照片调整](https://www.untitledui.com/react/components/image-pickers) 的 temperature/tint/highlights/shadows 不在当前模型；无像素导出 | 按 [开发指南](development.md#browser-verification) 检查对应场景 |
| Event calendar | ui/event-calendar + styles/design-tools.css | FullCalendar v7 月/周/日与事件回调；不拿 Calendar 日期选择器冒充事件日历 | 按 [开发指南](development.md#browser-verification) 检查对应场景 |
| Mentions | ui/mentions + styles/specialized-aids.css | 成熟 caret/markup/异步候选模型；不是 InputGroup 的外观假实现 | 按 [开发指南](development.md#browser-verification) 检查对应场景 |
| Watermark | ui/watermark + styles/specialized-aids.css | 文字/多行/图片 SVG 重复与局部 CSS 参数；不宣称防篡改 | 按 [开发指南](development.md#browser-verification) 检查对应场景 |
| Countdown | ui/countdown + styles/specialized-aids.css | 真实时钟、暂停/恢复、完成周期、render prop 与 timer 语义；不是静态 Statistic | 按 [开发指南](development.md#browser-verification) 检查对应场景 |
| Radar | ui/vchart-runtime、EvenformChart；playground 图表示例 | radar 与所需 polar axes 已注册；主题来自 CSS，数据留在页面 | 按 [开发指南](development.md#browser-verification) 检查对应场景 |

## 完成门槛与证据归属

1. 有价值的剩余项有实际实现，或有源码支持、可操作的等价组合；不以“本轮时间”作为排除理由。源码完成不覆盖仍明确存在的部分能力。
2. 数据、props/ref/事件与无障碍契约保留；示例状态留在 Playground，Starter 不引入演示业务。
3. 主题、密度、CSS layers、局部覆盖与 head 偏好初始化一致；共享参数只有 CSS 一份。
4. 构建/lint/文档示例类型检查与代表性交互、键盘/焦点、Light/Dark、两种密度、窄屏以及共享参数传播分别留证。任何一项不能由其他项替代。
5. 按 [开发指南](development.md) 运行构建与相关浏览器检查，记录所测提交与实际覆盖范围。上表的交互能力需在对应示例中验证，不能从源码审计推断通过；未发布的本地历史结果不代表当前版本已通过验收。
