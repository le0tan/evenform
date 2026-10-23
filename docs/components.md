# Evenform components and patterns

本页按任务查找当前源码中的通用控件、内容工具与布局组合。它是累计 API 目录，不按迁移批次或文件数量计数。组件路径为 `@/components/ui/<模块>`，Pattern 路径为 `@/components/patterns/<模块>`；没有总 barrel，直接从对应文件导入。完整 props 与导出类型以这些模块为准。

新业务从 `src/starter/App.tsx` 开始。先按信息结构选择适用 Pattern，再组合控件；只有需要持久 Sidebar 时才使用 AppShell。设计与覆盖契约见 [DESIGN.md](../DESIGN.md)，迁移范围与取舍见 [reference-audit.md](reference-audit.md)，依赖职责和接入成本见 [dependencies.md](dependencies.md)。本页描述源码能力；当前构建与浏览器检查方法见 [development.md](development.md)。运行时应记录所测提交、场景与结果，不能从组件存在推断已通过运行验收。

## 导入、状态和样式契约

- Base UI 包装保留对应 primitive 的受控/非受控状态、事件、`render` 组合与 ref API；插槽按同一 Root 组合，避免嵌套 button。原生包装保留相应 HTML props；并非每个 composition 都承诺任意元素替换。
- React Aria 包装使用其 `isDisabled`、`isReadOnly`、`onChange`、collection 与 render props，不能机械替换为 Base UI 的 `disabled` / `onValueChange`。Evenform 的 TreeSelect、Cascader、Transfer 等组合采用下面列出的受控 API。
- 日期使用 `@internationalized/date` 结构化值，颜色使用 React Aria 的 `Color` / `parseColor`；展示字符串与 JavaScript Date 不自动等价。区域格式、业务时区、序列化由应用明确选择。
- 标签、描述、错误关联与适用状态需要真实配置。tone、颜色与静态图标不自动生成 live region。原生链接保留 href；路由、权限、网络行为和应用级快捷键由应用管理。
- CSS 是参数单一来源。共享样式、字体、Light/Dark 映射、`@theme inline`、base rules 与 HTML head 的 `evenform-init.js` 一起接入。仅复制 TSX 会遗漏样式与首帧偏好恢复；完整清单见 [样式与复制边界](dependencies.md#样式与复制边界)。产品覆盖文件最后导入，业务入口不导入 Playground CSS。

下面列主要组合点和责任边界，不重复上游每个字段。

## 输入、表单和选择

| 任务 / 模块 | 主要导出与配置 | 交互与边界 |
| --- | --- | --- |
| 操作 `button`、`button-group` | Button/buttonVariants；ButtonGroup/ButtonGroupText | Button 使用 variant、size、Base UI render；ButtonGroup 是普通操作分组，箭头选值用 ToggleGroup |
| 文本 `input`、`textarea`、`label` | Input、Textarea、Label | 保留原生 props；应用提供名称、值、验证和提交 |
| 输入组合 `input-group` | InputGroup、InputGroupAddon/align、InputGroupInput、InputGroupTextarea | 前后缀与操作容器，不接管控件状态 |
| 搜索 `search-field` | SearchField/value/onValueChange、clearLabel、groupClassName | 清空走同一值回调并恢复焦点；ref 指向 input；检索、节流与请求状态归应用 |
| 密码 `password-input` | PasswordInput；visible/defaultVisible/onVisibilityChange | 显示/隐藏保留输入焦点；仍需 label、name 和 autoComplete；不提供密码规则或认证 |
| 开关/多选 `checkbox`、`switch`、`checkbox-group` | Checkbox、Switch、CheckboxGroup | Base UI checked/indeterminate、分组选值和禁用；分组提供 legend 或可访问名称 |
| 单选 `radio-group` | 泛型 RadioGroup、RadioGroupItem | 保留 value、name、disabled 与键盘单选 |
| 数字 `number-field` | NumberField/Group/Input/Increment/Decrement/ScrubArea | Base UI 数字解析、格式、步长、上下界和键盘操作 |
| 连续/范围值 `slider` | Slider；SliderRoot/Control/Track/Range/Thumb/Label/Value | number 或 readonly number[] 决定 thumb 数；getAriaLabel 为每个 thumb 命名；自定义结构用 parts |
| 按下状态 `toggle`、`toggle-group` | Toggle；泛型 ToggleGroup、ToggleGroupItem | pressed 与分组单/多选、roving focus；与表单 RadioGroup 分别使用 |
| 已知选项 `select` / `option-select` | Select/Trigger/Value/Content/Item、Group/Label/Separator/滚动部件；OptionSelect/options/triggerProps/contentProps | Base UI 泛型选择与浮层定位；默认从触发器下方按起始边展开，弹层有独立内边距；可显式传 alignItemWithTrigger=true 恢复选项与触发器对齐；搜索型任务用 Combobox |
| 搜索选择 `combobox` | Combobox/InputGroup/Input/Trigger/Content/List/Item/Empty；Value/Chips/Chip/ChipRemove/Clear；Collection/Group/Label/GroupLabel；useComboboxFilter | 泛型、multiple、过滤、表单与 render props；chips 从 Value 当前值渲染；异步源和错误归应用 |
| 自由标签 `input-tag` | InputTag/value/onValueChange；inputValue/defaultInputValue/onInputValueChange；delimiters/normalize/validate/maxTags/allowDuplicates/onReject；InputTagProps/InputTagRejection | 任意文本建值，Enter/分隔符/粘贴提交，独立移除按钮与键盘标签导航；value 必须受控，draft 可控；name 每个已提交值输出 hidden input；原生 disabled/readOnly/ref 指向输入；提供外部 label |
| 自由建议 `autocomplete` | Autocomplete/InputGroup/Input/Trigger/Clear/Content/List/Item/Empty；Collection/Group/GroupLabel/Value/Status；useAutocompleteFilter | 可输入不在候选中的自由文本，候选不是必须选择的身份值 |
| 验证码 `otp-field` | OTPField/length；OTPFieldRoot/Input/Separator | Base UI 输入、粘贴、归一化、自动填充与校验；发送/核验归业务 |
| 评分 `rating` | Rating/label/value/defaultValue/onValueChange/max/readOnly/required/allowClear/clearLabel | 原生 radios，0 为未评分；allowClear 提供清空按钮，只读值支持按比例星形和文字摘要；交互选值仍为整分 |
| 展示字段 `field` | Field/Label/Description/Error/Group/Set/Legend/Content/Title/Separator（导出前缀均为 Field） | 原生结构与排版，不是 Base UI Field 状态 Root；调用方关联控件与错误 |
| primitive 表单 `form`、`fieldset` | Form；FormField/Label/Description/Error/Control/Validity/Item；Fieldset、FieldsetLegend | Base UI Form/Field/Fieldset，保留原生约束、自定义验证、错误映射和 ref；与 patterns/layouts 同名 FormField 不同 |
| Mention 输入 `mentions` | Mentions（别名 MentionsInput）、Mention；MentionsInputHandle 与 change/data/search 类型 | react-mentions-ts 管理 caret、markup/明文映射、候选与异步取消；保留 trigger/data/renderSuggestion/classNames/ref；数据源与身份权限归应用 |

`patterns/layouts` 的 `FormField { id, label, description?, error?, children }` 是轻量标签排版：生成 `${id}-description` 和 `${id}-error`，应用把 `aria-describedby` / `aria-invalid` 传给控件；它不克隆 children。需要 primitive 自动关联时选 `ui/form`，同时使用两个同名导出时在 import 处起别名。`ui/field` 的 FieldSet 与 `ui/fieldset` 的 Fieldset 也有不同语义契约，按任务选择。

在 Base UI FormField 上下文内组合 CheckboxGroup 时，组标题留在 FormField Root 层，用 `nativeLabel={false}` 的 FormFieldLabel 给 CheckboxGroup 命名；每个选项放进独立 FormFieldItem，再用各自 FormFieldLabel 包住 Checkbox 和文字。FormFieldItem 隔离选项的 label/description scope；仅在共享 Field 上下文里使用普通原生 label，可能让组选项都被组标题命名。

## 日期、层级、文件和颜色

| 模块 | 主要导出与配置 | 责任边界 |
| --- | --- | --- |
| `calendar` | 泛型 Calendar、RangeCalendar、CalendarHeader、CalendarGrid；CalendarRoot/RangeCalendarRoot/CalendarGridRoot 与 cell/grid parts | 日期选择网格、键盘、范围、禁用和不可用日期；children 可换默认结构，Root/parts 支持多月/render props；不展示业务事件 |
| `date-field` | 泛型 DateField、TimeField；DateInput/DateSegment/DateSegments；Root/Label/Text/Error；DateLocaleProvider | label/description/errorMessage 简便组合或自定义 children；分段编辑与验证；TimeField 使用 TimeValue |
| `date-picker` | 泛型 DatePicker、DateRangePicker；DatePickerRoot、DateRangePickerRoot | 分段输入与弹出日历的焦点组合；支持 label/description/errorMessage 或自定义 children；应用选择日期类型与时区 |
| `period-picker` | PeriodPicker/mode/label/value/defaultValue/onChange/placeholderValue/firstDayOfWeek；PeriodPickerProps/PeriodValue/PeriodRange/PeriodPickerMode/getPeriodRange | month/quarter/year/week 独立周期列表；Gregorian 日期边界，week 保存真实 CalendarDate 起点；minValue/maxValue 要求整个周期在界内，isPeriodUnavailable 可限制；isDisabled/isReadOnly/isInvalid/isClearable、description/errorMessage/labels/formatPeriod 可配；name 输出日期区间；不提供周期范围选择 |
| `event-calendar` | EventCalendar、EventCalendarProps、CalendarOptions、CalendarRef | FullCalendar **v7** 月/周/日事件视图；接收 CalendarOptions，追加 plugins；ref.current.getApi()；事件/timeZone/编辑选择回调/持久化归应用；事件键盘激活需要 eventClick |
| `tree` | 泛型 Tree、TreeItem；Collection、TreeItemContent、TreeRow、TreeSelectionCheckbox | React Aria 层级、collection、展开、选择与键盘语义；TreeRow 放在 TreeItemContent 内使用 chevron/selection slots；保留相应 ref/render props |
| `tree-select` | TreeSelect/label/items/selectedKeys/onSelectionChange/selectionMode；TreeSelectNode | 受控单/多选 keys，展开可控，含 description/error/clear/empty/triggerProps；父子独立选中，无隐式级联或半选；name 输出 hidden inputs |
| `cascader` | Cascader/label/options/value/onValueChange/changeOnSelect；CascaderOption | value 是路径 string[]；每级为命名 ListBox，箭头本级移动、Tab 跨列；默认提交叶子，changeOnSelect 可提交父级；不是 TreeSelect 的别名 |
| `transfer` | 泛型 Transfer/items/targetKeys/onTargetKeysChange/selectedKeys/onSelectedKeysChange；TransferItem | 双列表分区、搜索、可见项全选、移动与数量反馈；targetKeys 必须受控，临时勾选可控；禁用项不移动，renderItem 定制；不发送批量请求 |
| `file-upload` | FileUpload、泛型 FileUploadList、validateFiles、formatFileSize；FileRejection/FileUploadItem 等类型 | input 选择与拖放；accept/maxSize/maxFiles/existingCount 约束和拒绝回调；List 接收 status/progress/error 与移除/重试/动作；服务端校验、传输、取消和存储归应用 |
| `color-picker` | ColorPicker/label/showAlpha/isDisabled/hueLabel/alphaLabel/valueLabel；ColorArea/Slider/Thumb/Field/Swatch、ColorPickerRoot/ColorSliderTrack/ColorLabel；parseColor/getColorChannels/Color | React Aria 颜色模型、二维区域、channel/alpha、文本输入；默认组合可换 children；颜色是用户数据，不写入全局主题 Tokens |
| `gradient-picker` | GradientPicker/value/onValueChange/label/disabled；GradientValue/GradientStop、gradientToCss | 受控 linear/radial、角度、色标增删/反转、颜色/位置；调用方提供至少两个稳定 id 的 stops；CSS 序列化留在文档数据 |
| `image-editor` | ImageEditor/value/onValueChange/src/alt/onFileSelect/onFilesRejected/maxFileSize；ImageEditorValue、imageEditorFilter | fill/fit/crop/tile、旋转、亮度/对比/饱和/模糊、归一化裁切/位置；输出配置与 CSS 预览；源文件、object URL 生命周期、像素导出和存储归应用 |

`Calendar` / `DatePicker` 选择结构化日期；`EventCalendar` 展示、选择和编辑月/周/日网格中的事件；`patterns/calendar-agenda` 用正文列表阅读日期分组的事件。三者可以共用业务数据，值模型与职责不同。FullCalendar 事件结束边界、时区与拖动结果按其 CalendarOptions/事件模型处理。

## 导航、浮层和命令

| 模块 | 主要导出与配置 | 责任边界 |
| --- | --- | --- |
| `tabs` | Tabs/List/Trigger/Content | `TabsList size="control"` 用于混合控件工具栏，水平外框跟随 control height（触摸目标可撑高）；默认导航尺寸不变。Base UI value、orientation 与按需 keepMounted；四个包装保留字符串或原始 primitive state 回调形式的 className，并与 Evenform 默认类合并；挂载保留不等于持久化 |
| `sidebar` | SidebarProvider/useSidebar；Sidebar/Header/Content/Footer/Group/Menu 等部件、Trigger/Rail/Inset；mobileFinalFocus/onMobileOpenChangeComplete | 桌面导航与移动 Sheet、side/variant/collapsible；mobileFinalFocus 与 onMobileOpenChangeComplete 透传移动浮层的焦点和关闭生命周期，路由与示例定位仍由应用负责；SidebarInset 是 main，已有 shell 中避免重复 main；Provider 不注册全局快捷键，应用自行处理并避开编辑焦点 |
| `breadcrumb` | Breadcrumb/List/Item/Link/Page/Separator/Ellipsis；BreadcrumbPath/items | 原生路径链接，最后项 aria-current=page；路由由应用提供 |
| `pagination` | Pagination/Content/Item/Link/Ellipsis；PaginationControls/page/pageCount/onPageChange/disabled | Controls 从 1 开始；URL 分页用链接 parts；数据与页数归应用 |
| `navigation-menu` | NavigationMenu/Item/List/Trigger/Content/Link/Icon；Overlay/Popup/Viewport/Portal/Positioner | 站内导航链接；Overlay 组合 Portal/Positioner/Popup，默认 Viewport；操作命令用菜单 |
| `dropdown-menu` | DropdownMenu/Trigger/Content/Item/Group/GroupLabel（兼容 Label）/Separator、CheckboxItem/RadioGroup/RadioItem、Sub/SubTrigger/SubContent、Shortcut | Base UI 菜单/子菜单；Content 的 side/align/offset 可配；Shortcut 只显示文字 |
| `context-menu` | ContextMenu/Trigger/Content/LinkItem；Item/Group/Label/Separator/Checkbox/Radio/Sub/Shortcut parts | Base UI 右键入口，Evenform 在 Trigger 桥接 ContextMenu 键与 Shift+F10；复用菜单 parts；触发区域需可聚焦并有可访问名称 |
| `menubar` | Menubar/Trigger 与 Menu/Content/Item/Checkbox/Radio/Sub 等 parts | Base UI 横向命令与焦点导航；不是页面链接导航 |
| `dialog`、`sheet` | Dialog/Trigger/Content/Header/Title/Description/Footer/Close/Portal/Overlay；Sheet/Trigger/Content/Header/Title/Description/Footer/Close/Body | Base UI 焦点、Escape、modal/恢复；SheetContent 支持四边，Body 提供正文滚动/inset；自定义 header actions 用 `showCloseButton={false}` + 同排 SheetClose，见 [组合示例](compositions.md)；应用提供标题和真实提交状态 |
| `alert-dialog` | AlertDialog/Trigger/Content/Header/Title/Description/Footer/Cancel/Action/Close | Action 为同步 Close 组合；异步确认用普通 Button，在请求成功后受控关闭 |
| `popover` | Popover/Trigger/Content/Title/Description/Close | 定位浮层与焦点；保存/业务内容由应用控制 |
| `tooltip` | TooltipProvider、Tooltip/Trigger/Content | delay/定位可配；不是唯一控件名称或必要信息的唯一入口 |
| `preview-card` | PreviewCard/Trigger/Content/Viewport；createPreviewCardHandle | Base UI 链接预览与 handle；保留真正链接和加载边界 |
| `command` | Command/Dialog/Input/List/Empty/Group/Item/Separator/Loading/Shortcut；useCommandState | cmdk 搜索、过滤、键盘命令；CommandDialog 使用 Evenform Dialog，title/description/commandProps 可配；快捷键和动作归应用；CommandDialog.finalFocus 透传底层 DialogContent 的关闭焦点契约，用于应用导航后移交焦点 |
| `editor-toolbar` | EditorToolbar/Group/Button/Link/Input/Separator | Base UI roving focus；render 可组合 Toggle；patterns/layouts 的 Toolbar 只是普通排版 |
| `accordion`、`collapsible` | Accordion/Item/Trigger/Content；Collapsible/Trigger/Content | Base UI 展开/收起、受控状态与键盘契约；Accordion 正文默认继承文字色，辅助内容在 Content 上显式 `text-muted-foreground` |

## 数据、内容和媒体

| 模块 | 主要导出与配置 | 责任边界 |
| --- | --- | --- |
| `table` | Table/Header/Body/Footer/Row/Head/Cell/Caption | 原生表格、横向滚动；二维对照结构，本身没有数据引擎 |
| `data-table` | useDataTable、dataTableFeatures、DataTable/ColumnHeader/TreeCell/ResizeHandle/Checkbox/Pagination；DataTableColumnDef/Instance/Options 等类型 | **TanStack Table v9** registry 与语义 renderer；排序、全局/列过滤、列可见、选择、分页、展开、列固定/尺寸/调整；getSubRows 驱动树行，resizableColumns 渲染调整手柄；保留 manual* 与 state callbacks；无网络、表格虚拟化或电子表格编辑 |
| `virtual-list` | 泛型 VirtualList/items/getItemKey/renderItem/label/estimateSize；overscan/virtualized/emptyContent/itemClassName；VirtualListProps/VirtualListHandle/scrollElement/scrollToIndex/measure | TanStack Virtual **v3** 纵向窗口渲染、动态行测量与稳定 key；含焦点的行保持挂载，删除该数据行后的焦点由应用处理；原生 ul/li、aria-setsize/posinset，非 listbox/树/表格；virtualized=false 可保留完整 DOM |
| `rich-text-editor` | RichTextEditor/label/content/defaultContent/onUpdate/readOnly/disabled/extensions/renderToolbar/footer/onEditorReady | Tiptap JSON 文档模型；默认粗/斜体、标题、列表、链接、撤销/重做；内容同步避免回调循环，immediatelyRender=false；应用拥有保存、可信扩展和外部渲染策略 |
| `typography` | Title/as/size；Text/as/size/tone/weight；Prose/as/measure；Blockquote/InlineCode | 标题语义与大小独立；原生/ref props 随元素；Prose 管理直属内容（包括 Text/Blockquote）的段间距，直属 span 按内容块排版；不解析或净化 HTML/Markdown |
| `editable-text` | EditableText/label/value/defaultValue/onValueChange/onSave/onCancel/validate；multiline/disabled/readOnly/name/renderValue/inputProps/textareaProps；EditableTextProps | 编辑草稿与提交值分离；Enter 或多行 Ctrl/Command+Enter 保存，Escape 取消；onSave 支持 Promise，失败保留草稿并显示错误；保存成功再提交，焦点返回编辑按钮；文案/instructions 可配 |
| `expandable-text` | ExpandableText/children/lines/expanded/defaultExpanded/onExpandedChange/expandLabel/collapseLabel/textClassName；ExpandableTextProps | 纯文本多行截断与展开；ResizeObserver/字体加载后测量真实溢出，只在需要时提供带 aria-expanded 的按钮；不解析 HTML、不替代 RichTextEditor |
| `code-block`、`copy-button` | CodeBlock/code/language/filename/caption/copyable/codeProps；CopyButton/value/onCopy/onCopyError | 代码按文本渲染与滚动，无内置语法高亮；复制支持异步字符串和成功/失败反馈，仍依赖浏览器安全上下文/许可 |
| `card` | Card/Header/Title/Description/Action/Content/Footer；Card/size | 独立内容/操作边界；不自动给每节加 Card；尺寸与 inset 契约见 DESIGN |
| `badge`、`tag` | Badge/badgeVariants；Tag/onRemove/removeLabel/disabled | 状态配文字；Tag 可移除；外观不推导状态机 |
| `badge-group`、`indicator` | BadgeGroup/badge/action/children；Indicator/label/count/max/showZero/indicator | 组合说明/动作与未读点/数量；Indicator 名称必填；未读持久化归应用 |
| `avatar`、`avatar-group` | Avatar/Image/Fallback/Badge/Group/GroupCount；avatar-group 的 AvatarGroup 增加 overflow/overflowLabel | 复用尺寸和加载 fallback；聚合数量由应用计算 |
| `aspect-ratio`、`image` | AspectRatio/ratio；Image/alt/fallback/loadingFallback/errorLabel/containerProps | 比例保留空间；原生图片 props/ref 属于 img，布局用 containerProps；src/srcSet 改变重置加载状态 |
| `image-preview` | ImagePreview/images/trigger/index/defaultIndex/onIndexChange/contentProps | Dialog 关闭/焦点、图片切换与 1–3 倍缩放/滚动平移；zoom 时不抢方向键；无文件下载或像素编辑 |
| `carousel` | Carousel/Content/Item/Previous/Next/Position；CarouselApi/CarouselOptions | Embla 拖动/触摸/snap，支持横纵、RTL、opts/plugins/setApi；仅 viewport 焦点接收方向键；Position 数 snap，默认无自动播放 |
| `qr-code` | QRCode/value/label 与 QRCodeSVG props | qrcode.react 真正 SVG 编码，默认 marginSize=4；保留留白/对比，应用提供名称和替代链接 |
| `video` | Video | 原生 video；默认 controls/playsInline/preload=metadata；source/track/字幕和替代内容归应用 |
| `watermark` | Watermark/text（string 或 string[]）或 image | SVG 重复视觉标记与局部 CSS 参数；不拦操作；不是权限、防篡改或像素导出系统 |
| `evenform-chart`、`vchart-runtime` | EvenformChart/spec/label/description/palette/className | VChart 生命周期、CSS 主题桥接、loading/error；数据/图例/筛选/摘要/表格替代归应用；图表族与限制见 [charts.md](charts.md) |

DataTable 的 columns/data 引用应稳定；跨服务端分页选择时传 getRowId。受控状态按 v9 使用 `table.state`，renderer 使用 `<table.FlexRender … />`；不要套用旧版 useReactTable/getState/flexRender 示例。DataTablePagination 使用共享 Select 选择每页数量，适配从 0 开始的 pagination state，与从 1 开始的 PaginationControls 分开。manualFiltering/manualSorting/manualPagination 只声明数据处理方式，不替应用查询服务端或处理跨页事务。树行通过 getSubRows 和 DataTableTreeCell 组合；展开状态仍由引擎/调用方持有，不自动生成业务详情面板。固定列使用 v9 的 start/end pinning 状态，renderer 分区处理 grouped headers 与 sticky cells；产品提供固定/取消操作。resizableColumns 启用真实列宽与 DataTableResizeHandle，方向键以 10px（Shift 为 50px）调整，Enter/双击重置；columnResizeMode/direction、minSize/maxSize 保留上游配置。

## 反馈和阅读辅助

| 模块 | 主要导出与配置 | 责任边界 |
| --- | --- | --- |
| `toast` | ToastProvider/Toaster（closeLabel 可配）、useToastManager/createToastManager；Toast/Portal/Viewport/Content/Title/Description/Action/Close；ToastObject 和 manager options | 一个 Provider 内一个 Toaster；Base UI 队列、计时、指针/焦点暂停、关闭/播报；默认 renderer 关闭超 limit 的 overflow，dismissOverflow=false 才保留排队行为；持久通知用 NotificationList |
| `progress`、`meter` | Progress/Track/Indicator/Label/Value；Meter/Root/Label/Value/Track/Indicator | Progress 为任务进度，value=null 可表达未知；Meter 为有界测量值；提供真实值与名称 |
| `spinner`、`skeleton` | Spinner、LoadingState、BusyRegion；Skeleton | Spinner 默认装饰，label 使其成为命名图像；LoadingState 按需 role=status；BusyRegion 设 aria-busy 保留 children，不自动禁用所有控件 |
| `countdown` | Countdown/target/running/onComplete/children/invalidLabel；CountdownValue | Date/毫秒时间戳/可解析字符串；暂停冻结剩余时间，恢复延后 deadline；新 target 开新完成周期；timer 默认 aria-live=off，render prop 可定制；SSR 时间差归消费方 |
| `scroll-area` | ScrollArea/Root/Viewport/Content、ScrollBar/Thumb/Corner | orientation=vertical/horizontal/both、viewportProps；调用方约束可滚动空间；保留原生滚动，不是虚拟列表 |
| `resizable` | ResizablePanelGroup/Panel/Handle；useDefaultLayout、group/panel ref hooks | react-resizable-panels **v4** Group/Panel/Separator API；键盘/指针、尺寸约束、elementRef/panelRef/groupRef；Handle 可显示 grip，resizeTargetMinimumSize 配有效拖动区域 |
| `resize-box` | ResizeBox/label/size/defaultSize/onSizeChange/onResizeStart/onResizeEnd；axes/edges/minWidth/maxWidth/minHeight/maxHeight/keyboardStep/disabled；ResizeBoxHandle/ResizeBoxSize/ResizeBoxEdge/ResizeBoxDetails/ResizeBoxProps | 独立二维表面，指针或 separator 键盘调整；方向键/Shift、Home/有限 End、拖动 Escape 恢复；ref 提供 element/getSize/resizeTo；尺寸数据属调用方，CSS 约束和局部覆盖保留；不同于相邻分栏 |
| `affix` | Affix/edge=top 或 bottom | CSS sticky 保留正常流；最近滚动容器与局部 --ds-affix-offset 决定停靠 |
| `back-to-top` | BackToTop/target/scrollContainer/threshold/offset/behavior/hideBelowThreshold | 元素或 ref 作为 target；滚到真实标题并转移焦点，嵌套滚动和减少动效支持 |
| `separator`、`kbd` | Separator、Kbd | 分隔与快捷键文本；按实际内容边界选择分隔线；Kbd 不注册快捷键 |

## 布局和产品 Patterns

这些组合通过 children/slots 接收现有控件，不携带样例项目、网络客户端或业务状态。容器断点与局部几何在 CSS，局部参数可覆盖；不维护 TS 断点或 Token 数值副本。

| 模块 | 主要导出 / 组合点 | 结构与边界 |
| --- | --- | --- |
| `layouts` | AppShell/sidebar/header/aside；PageHeader、PageSection | AppShell 含 SidebarProvider、Skip link 和 main；PageHeader 生成 h1，命名 Section 生成 h2；避免嵌套 shell/main |
| `header-layout` | HeaderShell/variant/header/secondaryNavigation/footer/mainId/contentAs/contentClassName/headerClassName/footerClassName | 无持久 Sidebar 的壳；默认 main+Skip link，嵌入已有 main 时 contentAs=div；次级导航名称可配 |
| `layouts` | SettingsLayout/SettingsGroup；Toolbar；FormField；DataListLayout | 设置导航、字段节奏与普通工具栏；DataListLayout 接收 toolbar/isEmpty/empty/footer，只排版和选择内容；请求状态归应用 |
| `content-layout`、`page-navigation` | ContentLayout/navigation/aside；PageNavigation/items/activeId | 正文 article、可读宽度、支持栏；原生锚点，activeId 来自路由/observer；不生成第二个 main |
| `detail-layout`、`description-list` | DetailLayout/header/aside/footer；DescriptionList/DescriptionItem | 单条记录详情；dl/dt/dd、columns=1/2、divided，按容器宽度换行；二维对照用 Table |
| `split-layout` | SplitLayout/list/activePane/listLabel/detailLabel | 列表/详情双栏，窄容器仅显示 activePane；两栏保持挂载；选择、返回、路由和切换焦点归应用 |
| `dashboard-layout` | DashboardLayout/Grid/Item | 局部 --ds-dashboard-columns / --ds-dashboard-span 配宽布局，窄容器按 DOM 顺序堆叠；不接管数据/拖动 |
| `form-layout`、`form-section` | FormLayout/header/footer；FormLayoutSection/title/description；FormSection/title/description/columns | FormLayout 是 form，Section 为 fieldset/legend；宽容器侧标签/两列；避免嵌套 form，保留原生 disabled；提交/验证归应用 |
| `auth-layout` | AuthLayout/brand/aside/footer | 聚焦/分栏账号页面，不生成 main；应用提供 landmark、认证、会话和错误 |
| `filter-bar`、`selection-bar` | FilterBar/search/filters/actions；FilterChip/removeLabel/onRemove；SelectionBar/selectedCount/onClear | 条件展示与批量操作，selectedCount<=0 不渲染；应用明确当前页/跨页/全部筛选结果范围 |
| `empty-state`、`result` | EmptyState/title/description/icon/actions/headingLevel；Result/status | 空内容与 success/error/forbidden/not-found 结果；产品提供准确文案/恢复动作，不自动重定向/重试 |
| `status-message`、`banner` | StatusMessage/tone/title/icon/actions；Banner/tone/icon/actions/onDismiss | 局部反馈/页面公告，默认无 live role；按需显式 role=status/alert；Banner 移除由应用控制 |
| `stat` | StatGroup；Stat/label/value/change/help/actions | dl 展示数值；CSS `--ds-stat-group-columns` 配置分列、`--ds-stat-value-size` 配置数值字号；change.tone=beneficial/adverse/neutral；应用提供方向/比较周期和计算，不从正负号推断利好 |
| `timeline`、`steps` | Timeline/TimelineItem；Steps/Step | 有序事件/步骤进度；time 可用原生 time；Step 状态显式给出；不自动排序/推进流程 |
| `step-form` | StepForm/StepFormStep；steps/currentStep/onStepChange/onComplete、busy/disabled、children render prop | 从 0 开始；发出 next/previous 请求，应用验证并修改状态；默认步骤变化后聚焦标题；不自动提交 |
| `calendar-agenda` | CalendarAgenda、AgendaDay/date/actions/empty、AgendaEvent/title/time/meta/actions | 按日事件列表，分组/顺序/时区归应用；empty 指定时替代当天列表 |
| `comments`、`activity-feed` | Comments/Comment；ActivityFeed/ActivityItem | 作者/头像/时间/正文/动作，Comment 有 replies/edited/editedLabel；回复/编辑/排序/持久化归应用 |
| `conversation` | Conversation/List/Message/DaySeparator/Composer | 消息组、outgoing/status/actions；Composer 可控 draft/pending/disabled，submitLabel/pendingLabel 可配；提交 trim 后文本，不自动清空；历史默认普通列表，实时播报由应用选择 |
| `notification-list` | NotificationList/NotificationItem | unread/unreadLabel、时间/正文/动作；获取/标读/持久化归应用；不等于 Toast 队列 |
| `sortable-list` | 泛型 SortableList/SortableItem；items/onReorder/children/label、moveButtons | React Aria GridList 拖动/键盘排序，默认另有上/下按钮；应用持有顺序；当前同列表排序，不是跨列看板 |
| `plan-picker` | PlanPicker/PlanOption；options/value/defaultValue/onValueChange/label/description | RadioGroup 套餐选择，价格/特色/badge 插槽、禁用和方向；支付/计费/购买确认/权益校验归应用 |

## Token 与可配置边界

`src/styles/tokens.css` 是 Primitive → Semantic → Component 参数的 CSS 唯一来源。本次累计扩展没有新增全局 Token；此前已有 `--ds-info` / `--ds-info-surface`、`--ds-warning` / `--ds-warning-surface` 四个状态语义与 Light/Dark 映射，继续供 Badge、StatusMessage、Banner 等使用。error 复用 destructive；用户颜色、渐变和图片参数作为业务数据留在局部。

组件复用已有 control/input height、padding/gap、toolbar/panel/form/section gap、border、radius、foreground/background 等语义。专属覆盖如 `--ds-content-measure`、`--ds-content-aside-width`、`--ds-dashboard-span`、`--ds-gradient-preview-height`、`--ds-watermark-opacity` 在组件 CSS 就地回退，不是新的全局密度预设。`--_…` 是内部实现变量，不是公开 API。具体默认值和可覆盖参数查对应 CSS，避免在 TS/JSON 另存手工同步的数值。

默认规则位于 `@layer components`，后续 Tailwind utilities 可有意覆盖最终属性；inline 自定义变量改变变量值，inline height 等属性决定最终属性。不要用未分层全局规则绕过级联契约。

```tsx
import type { CSSProperties } from "react"
import { Button } from "@/components/ui/button"

export function SizeOverrides() {
  return <>
    {/* 局部组件尺寸；其他 Button 仍跟随共享密度。 */}
    <Button style={{ "--ds-button-height": "44px" } as CSSProperties}>提交</Button>
    {/* utility 有意覆盖 height；仍须照顾有效触摸目标。 */}
    <Button className="h-12">独立操作</Button>
  </>
}
```

ThemeProvider/useTheme 位于 `@/components/theme-provider`；System Theme 的图标和名称用 resolvedTheme。保留 head 同步执行的 evenform-init.js，对齐 storageKey/defaultTheme/density key。当前 Provider 使用浏览器存储和 document，SSR 项目须放在客户侧边界；不能从日期控件的 SSR 支持推断整个 Starter 可服务端渲染。RichTextEditor 已禁用立即渲染；Chart、ImageEditor、Watermark 等依赖挂载后测量。Countdown 首次时间、日期区域/时区与 hydration 一致性由消费方处理。

## 可直接采用的组合

下面示例只从共享组件导入，状态留在消费方；不需要导入 Playground。

### 单选与多选 Combobox

以下示例使用当前导出的部件，不依赖 Playground。单选值为 `string | null`，多选值为 `string[]`；多选 chips 使用 ComboboxValue 的当前值，不额外维护一份派生选中列表。若允许提交列表之外的文本，需要独立的 draft 与选择状态；完整异步、失焦和清空示例见 [自由输入接入契约](source-adoption-contracts.md#free-entry-suggestions)，不改变这里的闭合集合选择语义。

```tsx
import { useState } from "react"
import { FormField } from "@/components/patterns/layouts"
import {
  Combobox, ComboboxInputGroup, ComboboxInput, ComboboxTrigger,
  ComboboxContent, ComboboxEmpty, ComboboxList, ComboboxItem,
  ComboboxChips, ComboboxValue, ComboboxChip, ComboboxChipRemove,
} from "@/components/ui/combobox"

const teams = ["设计", "工程", "产品", "研究"]

export function TeamFields() {
  const [team, setTeam] = useState<string | null>(null)
  const [reviewers, setReviewers] = useState<string[]>(["设计"])
  return <>
    <FormField id="team" label="所属团队" description="输入名称以筛选团队。">
      <Combobox items={teams} value={team} onValueChange={setTeam}>
        <ComboboxInputGroup>
          <ComboboxInput id="team" aria-describedby="team-description" />
          <ComboboxTrigger aria-label="显示团队" />
        </ComboboxInputGroup>
        <ComboboxContent>
          <ComboboxEmpty>没有匹配的团队</ComboboxEmpty>
          <ComboboxList>{(item: string) =>
            <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
          }</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FormField>
    <FormField id="reviewers" label="复核团队">
      <Combobox multiple items={teams} value={reviewers} onValueChange={setReviewers}>
        <ComboboxChips>
          <ComboboxValue>{(values: string[]) => <>
            {values.map(value => <ComboboxChip key={value}>
              {value}<ComboboxChipRemove aria-label={`移除${value}`} />
            </ComboboxChip>)}
            <ComboboxInput id="reviewers" placeholder="添加团队…" />
          </>}</ComboboxValue>
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxEmpty>没有匹配的团队</ComboboxEmpty>
          <ComboboxList>{(item: string) =>
            <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
          }</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FormField>
  </>
}
```

### 异步确认：成功后关闭 AlertDialog

`AlertDialogAction` 默认组合 Base UI Close，适合立即完成的同步动作。异步请求使用普通 Button，受控 `open` 在成功后关闭；请求函数作为 prop 注入。组件不自动提供 loading、重试或错误策略。

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { StatusMessage } from "@/components/patterns/status-message"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from "@/components/ui/alert-dialog"

export function ArchiveConfirmation({ archive }: { archive: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  async function confirm() {
    setPending(true)
    setError("")
    try {
      await archive()
      setOpen(false)
    } catch {
      setError("归档失败，请重试。")
    } finally {
      setPending(false)
    }
  }
  return <AlertDialog open={open} onOpenChange={(nextOpen) => {
    if (pending) return
    setOpen(nextOpen)
    if (nextOpen) setError("")
  }}>
    <AlertDialogTrigger render={<Button variant="outline" />}>归档项目</AlertDialogTrigger>
    <AlertDialogContent aria-busy={pending}>
      <AlertDialogHeader>
        <AlertDialogTitle>归档这个项目？</AlertDialogTitle>
        <AlertDialogDescription>归档后，项目会从活动列表移出。</AlertDialogDescription>
      </AlertDialogHeader>
      {error && <StatusMessage tone="error" role="alert">{error}</StatusMessage>}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={pending}>取消</AlertDialogCancel>
        <Button disabled={pending} onClick={() => void confirm()}>
          {pending ? "正在归档…" : "确认归档"}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
}
```

### 结构化日期、范围与颜色

React Aria 使用 onChange/isDisabled，日期值不是本地化后的字符串；区域切换只改变呈现。将具体类型保留在应用状态中，序列化时再明确业务时区。

```tsx
import { useState } from "react"
import { parseDate, type CalendarDate } from "@internationalized/date"
import { DateLocaleProvider } from "@/components/ui/date-field"
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker"
import { ColorPicker, parseColor, type Color } from "@/components/ui/color-picker"

type DateRange = { start: CalendarDate; end: CalendarDate }
export function DocumentFields() {
  const [date, setDate] = useState<CalendarDate | null>(null)
  const [range, setRange] = useState<DateRange | null>({
    start: parseDate("2026-10-21"), end: parseDate("2026-10-27"),
  })
  const [color, setColor] = useState<Color>(parseColor("#4263eb"))
  return <>
    <DateLocaleProvider locale="zh-CN">
      <DatePicker label="复核日期" value={date} onChange={setDate} />
      <DateRangePicker label="报告周期" value={range} onChange={setRange} />
    </DateLocaleProvider>
    <ColorPicker label="文档颜色" value={color} onChange={setColor} showAlpha
      hueLabel="色相" alphaLabel="不透明度" valueLabel="十六进制颜色" />
    <output>{color.toString("hexa")}</output>
  </>
}
```

### TanStack v9 数据表：稳定列、显式状态和行身份

下面的数据由 props 提供，排序/搜索/分页发生在本地，选择只用于显示数量。服务端列表仍需应用接入请求、manual* 选项、总数和错误策略。旧 rows 可以在 loading 时继续显示，error 有独立入口。

```tsx
import { useState } from "react"
import type {
  SortingState, PaginationState, RowSelectionState,
} from "@tanstack/react-table"
import {
  useDataTable, DataTable, DataTableColumnHeader,
  DataTableCheckbox, DataTablePagination, type DataTableColumnDef,
} from "@/components/ui/data-table"
import { SearchField } from "@/components/ui/search-field"
import { SelectionBar } from "@/components/patterns/selection-bar"

type Project = { id: string; name: string }
const columns: DataTableColumnDef<Project>[] = [
  {
    id: "select", enableSorting: false, enableHiding: false,
    header: ({ table }) => <DataTableCheckbox
      aria-label="选择当前页"
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={table.getIsSomePageRowsSelected()}
      onChange={event => table.toggleAllPageRowsSelected(event.target.checked)} />,
    cell: ({ row }) => <DataTableCheckbox aria-label={`选择${row.original.name}`}
      checked={row.getIsSelected()}
      onChange={event => row.toggleSelected(event.target.checked)} />,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column}>项目</DataTableColumnHeader>,
  },
]
export function ProjectTable({ rows, loading, error }: {
  rows: Project[]; loading?: boolean; error?: string
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const table = useDataTable({
    data: rows, columns, getRowId: row => row.id, enableRowSelection: true,
    state: { sorting, globalFilter, rowSelection, pagination },
    onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection, onPaginationChange: setPagination,
  })
  return <>
    <SearchField aria-label="搜索项目" value={globalFilter} onValueChange={value => {
      setGlobalFilter(value)
      setPagination(previous => ({ ...previous, pageIndex: 0 }))
    }} />
    <SelectionBar selectedCount={Object.values(rowSelection).filter(Boolean).length}
      onClear={() => setRowSelection({})}
      selectedLabel={count => `已选 ${count} 项`} clearLabel="清空选择" />
    <DataTable table={table} caption="项目列表" loading={loading} error={error}
      loadingContent="正在加载项目…" emptyContent="没有匹配的项目。" />
    <DataTablePagination table={table} pageSizeLabel="每页数量"
      previousLabel="上一页" nextLabel="下一页"
      formatPage={(page, count) => `第 ${page} 页，共 ${count} 页`} />
  </>
}
```

筛选后仍保留的选择是否继续有效，需由产品明确。上例的行身份稳定，但没有自动授予跨页批量操作权限。需要列可见性/列过滤时同样使用 table 实例状态与 callbacks，再组合现有菜单或字段。

### 富文本：保存 JSON 文档，不把示例内容放入组件

```tsx
import type { JSONContent } from "@tiptap/react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

export function DocumentEditor({ document, onDocumentChange }: {
  document: JSONContent; onDocumentChange: (next: JSONContent) => void
}) {
  return <RichTextEditor label="正文" content={document}
    onUpdate={next => onDocumentChange(next)}
    footer={editor => <span>{editor.getText().length} 个字符</span>} />
}
```

content 为受控文档；defaultContent 只用于初始内容。extensions 只接收可信的 Tiptap 扩展；新增 schema 后要同步持久文档兼容策略。renderToolbar 可替换默认工具栏，onEditorReady 提供实际 Editor；不要自行绕过 disabled/readOnly 状态。服务端保存、协作冲突、导入 HTML 和展示内容的安全策略由应用负责。

### 事件日历：提供事件激活入口和实际时区

```tsx
import { useRef } from "react"
import type { EventInput } from "@fullcalendar/react"
import { EventCalendar, type CalendarRef } from "@/components/ui/event-calendar"
import { Button } from "@/components/ui/button"

export function Schedule({ events, onOpenEvent }: {
  events: EventInput[]; onOpenEvent: (id: string) => void
}) {
  const calendar = useRef<CalendarRef>(null)
  return <>
    <Button onClick={() => calendar.current?.getApi().today()}>今天</Button>
    <EventCalendar ref={calendar} label="工作日程" timeZone="UTC" events={events}
      eventClick={info => {
        info.jsEvent.preventDefault()
        onOpenEvent(info.event.id)
      }} />
  </>
}
```

事件有稳定 id，调用方用日期编辑表单、选择回调或持久化接口修改 events；需要 editable/拖放时处理 eventChange 与失败回滚。这里使用本仓库安装的 FullCalendar v7 子路径插件与 CalendarRef，不拼接 v6 独立插件包。日期选择器无需加载这个事件引擎。

## 接入范围、示例与剩余边界

Showcase 的目录、表格、日期/层级/文件、媒体、产品 Patterns、工作流和设计工具示例都位于 `src/playground/`。示例通过共享组件配置生成，选中的项目、上传进度、消息、会话、套餐和事件等演示状态留在页面；不代表已经有生产后端。业务代码不应导入 Playground 或把它的延时、随机数据、模拟认证搬入共享组件。

`src/starter/App.tsx` 保持应用入口和 Home 内容，不导入 Playground、Token 编辑器或图表演示。不同产品可组合 ContentLayout/HeaderShell/DetailLayout 等，不必复制一套设计系统，也不必将所有页面强套 AppShell。

当前源码已经覆盖日期网格/范围/分段输入、树与级联、双列表、文件选择/拖放、Toast 队列、命令面板、富文本、数据表排序过滤分页、同列表排序和事件日历等能力；这些不再列为未实现。以下事项仍有明确边界：

| 范围 | 当前契约 |
| --- | --- |
| 业务服务 | 认证、会话、权限、支付、上传传输、消息送达、持久化、远程查询与批量事务由产品接入 |
| 大型数据交互 | DataTable 是语义 table + 数据引擎；支持 getSubRows 树行、展开、列固定与调整；独立 VirtualList 不自动虚拟化表格；没有单元格编辑/公式、合并单元格或完整电子表格契约 |
| 拖动工作流 | SortableList 提供同列表排序；跨列表/跨列看板、自由画布和图编辑需要独立评估交互与数据契约 |
| 图片处理 | ImageEditor 提供配置与 CSS 预览，未提供像素导出、图层文档或完整图像处理引擎 |
| 第三方素材与业务品牌 | Logo/旗帜/插画素材库、品牌社交按钮、信用卡外观与业务客户端不是自动复制进来的通用能力；用现有图像、文字、按钮和 slots 组合，遵守产品资源来源 |
| 本地化与 SSR | primitive 保留对应能力；组合中的默认英文文案、时间格式与客户侧边界需按产品配置/扩展，不能宣称整库所有默认文案均已可翻译或整库 SSR 已验收 |

## 参考来源与采用范围

[Arco 官方组件导出目录](https://raw.githubusercontent.com/arco-design/arco-design/main/components/index.tsx) 用于检查通用产品控件覆盖；[Untitled UI 组件目录](https://www.untitledui.com/react/components) 用于辨认 Base、Application UI 与页面组合层次。[Filter bars](https://www.untitledui.com/react/components/filter-bars) 和 [Progress steps](https://www.untitledui.com/react/components/progress-steps) 帮助区分筛选组合和进度展示的职责。

这些是范围与任务参考，没有引入 Arco/Untitled 运行库，也不承诺它们的 props/API 兼容。视觉、状态、依赖与交互以 Evenform/Base UI 和本页对应源码为准；剩余范围、等价组合与取舍保持在 [reference-audit.md](reference-audit.md)，可复现检查入口保持在 [development.md](development.md)；`evidence/` 仅存放本地生成的检查结果，不随仓库发布。

## Motion additions

- `TabsList motion="slide"` uses Base UI's indicator; both variants/orientations,
  existing selection APIs and keyboard semantics remain available. Default is none.
- `FeedbackButton` (`ui/feedback-button`) composes Button with controlled
  idle/loading/success/error state and stable label space; business async work stays
  with the caller. CopyButton reuses the presentation.
- `SortableList motion` enables layout continuity for non-virtual lists; React
  Aria still owns DnD and focus.
- `LoadingSwap` (`patterns/loading-swap`) overlaps a placeholder with content,
  preserves its footprint and keeps hidden content inert.

- `MorphingPopoverContent` (`patterns/morphing-popover`) is an optional Popover
  surface transition; share `anchorRef` with `PopoverTrigger`. Text stays at its
  normal size. Narrow viewports and Reduced Motion use a fade. See [Motion](motion.md).
- `ResetButton` (`ui/reset-button`) adds a finite, interruptible icon turn and
  accessible reset confirmation to the existing Button.

Configuration, local overrides, reduced motion and examples: [Motion](motion.md).

Restored Select labels, asynchronous options, workspace scrolling, named menu groups,
Card feed sizing and surface tokens: [source adoption contracts](source-adoption-contracts.md).
