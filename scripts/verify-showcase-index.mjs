import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import assert from 'node:assert/strict'
import ts from 'typescript'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../src/playground')
const cache = new Map()
const location = { hash: '' }
const events = []
function load(name) {
  const file = resolve(root, `${name}.ts`)
  if (cache.has(file)) return cache.get(file)
  const module = { exports: {} }
  const code = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(code, { module, exports: module.exports, require: id => load(id), location, URLSearchParams, Event, window: { dispatchEvent: event => events.push(event.type) } }, { filename: file })
  cache.set(file, module.exports)
  return module.exports
}
const { showcaseGroups, showcaseHref, readShowcaseRoute, navigateShowcase } = load('./showcase-navigation')
const ids = new Map()
const previewTargets = new Map()
const dynamicIds = new Set()
function scan(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = resolve(folder, entry.name)
    if (entry.isDirectory()) { scan(path); continue }
    if (!path.endsWith('.tsx')) continue
    const source = readFileSync(path, 'utf8')
    const sf = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const attr = (node, name) => node.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.getText(sf) === name)?.initializer
    const str = value => value && ts.isStringLiteral(value) ? value.text : undefined
    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const id = str(attr(node, 'id'))
        if (id?.startsWith('example-')) {
          ids.set(id, [...(ids.get(id) ?? []), path])
          let parent = node.parent
          while (parent) {
            if (ts.isJsxElement(parent) && parent.openingElement.tagName.getText(sf) === 'TabsContent') {
              previewTargets.set(id, str(attr(parent.openingElement, 'value'))); break
            }
            parent = parent.parent
          }
        }
        const tag = node.tagName.getText(sf)
        const family = str(attr(node, tag === 'Example' ? 'family' : 'type'))
        if (family && ['Example', 'ChartPanel'].includes(tag)) dynamicIds.add(`example-chart-${family.toLowerCase().replaceAll(' ', '-')}`)
      }
      ts.forEachChild(node, visit)
    }
    visit(sf)
  }
}
scan(root)
const destinations = []
for (const group of showcaseGroups) for (const entry of group.entries) for (const example of entry.examples ?? []) {
  const href = showcaseHref(group.page, entry.id, example)
  assert(ids.get(example.anchor)?.length === 1 || dynamicIds.has(example.anchor), `Missing/duplicate target: ${href}`)
  if (example.preview) assert.equal(previewTargets.get(example.anchor), example.preview, `Preview mismatch: ${href}`)
  location.hash = href
  const route = readShowcaseRoute()
  assert.equal(route.page, group.page)
  assert.equal(route.section, entry.id)
  assert.equal(route.anchor, example.anchor)
  assert.equal(route.preview, example.preview)
  destinations.push(href)
}
assert.equal(new Set(destinations).size, destinations.length)
for (const page of ['dashboard', 'inbox', 'workspace', 'settings']) {
  location.hash = showcaseHref(page)
  assert.equal(readShowcaseRoute()?.page, page, `Application route: ${page}`)
}
location.hash = '#components/dates'
assert.equal(readShowcaseRoute().section, 'dates')
location.hash = '#main-content'
assert.equal(readShowcaseRoute(), null)
const target = showcaseGroups[0].entries[0].examples[0]
navigateShowcase('components', 'catalog', target)
navigateShowcase('components', 'catalog', target)
assert.equal(events.at(-1), 'evenform:reveal-example')
console.log(JSON.stringify({ destinations: destinations.length, literalTargets: ids.size, previewTargets: previewTargets.size, dynamicChartTargets: dynamicIds.size, result: 'pass' }, null, 2))
