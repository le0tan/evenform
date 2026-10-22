import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Source-first adoption for an existing host. It never installs or changes the
// host's framework, configuration, or package manifest.
const root = fileURLToPath(new URL('../', import.meta.url))
const args = process.argv.slice(2)
let target
let check = false
let overwrite = false
let legacyNodeResolution = false
const styleEntries = new Set(['src/core.css'])
const companionStyles = {
  'src/components/patterns/header-layout.tsx': ['src/styles/workflow-aids.css'],
  'src/components/ui/copy-button.tsx': ['src/styles/utility-aids.css'],
  'src/components/ui/event-calendar.tsx': ['src/styles/design-tools.css'],
}
const entries = ['src/core.css', 'src/components/theme-provider.tsx', 'src/lib/cn-tables.ts', 'public/evenform-init.js', 'scripts/build-cn.mjs']
for (let i = 0; i < args.length; i++) {
  const flag = args[i]
  if (flag === '--to') target = args[++i]
  else if (flag === '--entry' || flag === '--style') {
    const entry = args[++i]
    entries.push(entry)
    if (entry?.endsWith('.css')) styleEntries.add(entry)
  }
  else if (flag === '--check') check = true
  else if (flag === '--overwrite') overwrite = true
  else if (flag === '--legacy-node-resolution') legacyNodeResolution = true
  else throw new Error(`Unknown argument: ${flag}`)
}
if (!target || entries.some(value => !value)) throw new Error('Usage: node scripts/adopt-source.mjs --to <directory> --entry src/components/ui/button.tsx [--style src/styles/date-controls.css] [--overwrite]')
target = resolve(target)
if (target === resolve(root) || !relative(resolve(root), target).startsWith('..')) throw new Error('Choose a host outside the Evenform source tree.')
const hash = content => createHash('sha256').update(content).digest('hex')
if (check) {
  const saved = JSON.parse(await readFile(resolve(target, 'evenform-adoption.json'), 'utf8'))
  if (saved.schemaVersion !== 1 || !saved.hashes || !Object.keys(saved.hashes).length) throw new Error('Export a versioned adoption manifest first.')
  for (const [file, expected] of Object.entries(saved.hashes)) {
    const destination = resolve(target, file)
    const local = relative(target, destination)
    if (isAbsolute(local) || local.startsWith('..')) throw new Error(`Invalid manifest path: ${file}`)
    if (hash(await readFile(destination)) !== expected) throw new Error(`Source integrity mismatch: ${file}`)
  }
  console.log(`Verified ${Object.keys(saved.hashes).length} source/license files against the adoption snapshot.`)
  process.exit(0)
}
const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const visited = new Set()
const packages = new Set(['react', 'react-dom', 'tailwindcss', '@tailwindcss/vite'])
const exists = async path => { try { return (await stat(path)).isFile() } catch (error) { if (error.code === 'ENOENT') return false; throw error } }
async function visit(name) {
  const absolute = resolve(root, name)
  const local = relative(root, absolute)
  if (isAbsolute(local) || local.startsWith('..')) throw new Error(`Import leaves source tree: ${name}`)
  if (visited.has(local)) return
  if (!await exists(absolute)) throw new Error(`Missing source: ${local}`)
  visited.add(local)
  // This pattern's CSS is not part of core.css.
  for (const style of companionStyles[local] ?? []) {
    styleEntries.add(style)
    await visit(style)
  }
  const source = await readFile(absolute, 'utf8')
  if (!/\.(css|tsx?|mjs)$/.test(local)) return
  const imports = local.endsWith('.css')
    ? [...source.matchAll(/@import\s+["']([^"']+)["']/g)].map(match => match[1])
    : [...source.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["']([^"']+)["']/g)].map(match => match[1])
  for (const id of imports) {
    if (id.startsWith('@/') || id.startsWith('.')) {
      const base = id.startsWith('@/') ? resolve(root, 'src', id.slice(2)) : resolve(dirname(absolute), id)
      const candidates = [base, ...['.tsx', '.ts', '.css', '/index.tsx', '/index.ts'].map(extension => base + extension)]
      let found
      for (const candidate of candidates) if (await exists(candidate)) { found = candidate; break }
      if (!found) throw new Error(`Cannot resolve ${id} in ${local}`)
      await visit(relative(root, found))
    } else if (!id.startsWith('node:')) packages.add(id.startsWith('@') ? id.split('/').slice(0, 2).join('/') : id.split('/')[0])
  }
}
for (const entry of entries) await visit(entry)
const contentFor = async file => {
  const content = await readFile(resolve(root, file))
  return legacyNodeResolution && file === 'src/lib/utils.ts'
    ? Buffer.from(content.toString().replace('./cn-tables.ts', './cn-tables'))
    : content
}
const legacyTypes = `// Compatibility for TypeScript moduleResolution=node; definitions stay upstream.
declare module 'cn/engine' { export { createCn } from 'cn/dist/engine'; }
`
// Preflight notices as well as source; no partial export on a license conflict.
const noticeFiles = []
async function collectNoticeFiles(name) {
  if ((await stat(resolve(root, name))).isDirectory()) {
    for (const entry of await readdir(resolve(root, name))) await collectNoticeFiles(`${name}/${entry}`)
  } else noticeFiles.push(name)
}
for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md', 'licenses']) await collectNoticeFiles(name)
for (const name of noticeFiles) {
  const destination = resolve(target, 'licenses/evenform', name)
  if (!overwrite && await exists(destination) && !Buffer.from(await readFile(destination)).equals(await readFile(resolve(root, name)))) throw new Error(`Different host notice already exists: licenses/evenform/${name}. Review it before using --overwrite.`)
}
// Preflight all collisions before copying anything.
for (const file of visited) {
  const destination = resolve(target, file)
  if (!overwrite && await exists(destination) && !Buffer.from(await readFile(destination)).equals(await contentFor(file))) throw new Error(`Different host file already exists: ${file}. Review it before using --overwrite.`)
}
if (legacyNodeResolution && !overwrite && await exists(resolve(target, 'src/cn-legacy.d.ts')) && await readFile(resolve(target, 'src/cn-legacy.d.ts'), 'utf8') !== legacyTypes) throw new Error('Different host src/cn-legacy.d.ts already exists.')
for (const file of visited) {
  await mkdir(dirname(resolve(target, file)), { recursive: true })
  await writeFile(resolve(target, file), await contentFor(file))
}
if (legacyNodeResolution) await writeFile(resolve(target, 'src/cn-legacy.d.ts'), legacyTypes)
await mkdir(resolve(target, 'licenses/evenform'), { recursive: true })
for (const file of ['LICENSE', 'THIRD_PARTY_NOTICES.md', 'licenses']) await cp(resolve(root, file), resolve(target, 'licenses/evenform', file), { recursive: true })
const lock = JSON.parse(await readFile(resolve(root, 'package-lock.json'), 'utf8'))
const hashes = {}
for (const file of visited) hashes[file] = hash(await readFile(resolve(target, file)))
if (legacyNodeResolution) hashes['src/cn-legacy.d.ts'] = hash(legacyTypes)
async function hashNotices(directory) {
  for (const entry of await readdir(resolve(target, directory), { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`
    if (entry.isDirectory()) await hashNotices(file)
    else hashes[file] = hash(await readFile(resolve(target, file)))
  }
}
await hashNotices('licenses/evenform')
let revision = null
try { revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() } catch { /* Downloaded source has no Git metadata; hashes still identify it. */ }
const dependencies = Object.fromEntries([...packages].sort().map(name => [name, lock.packages?.[`node_modules/${name}`]?.version ?? manifest.dependencies?.[name] ?? manifest.devDependencies?.[name] ?? 'REVIEW REQUIRED']))
await writeFile(resolve(target, 'evenform-adoption.json'), JSON.stringify({ schemaVersion: 1, source: 'https://github.com/le0tan/evenform', revision, sourceLockHash: hash(await readFile(resolve(root, 'package-lock.json'))), entries: [...new Set(entries)].sort(), styleEntries: [...styleEntries].sort(), transformations: legacyNodeResolution ? { 'src/lib/utils.ts': { sourceHash: hash(await readFile(resolve(root, 'src/lib/utils.ts'))), kind: 'extensionless-cn-import' }, 'src/cn-legacy.d.ts': { kind: 'upstream-type-bridge' } } : {}, hashes: Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b))), files: [...visited, ...(legacyNodeResolution ? ['src/cn-legacy.d.ts'] : [])].sort(), legacyNodeResolution, dependencies, notes: ['Review package versions against the source lockfile; this manifest does not install packages.', 'Import core.css and selected additional styles in the host.', 'Preserve the head bootstrap and align theme/density keys.', 'Configure @/ alias; regenerate cn tables after changing CSS @theme.'] }, null, 2) + '\n')
console.log(`Copied ${visited.size} source files to ${target}; review evenform-adoption.json and install its required dependencies.`)
