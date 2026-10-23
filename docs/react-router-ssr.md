# React Router SSR adoption

This guide covers source adoption into an existing React Router framework-mode
application. Keep its routes, loaders/actions, server runtime and deployment
configuration. The checked theme/controls do not establish SSR support for every
Evenform component; browser-only editors, charts, media and native bridges still
need their own client boundary and hydration checks.

## Source and build configuration

Use the export command in [Getting started](getting-started.md#adopt-into-an-existing-react-application)
and commit its manifest with the host lockfile. Select only the needed entries;
`styleEntries` records additional CSS. The exporter does not install packages or
rewrite host configuration. The manifest's dependency versions describe the
upstream snapshot; the host lockfile describes what is actually installed.

A React Router project may keep business code in `app/` and the unmodified
exported library in `src/`. Preserve both import namespaces in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "paths": { "~/*": ["./app/*"], "@/*": ["./src/*"] }
  }
}
```

The import-extension option supports the generated `cn-tables.ts` import in
the source snapshot. It requires a compatible no-emit/bundler configuration;
do not apply it indiscriminately to a server package that emits TypeScript as JS.
For legacy Node resolution, use the exporter's documented compatibility option.

Keep the existing Vite plugins; resolve the namespaces consistently in Vite:

```ts
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
})
```

A host already using Vite's matching TypeScript-path resolution can keep that
instead. Use Node and framework versions supported by that host; Evenform's
Node minimum is not a promise that every framework supports the same minimum.

In `app/app.css`, import shared CSS first and product overrides last:

```css
@import "../src/core.css";
/* When HeaderShell is selected, as recorded in styleEntries: */
@import "../src/styles/workflow-aids.css";
@source "../app";
@source "../src";
/* Product-specific CSS follows. */
```

Explicit source directories ensure that host utilities are generated even when
the CSS entry lives outside `app/`. Keep CSS as the parameter source. If a host
adds new utility scales, regenerate class-conflict metadata against its real CSS
entry and review that intentional snapshot change.

## Document bootstrap and provider

Retain the external parser-blocking bootstrap in the document head. The storage
keys and default theme must match the provider. This example deliberately uses
`system`; the standalone Starter's default remains `light`.

```tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router"
import { ThemeProvider } from "@/components/theme-provider"
import "./app.css"

export function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta />
      <script src="/evenform-init.js" data-theme-key="app-theme"
        data-density-key="app-density" data-default-theme="system" />
      <Links />
    </head>
    <body>{children}<ScrollRestoration /><Scripts /></body>
  </html>
}

export default function App() {
  return <ThemeProvider storageKey="app-theme" defaultTheme="system">
    <Outlet />
  </ThemeProvider>
}
```

The script modifies attributes on `html` before React renders, so hydration
suppression is limited to that element. Do not suppress warnings throughout
product content. On a non-root deployment, resolve the script URL using the
host's asset base. Apply the host's CSP/nonce policy consistently to its scripts.
Do not add `async` or `defer` to the preference bootstrap.

ThemeProvider explicitly avoids server storage reads, including Node versions
with a global `localStorage`. Its context uses the configured default during
server rendering and the first hydration render. A system default uses a stable
light server snapshot. After hydration it exposes the saved preference and the
current system mode; CSR reads the browser preference immediately. The root
effect waits for that handover so it does not overwrite the bootstrap with a
temporary server theme. Blocked storage falls back safely, while in-memory
theme changes still work.

Use `useTheme().resolvedTheme` for a theme toggle:

```tsx
const { resolvedTheme, setTheme } = useTheme()
const dark = resolvedTheme === "dark"
<Button aria-label={dark ? "Switch to light" : "Switch to dark"}
  onClick={() => setTheme(dark ? "light" : "dark")}>
  {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
</Button>
```

Keep `storageKey` and `defaultTheme` stable for a provider instance; use a new
provider key when intentionally switching preference scopes. Locale, timezone,
dates, random IDs and externally changing data must also match the first server
and client render. Avoid reading browser storage directly during a route render.

## Code ownership and distribution

Run the host formatter/linter on its business files. If copied upstream code
uses a different formatter, either preserve its bytes and exclude it from
formatting, or record and review a deliberate consumer transformation. Do not
silently reformat copied files and still claim the original hashes match.
Type checking and bundling should continue to include the adopted source.

Retain `licenses/evenform` and distribute the applicable notices with the
production static output. The host owns notices for its complete dependency
graph, not just the exported subset. The exporter's integrity check does not
replace a host build, locked installation or license review.

## Verification and boundaries

With the Evenform source dev server on port 4173:

```sh
npm run verify:ssr
npm run verify:input-adoption
```

`verify:ssr` performs actual `renderToString` rendering, poisons server storage
to detect access, holds hydration to check the bootstrap independently, then
hydrates and tests toggles/system changes. It covers light/dark/system defaults,
saved modes, invalid/missing values and blocked storage. It is a selected-component
SSR/hydration fixture, not a deployed React Router server or whole-library SSR audit.
`verify:input-adoption` covers the free-entry and non-HTML opener recipes.
Both accept `EVENFORM_URL` and `PLAYWRIGHT_EXECUTABLE_PATH`, and save local evidence.

In the real host, also run its type generation/check, production build and source
integrity check. Serve that production build and verify a saved dark preference
on reload, navigation, overlays, failure recovery and focus return. Validate API
and server integration separately from UI fixtures. See [source adoption contracts](source-adoption-contracts.md).
