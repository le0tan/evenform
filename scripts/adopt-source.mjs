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
let into = null
let add = false
const styleEntries = new Set(['src/core.css'])
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
  else if (flag === '--add') add = true
  else if (flag === '--legacy-node-resolution') legacyNodeResolution = true
  else if (flag === '--into') into = args[++i]?.replace(/^\.\/|\/+$/g, '')
  else throw new Error(`Unknown argument: ${flag}`)
}
if (!target || entries.some(value => !value) || into === undefined || into === '') throw new Error('Usage: node scripts/adopt-source.mjs --to <directory> --entry src/components/ui/button.tsx [--style src/styles/date-controls.css] [--into src/evenform] [--add] [--overwrite]')
if (into && (isAbsolute(into) || into.split('/').includes('..'))) throw new Error('--into must be a relative folder inside the host, such as src/evenform.')
target = resolve(target)
if (target === resolve(root) || !relative(resolve(root), target).startsWith('..')) throw new Error('Choose a host outside the Evenform source tree.')
const hash = content => createHash('sha256').update(content).digest('hex')
// --add extends an existing adoption: recorded entries, styles and compatibility
// mode are kept, so adding one component never drops earlier ones from the manifest.
let previous = null
if (add) {
  try { previous = JSON.parse(await readFile(resolve(target, 'evenform-adoption.json'), 'utf8')) } catch { throw new Error('--add extends an existing evenform-adoption.json; run a plain export first.') }
  if (previous.schemaVersion !== 1 || !Array.isArray(previous.entries)) throw new Error('--add requires a schemaVersion 1 adoption manifest.')
  if (into !== null && into !== (previous.into ?? null)) throw new Error(`--add keeps the recorded --into (${previous.into ?? 'none'}); export into a different folder separately.`)
  into = previous.into ?? null
  legacyNodeResolution = legacyNodeResolution || Boolean(previous.legacyNodeResolution)
  entries.push(...previous.entries)
  for (const style of previous.styleEntries ?? []) styleEntries.add(into && style.startsWith(`${into}/`) ? `src/${style.slice(into.length + 1)}` : style)
}
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
// Optional stylesheets (imported by index.css, not core.css) own the rules whose
// first compound names one of their classes or slots. A component that renders
// that class or slot needs the stylesheet; descendant selectors are context only.
const ownedStyles = new Map()
for (const [, path] of (await readFile(resolve(root, 'src/index.css'), 'utf8')).matchAll(/@import\s+["']\.\/(styles\/[^"']+)["']/g)) {
  const style = `src/${path}`
  const css = (await readFile(resolve(root, style), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  for (const [, selectors] of css.matchAll(/([^{}]+)\{/g)) for (const selector of selectors.split(',')) {
    for (const match of selector.trim().split(/[\s>~+]/)[0].matchAll(/\.((?:evenform|ds)-[\w-]+)|data-slot=["']([\w-]+)["']/g)) {
      const pattern = match[1] ? `(?<![\\w-])${match[1]}(?![\\w-])` : `data-slot=["'{\`]*${match[2]}["'\`]`
      if (!ownedStyles.has(pattern)) ownedStyles.set(pattern, new Set())
      ownedStyles.get(pattern).add(style)
    }
  }
}
const stylesFor = source => {
  const found = new Set()
  for (const [pattern, styles] of ownedStyles) if (new RegExp(pattern).test(source)) for (const style of styles) found.add(style)
  return [...found].sort()
}
const exists = async path => { try { return (await stat(path)).isFile() } catch (error) { if (error.code === 'ENOENT') return false; throw error } }
async function visit(name) {
  const absolute = resolve(root, name)
  const local = relative(root, absolute)
  if (isAbsolute(local) || local.startsWith('..')) throw new Error(`Import leaves source tree: ${name}`)
  if (visited.has(local)) return
  if (!await exists(absolute)) throw new Error(`Missing source: ${local}`)
  visited.add(local)
  const source = await readFile(absolute, 'utf8')
  if (!/\.(css|tsx?|mjs)$/.test(local)) return
  if (/\.tsx?$/.test(local)) for (const style of stylesFor(source)) {
    styleEntries.add(style)
    await visit(style)
  }
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
// The host only sees the files it adopted. The catalog lists every upstream
// component and pattern by task, marks what is already adopted and shows how to
// add the rest, so a product does not rebuild something Evenform already ships.
async function catalog(adopted) {
  const guide = await readFile(resolve(root, 'docs/components.md'), 'utf8')
  const command = 'node <evenform>/scripts/adopt-source.mjs --to <host> --add'
  const lines = ['# Evenform catalog', '', `Generated by scripts/adopt-source.mjs from Evenform ${revision ?? 'source'}; do not edit. Check this list before writing a control, overlay, list, filter, chart or layout by hand.`, '', `Add a missing module (keeps the current entries): \`${command} --entry src/components/ui/<module>.tsx\``, '', 'New pages: compare with `src/starter/App.tsx` upstream (header, theme menu, providers). Full guide: `docs/components.md`; contracts: `DESIGN.md`.', '']
  let section = null
  for (const line of guide.split('\n')) {
    if (line.startsWith('## ')) { section = line; continue }
    if (!line.startsWith('| ') || /^\|\s*-/.test(line)) continue
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim())
    const modules = [...cells[0].matchAll(/`([a-z0-9-]+)`/g)].map(match => match[1])
    const files = []
    for (const name of modules) for (const folder of ['ui', 'patterns']) if (await exists(resolve(root, `src/components/${folder}/${name}.tsx`))) files.push(`src/components/${folder}/${name}.tsx`)
    if (!files.length) continue
    if (section) { lines.push('', section, '', '| Task | Modules | Exports | Notes |', '| --- | --- | --- | --- |'); section = null }
    const marked = files.map(file => `${adopted.has(destinationFor(file)) ? '✓' : '+'} \`${file.replace(/^src\/components\//, '').replace(/\.tsx$/, '')}\``).join(', ')
    const task = cells[0].replace(/`[^`]*`/g, '').replace(/^[、,，/\s]+|[、,，/\s]+$/g, '')
    const note = (cells[2] ?? '').length > 140 ? `${[...cells[2]].slice(0, 140).join('')}…` : cells[2] ?? ''
    lines.push(`| ${task} | ${marked} | ${cells[1] ?? ''} | ${note} |`)
  }
  lines.push('', '✓ adopted · + available upstream', '')
  return lines.join('\n')
}
// --into keeps Evenform beside host files with the same names (lib/utils.ts,
// components/ui/button.tsx): src/ moves under the folder and @/ imports become relative.
const destinationFor = file => into && file.startsWith('src/') ? `${into}/${file.slice(4)}` : file
const relativeImport = (file, id) => {
  const path = relative(dirname(destinationFor(file)), destinationFor(`src/${id}`))
  return path.startsWith('.') ? path : `./${path}`
}
const contentFor = async file => {
  let content = (await readFile(resolve(root, file))).toString()
  if (legacyNodeResolution && file === 'src/lib/utils.ts') content = content.replace('./cn-tables.ts', './cn-tables')
  if (into && /\.tsx?$/.test(file)) content = content.replace(/(\bfrom\s*|\bimport\s*(?:\(\s*)?)(["'])@\/([^"']+)\2/g, (_, prefix, quote, id) => `${prefix}${quote}${relativeImport(file, id)}${quote}`)
  if (into && file === 'scripts/build-cn.mjs') content = content.replace('"src/core.css"', `"${destinationFor('src/core.css')}"`).replace('"src/lib/cn-tables.ts"', `"${destinationFor('src/lib/cn-tables.ts')}"`)
  return Buffer.from(content)
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
  const destination = resolve(target, destinationFor(file))
  if (!overwrite && await exists(destination) && !Buffer.from(await readFile(destination)).equals(await contentFor(file))) throw new Error(add && previous?.hashes?.[destinationFor(file)] === hash(await readFile(destination))
    ? `Adopted file ${destinationFor(file)} differs from this checkout (recorded revision ${previous.revision ?? 'unknown'}). Add from the recorded revision, or upgrade the whole adoption first.`
    : `Different host file already exists: ${destinationFor(file)}. Review it, export with --into src/evenform, or use --overwrite.`)
}
if (legacyNodeResolution && !overwrite && await exists(resolve(target, 'src/cn-legacy.d.ts')) && await readFile(resolve(target, 'src/cn-legacy.d.ts'), 'utf8') !== legacyTypes) throw new Error('Different host src/cn-legacy.d.ts already exists.')
for (const file of visited) {
  await mkdir(dirname(resolve(target, destinationFor(file))), { recursive: true })
  await writeFile(resolve(target, destinationFor(file)), await contentFor(file))
}
if (legacyNodeResolution) await writeFile(resolve(target, 'src/cn-legacy.d.ts'), legacyTypes)
await mkdir(resolve(target, 'licenses/evenform'), { recursive: true })
for (const file of ['LICENSE', 'THIRD_PARTY_NOTICES.md', 'licenses']) await cp(resolve(root, file), resolve(target, 'licenses/evenform', file), { recursive: true })
const lock = JSON.parse(await readFile(resolve(root, 'package-lock.json'), 'utf8'))
const hashes = {}
for (const file of visited) hashes[destinationFor(file)] = hash(await readFile(resolve(target, destinationFor(file))))
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
await writeFile(resolve(target, 'evenform-adoption.json'), JSON.stringify({ schemaVersion: 1, source: 'https://github.com/le0tan/evenform', revision, sourceLockHash: hash(await readFile(resolve(root, 'package-lock.json'))), entries: [...new Set(entries)].sort(), ...(into ? { into } : {}), styleEntries: [...styleEntries].map(destinationFor).sort(), transformations: { ...(legacyNodeResolution ? { 'src/lib/utils.ts': { sourceHash: hash(await readFile(resolve(root, 'src/lib/utils.ts'))), kind: 'extensionless-cn-import' }, 'src/cn-legacy.d.ts': { kind: 'upstream-type-bridge' } } : {}), ...(into ? { '*': { kind: 'namespace-relative-imports', into } } : {}) }, hashes: Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b))), files: [...[...visited].map(destinationFor), ...(legacyNodeResolution ? ['src/cn-legacy.d.ts'] : [])].sort(), legacyNodeResolution, dependencies, notes: ['Review package versions against the source lockfile; this manifest does not install packages.', 'Import every styleEntries file in the host; each component\'s optional stylesheet is listed there.', 'Preserve the head bootstrap and align theme/density keys.', into ? 'Imports are relative to the --into folder; no @/ alias is required for Evenform files.' : 'Configure @/ alias; regenerate cn tables after changing CSS @theme.'] }, null, 2) + '\n')
await writeFile(resolve(target, 'evenform-catalog.md'), await catalog(new Set([...visited].map(destinationFor))))
console.log(`Copied ${visited.size} source files to ${target}; review evenform-adoption.json and install its required dependencies.`)
console.log(`Import these styles in the host: ${[...styleEntries].map(destinationFor).sort().join(', ')}`)
