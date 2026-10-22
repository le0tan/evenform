# UI development

- Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining.
- Motion defaults live in CSS Tokens. Preserve primitive presence/focus contracts, make transitions interruptible, and verify CSS + JavaScript reduced-motion paths; see docs/motion.md.

- 开始 UI 工作前阅读 DESIGN.md；区分工程契约、设计原则与当前实现，用户明确约束优先。
- 先判断任务和内容结构，再复用适合的 Evenform 组件（基于 shadcn Nova）与 Layout Patterns；不适合时组合或扩展，不强套 AppShell。
- 相同用途保持一致并优先复用 Tokens。现有语义不适用时可扩展；共享参数优先放在 Semantic 层，组件专属参数放在 Component 层，一次性细节保持局部。CSS 是参数单一来源，不维护需人工同步的 TS/JSON 副本。
- 根据实际信息层级、内容密度和阅读任务选择 Card、分割线、留白、边界和阴影；避免重复强调，也不要为“极简”机械删减。具体判断见 DESIGN.md。
- 为适用的控件和流程提供清晰的 hover、focus、selected、disabled、loading、empty 和错误反馈；按实际状态设计，不给每个页面硬加全部状态。
- 保留官方组件的交互和无障碍契约，优先组合成熟 primitives；需要扩展时验证受影响的键盘操作、焦点和语义。
- 验证与改动范围匹配：较大 UI 改动实际启动并检查截图；共享布局或 Token 变动检查相关视口、主题、密度及多个实际使用点；局部改动检查对应场景。纯文档修改无需启动 UI。
- 不因轻微视觉改动触发无关重构或过度测试；只在真实重复需求明确时增加抽象，并运行与变更相关的 build/lint 和必要验证。

- 新业务页面从 src/starter/App.tsx 开始；Showcase 保留作参考，不复制设计系统，也不把演示状态带进复用组件。
- 组件/布局默认属性放在 components 层，让 utility 可有意覆盖；共享变化用 Token。检查局部变量、utility 与 inline 属性的真实优先级，示例见 DESIGN.md。
- 保留 head 中的偏好初始化脚本，并对齐存储 key / 默认主题；System Theme 的 UI 使用 useTheme().resolvedTheme，应用快捷键放在应用层。
