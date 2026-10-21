import assert from 'node:assert/strict'
import { readFile, readdir, writeFile, copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Vite records the packages present in JS chunks. CSS/font inputs are added
// explicitly because they can be emitted solely as assets, with no JS module.
const directory = resolve(process.argv[2] || 'dist')
const root = new URL('../', import.meta.url)
const read = async path => (await readFile(new URL(path, root), 'utf8')).trim()
const entries = JSON.parse(await readFile(resolve(directory, 'third-party-licenses.json'), 'utf8'))
const supplements = JSON.parse(await read('licenses/sources.json'))
for (const name of ['shadcn', 'tailwindcss', 'tw-animate-css', '@fontsource-variable/geist', '@fullcalendar/react']) {
  const pkg = JSON.parse(await read(`node_modules/${name}/package.json`))
  if (!entries.some(entry => entry.name === name && entry.version === pkg.version)) {
    entries.push({ name, version: pkg.version, identifier: pkg.license })
  }
}
for (const entry of entries) {
  const pkgPath = `node_modules/${entry.name}`
  const pkg = JSON.parse(await read(`${pkgPath}/package.json`))
  assert.equal(pkg.version, entry.version, `Nested/version-conflicting package requires review: ${entry.name}`)
  const files = (await readdir(new URL(`${pkgPath}/`, root))).filter(file => /^(licen[cs]e|copying|notice)([.-]|$)/i.test(file)).sort()
  const texts = await Promise.all(files.map(file => read(`${pkgPath}/${file}`)))
  if (texts.length) entry.text = [...new Set(texts)].join('\n\n')
  if (!entry.text) {
    const supplement = supplements.find(source => source.packages.includes(`${entry.name}@${entry.version}`))
    assert(supplement, `Missing license text: ${entry.name}@${entry.version}. Add a reviewed, version-specific snapshot in licenses/.`)
    entry.text = await read(`licenses/${supplement.file}`)
    entry.source = supplement.url
  }
  assert(entry.identifier && entry.text, `Incomplete license notice: ${entry.name}`)
}
entries.push({ name: 'GitHub Octicons mark-github', version: 'asset', identifier: 'MIT', text: await read('licenses/github-octicons.txt'), source: 'https://github.com/primer/octicons/blob/main/icons/mark-github-16.svg' })
entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))
const header = '# Third-party notices\n\nThis distribution includes the following third-party software and assets.\nTheir original licenses apply independently of Evenform\u2019s MIT license.\nGenerated from Vite\u2019s bundled-package inventory plus explicit CSS/font inputs.\n'
const body = entries.map(entry => `\n## ${entry.name} ${entry.version} (${entry.identifier})\n\n${entry.source ? `Source: ${entry.source}\n\n` : ''}${entry.text}\n`).join('')
await writeFile(resolve(directory, 'THIRD_PARTY_NOTICES.md'), header + body)
await writeFile(resolve(directory, 'third-party-licenses.json'), JSON.stringify(entries, null, 2) + '\n')
await copyFile(new URL('LICENSE', root), resolve(directory, 'LICENSE'))
console.log(`License notices: ${entries.length} packages/assets; all include license text (${directory.split('/').at(-1)}).`)
