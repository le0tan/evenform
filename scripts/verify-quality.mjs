import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

for (const name of [
  "verify-library-pages",
  "verify-token-integrity",
  "verify-input-quality",
  "verify-overlay-quality",
  "verify-data-media",
  "verify-pattern-quality",
]) {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL(`./${name}.mjs`, import.meta.url))], { stdio: "inherit" })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
