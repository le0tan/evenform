// Editor metadata only: labels, bounds and units. Design defaults remain in CSS.
export type TokenName = `--ds-${string}`
export type TokenControl = { name: TokenName; label: string; min: number; max: number; step: number; note?: string; unit?: "px" | "ms" | ""; density?: "layout" | "control" }
export const tokenControls = [
  { name: "--ds-page-padding-x", density: "layout", label: "Page padding", min: 16, max: 56, step: 4, note: "Horizontal page inset" },
  { name: "--ds-section-gap", density: "layout", label: "Section gap", min: 16, max: 56, step: 4, note: "Between content groups" },
  { name: "--ds-card-padding", density: "layout", label: "Card padding", min: 8, max: 36, step: 4, note: "Every Card, including headers" },
  { name: "--ds-control-height", density: "control", label: "Control height", min: 28, max: 48, step: 2, note: "Buttons, inputs, selects & tabs" },
  { name: "--ds-radius-base", label: "Border radius", min: 0, max: 14, step: 1, note: "Official shadcn radius scale" },
  { name: "--ds-font-size-base", label: "Base font size", min: 12, max: 18, step: 1, note: "Type scale, not page zoom" },
  { name: "--ds-sidebar-width", label: "Sidebar width", min: 192, max: 280, step: 8, note: "Desktop navigation" },
] satisfies TokenControl[]
export const advancedTokenGroups: { label: string; controls: TokenControl[] }[] = [
  { label: "Motion", controls: [
    { name: "--ds-duration-fast", label: "Fast duration", min: 0, max: 400, step: 10, unit: "ms" },
    { name: "--ds-duration-standard", label: "Standard duration", min: 0, max: 600, step: 10, unit: "ms" },
    { name: "--ds-motion-enter-distance", label: "Enter distance", min: 0, max: 16, step: 1 },
    { name: "--ds-motion-enter-scale", label: "Enter scale", min: 0.94, max: 1, step: 0.01, unit: "" },
  ] },
  { label: "Layout", controls: [
    { name: "--ds-page-padding-y", density: "layout", label: "Vertical page padding", min: 12, max: 64, step: 4 },
    { name: "--ds-content-max-width", label: "Content max width", min: 640, max: 1600, step: 40 },
    { name: "--ds-header-height", label: "Header height", min: 48, max: 80, step: 4 },
    { name: "--ds-panel-gap", density: "layout", label: "Panel gap", min: 8, max: 40, step: 4 },
    { name: "--ds-sidebar-item-height", density: "layout", label: "Sidebar item height", min: 28, max: 48, step: 2 },
    { name: "--ds-sidebar-item-gap", density: "layout", label: "Sidebar item gap", min: 0, max: 16, step: 2 },
  ] },
  { label: "Controls", controls: [
    { name: "--ds-button-height-sm", density: "control", label: "Small button height", min: 24, max: 44, step: 2 },
    { name: "--ds-button-height-md", density: "control", label: "Default button height", min: 28, max: 48, step: 2 },
    { name: "--ds-button-height-lg", density: "control", label: "Large button height", min: 32, max: 56, step: 2 },
    { name: "--ds-input-height", density: "control", label: "Input height", min: 28, max: 48, step: 2 },
    { name: "--ds-control-padding-x", density: "control", label: "Control horizontal padding", min: 8, max: 24, step: 2 },
    { name: "--ds-control-gap", label: "Control content gap", min: 4, max: 16, step: 2 },
    { name: "--ds-select-item-height", density: "control", label: "Select option height", min: 28, max: 48, step: 2 },
    { name: "--ds-textarea-min-height", label: "Textarea minimum height", min: 64, max: 192, step: 8 },
    { name: "--ds-tabs-gap", label: "Tab item gap", min: 0, max: 16, step: 2 },
  ] },
  { label: "Forms", controls: [
    { name: "--ds-form-field-gap", density: "layout", label: "Field label gap", min: 4, max: 20, step: 2 },
    { name: "--ds-form-group-gap", density: "layout", label: "Form group gap", min: 12, max: 40, step: 4 },
  ] },
  { label: "Data", controls: [
    { name: "--ds-description-item-padding-y", density: "layout", label: "Property vertical padding", min: 4, max: 20, step: 2 },
    { name: "--ds-description-label-width", label: "Property label width", min: 80, max: 176, step: 8 },
    { name: "--ds-table-row-height", density: "layout", label: "Table row minimum height", min: 36, max: 72, step: 4 },
    { name: "--ds-table-cell-padding-x", density: "layout", label: "Table cell horizontal padding", min: 8, max: 24, step: 2 },
    { name: "--ds-table-cell-padding-y", density: "layout", label: "Table cell vertical padding", min: 4, max: 20, step: 2 },
    { name: "--ds-card-gap", density: "layout", label: "Card content gap", min: 8, max: 32, step: 4 },
  ] },
  { label: "Overlays", controls: [
    { name: "--ds-dialog-padding", density: "layout", label: "Dialog padding", min: 16, max: 40, step: 4 },
    { name: "--ds-dialog-width", label: "Dialog width", min: 360, max: 680, step: 40 },
    { name: "--ds-sheet-padding", density: "layout", label: "Sheet content padding", min: 16, max: 40, step: 4 },
    { name: "--ds-sheet-width", label: "Sheet width", min: 320, max: 560, step: 40 },
    { name: "--ds-overlay-gap", density: "layout", label: "Overlay section gap", min: 8, max: 32, step: 4 },
  ] },
  { label: "Typography", controls: [
    { name: "--ds-text-body", label: "Body text size", min: 12, max: 18, step: 1 },
    { name: "--ds-text-label", label: "Label text size", min: 12, max: 18, step: 1 },
    { name: "--ds-text-caption", label: "Caption text size", min: 11, max: 16, step: 1 },
    { name: "--ds-text-section-title", label: "Section title size", min: 14, max: 24, step: 1 },
    { name: "--ds-text-page-title", label: "Page title size", min: 24, max: 40, step: 2 },
    { name: "--ds-line-height-body", label: "Body line height", min: 1.2, max: 1.8, step: 0.05, unit: "" },
  ] },
]
export const allTokenControls: TokenControl[] = [...tokenControls, ...advancedTokenGroups.flatMap(group => group.controls)]
