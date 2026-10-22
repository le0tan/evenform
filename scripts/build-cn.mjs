import { build } from "cn/build"

// CSS owns theme scales. Keep all groups so copied components and dynamically
// supplied host classNames retain standard Tailwind conflict semantics.
const result = await build({
  css: "src/core.css",
  out: "src/lib/cn-tables.ts",
  full: true,
})
for (const warning of result.warnings) console.warn(warning)
