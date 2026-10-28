import { showcaseExamples, type ShowcaseExample } from "./showcase-examples"

// Shared Showcase routes and search entries.
export type ShowcasePage = "foundations" | "components" | "patterns" | "charts" | "workspace" | "settings" | "dashboard" | "inbox" | "appearance"
export type ShowcaseEntry = { id: string; title: string; description: string; keywords: string; examples?: readonly ShowcaseExample[] }

export const componentEntries: ShowcaseEntry[] = [
  { id: "catalog", title: "Core controls", description: "Inputs, choices and common actions.", keywords: "button input textarea select checkbox switch radio group slider number field combobox accordion collapsible toggle tag breadcrumb pagination kbd alert dialog dropdown menu popover button group input group" },
  { id: "advanced", title: "Navigation & feedback", description: "Menus, commands, verification and notifications.", keywords: "context menu menubar navigation preview card scroll area meter otp field toast editor toolbar" },
  { id: "structured", title: "Structured data", description: "Navigate a hierarchy, move a selection and work with local files.", keywords: "tree tree select transfer file upload drop zone" },
  { id: "lists", title: "Lists & tags", description: "Long lists and custom labels.", keywords: "virtual list input tag arbitrary chips windowing" },
  { id: "dates", title: "Dates & choices", description: "Structured dates, reporting periods, colors and hierarchical choices.", keywords: "calendar date field date picker period picker range time month year quarter week color picker cascader command" },
  { id: "dataforms", title: "Data & forms", description: "Tables, tree rows, column sizing and grouped form validation.", keywords: "data table sorting filtering pagination selection pin resize column password input search field autocomplete checkbox group form fieldset label" },
  { id: "media", title: "Media & display", description: "Image review, carousels, ratings, references and media.", keywords: "image preview carousel rating avatar group badge group indicator qr code code block clipboard copy button video aspect ratio" },
  { id: "utilities", title: "Design aids", description: "Readable content, loading states, local resizing and editing in context.", keywords: "typography prose spinner loading busy affix back top resize box editable expandable text" },
  { id: "motion", title: "Motion", description: "Selection, feedback and transitions.", keywords: "animation sliding tabs segmented tooltip feedback button loading skeleton list reorder reduced motion duration" },
  { id: "tools", title: "Design editors", description: "Edit gradients and image settings, or plan events on a real calendar.", keywords: "gradient picker image editor crop filter fullcalendar event calendar" },
  { id: "specialized", title: "Text & identity", description: "Mentions, countdowns and watermarks.", keywords: "mentions watermark countdown timer" },
  { id: "compose", title: "In context", description: "Project briefs, review actions and record details.", keywords: "card project brief sharing access review dialog tooltip description list" },
  { id: "states", title: "States & feedback", description: "Communicate loading, empty results, completion and errors.", keywords: "loading skeleton error empty success feedback" },
  { id: "overrides", title: "Local overrides", description: "Component sizing examples.", keywords: "css tokens cascade utility inline configuration override" },
].map(entry => ({ ...entry, examples: showcaseExamples[`components/${entry.id}`] ?? [] }))
export const patternEntries: ShowcaseEntry[] = [
  { id: "operations", title: "Operational review", description: "Review contributions, compare exact values and inspect related context.", keywords: "contribution inspector responsive comparison partial data selection disclosure" },
  { id: "records", title: "Record browser", description: "Browse illustrative documents and read their full reports.", keywords: "sheet actions long title report accordion tabs toolbar grid list filters" },
  { id: "workspace", title: "Data workspace", description: "Search projects, filter results and act on a selection.", keywords: "table filter selection pagination dashboard metrics" },
  { id: "detail", title: "Record detail", description: "Review a record, understand its history and edit its configuration.", keywords: "description list timeline steps form detail" },
  { id: "access", title: "Account access", description: "Sign-in and account access.", keywords: "auth login sign up password form" },
  { id: "layouts", title: "Page layouts", description: "Reading, list-detail, form and adaptable workspace structures.", keywords: "content layout tabs reading split layout list detail form layout dashboard layout grid resize resizable result banner anchor page navigation status message" },
  { id: "product", title: "Content & workflow", description: "Editing, ordering, collaboration and plan selection.", keywords: "rich text editor sortable list comments activity feed conversation message notification list plan picker pricing" },
  { id: "workflow", title: "Agenda & forms", description: "Schedules, guided multi-step work and header-based application navigation.", keywords: "calendar agenda step form header navigation" },
].map(entry => ({ ...entry, examples: showcaseExamples[`patterns/${entry.id}`] ?? [] }))
export const chartEntries: ShowcaseEntry[] = [
  { id: "advanced", title: "Advanced charts", description: "Flow, hierarchy, distribution and change.", keywords: "evenform chart sankey treemap sunburst heatmap boxplot waterfall radar" },
  { id: "overview", title: "Analytics overview", description: "Explore trends, channels, devices and conversion with shared filters.", keywords: "line bar pie donut traffic analytics" },
  { id: "data", title: "Source data", description: "The exact analytics values, with the same filters and CSV export.", keywords: "table csv export analytics" },
].map(entry => ({ ...entry, examples: showcaseExamples[`charts/${entry.id}`] ?? [] }))
export const showcaseGroups = [
  { page: "components", title: "Components", entries: componentEntries },
  { page: "patterns", title: "Patterns", entries: patternEntries },
  { page: "charts", title: "Charts", entries: chartEntries },
] as const
export const componentValues = componentEntries.map(item => item.id)
export const patternValues = patternEntries.map(item => item.id)
export const chartValues = chartEntries.map(item => item.id)
export type ShowcaseRoute = { page: ShowcasePage; section: string; anchor?: string; preview?: string }

export function readShowcaseRoute(): ShowcaseRoute | null {
  const [page, section] = location.hash.slice(1).split(/[/?]/)
  const query = new URLSearchParams(location.hash.split("?")[1])
  const target = { anchor: query.get("anchor") || undefined, preview: query.get("preview") || undefined }
  const group = showcaseGroups.find(group => group.page === page)
  if (group) return { page: group.page, section: group.entries.some(item => item.id === section) ? section : group.entries[0].id, ...target }
  if (page === "workspace" || page === "settings" || page === "dashboard" || page === "inbox" || page === "appearance") return { page, section: "" }
  if (!page || page === "foundations") return { page: "foundations", section: "" }
  return null
}
export function showcaseHref(page: ShowcasePage, section = "", target?: { anchor?: string; preview?: string }) {
  const query = new URLSearchParams()
  if (target?.preview) query.set("preview", target.preview)
  if (target?.anchor) query.set("anchor", target.anchor)
  return `#${page}${section ? `/${section}` : ""}${query.size ? `?${query}` : ""}`
}

// Programmatic transitions use the same history and notification path as native links.
export function navigateShowcase(page: ShowcasePage, section = "", target?: { anchor?: string; preview?: string }) {
  const href = showcaseHref(page, section, target)
  if (location.hash !== href) location.hash = href
  else window.dispatchEvent(new Event("evenform:reveal-example"))
}
