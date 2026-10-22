import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { cn } from "../src/lib/utils.ts"

// Derive every semantic font scale from CSS rather than duplicating a theme list.
const tokens = await readFile(new URL("../src/styles/tokens.css", import.meta.url), "utf8")
const sizes = [...tokens.matchAll(/--text-([\w-]+):/g)].map(match => match[1]).filter(name => !name.includes("--"))
let count = 0
for (const size of sizes) {
  for (const color of ["text-primary-foreground", "text-muted-foreground", "text-success", "text-foreground/60"]) {
    for (const prefix of ["", "hover:", "dark:", "data-active:"]) {
      const a = `${prefix}text-${size}`, b = `${prefix}${color}`
      for (const args of [[a, b], [b, a]]) {
        const result = cn(...args).split(" ")
        assert(result.includes(a) && result.includes(b), `${args} => ${result}`)
        count++
      }
    }
  }
}
assert.equal(cn("text-label", "text-page-title"), "text-page-title")
assert.equal(cn("text-primary-foreground", "text-muted-foreground"), "text-muted-foreground")
assert.equal(cn("p-2 px-3", "px-6"), "p-2 px-6")
assert.equal(cn(["text-label", false, { "text-primary-foreground": true }]), "text-label text-primary-foreground")
assert.equal(cn("text-[length:var(--ds-text-control)] text-primary-foreground", "text-label"), "text-primary-foreground text-label")
console.log(`PASS ${count} CSS-derived font/color combinations plus same-property and nested-input overrides`)
