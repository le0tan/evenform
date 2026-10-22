import { cp, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Source-first adoption for an existing host. It never installs or changes the
// host's framework, configuration, or package manifest.
const root = fileURLToPath(new URL('../', import.meta.url))
const args = process.argv.slice(2)
let target
let overwrite = false
let legacyNodeResolution = false
const entries = ['src/core.css', 'src/components/theme-provider.tsx', 'src/lib/cn-tables.ts', 'public/evenform-init.js', 'scripts/build-cn.mjs']
for (let i = 0; i < args.length; i++) {
  const flag = args[i]
  if (flag === '--to') target = args[++i]
  else if (flag === '--entry' || flag === '--style') entries.push(args[++i])
  else if (flag === '--overwrite') overwrite = true
  else if (flag === '--legacy-node-resolution') legacyNodeResolution = true
  else throw new Error(`Unknown argument: ${flag}`)
}
if (!target || entries.some(value => !value)) throw new Error('Usage: node scripts/adopt-source.mjs --to <directory> --entry src/components/ui/button.tsx [--style src/styles/date-controls.css] [--overwrite]')
target = resolve(target)
if (target === resolve(root) || !relative(resolve(root), target).startsWith('..')) throw new Error('Choose a host outside the Evenform source tree.')
const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const visited = new Set()
const packages = new Set(['tailwindcss', '@tailwindcss/postcss'])
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
const dependencies = Object.fromEntries([...packages].sort().map(name => [name, manifest.dependencies?.[name] ?? manifest.devDependencies?.[name] ?? (name === '@tailwindcss/postcss' ? manifest.dependencies.tailwindcss : 'REVIEW REQUIRED')]))
await writeFile(resolve(target, 'evenform-adoption.json'), JSON.stringify({ source: 'https://github.com/le0tan/evenform', files: [...visited, ...(legacyNodeResolution ? ['src/cn-legacy.d.ts'] : [])].sort(), legacyNodeResolution, dependencies, notes: ['Review package versions against the source lockfile; this manifest does not install packages.', 'Import core.css and selected additional styles in the host.', 'Preserve the head bootstrap and align theme/density keys.', 'Configure @/ alias; regenerate cn tables after changing CSS @theme.'] }, null, 2) + '\n')
console.log(`Copied ${visited.size} source files to ${target}; review evenform-adoption.json and install its required dependencies.`)
