import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createThemePalette, contrast, normalizeHex } from '../src/lib/theme-palette.ts'

// Resolve the committed achromatic OKLCH primitives independently of the DOM.
const css = await readFile(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
function neutral(step) {
  const lightness = Number(css.match(new RegExp(`--ds-neutral-${step}: oklch\\(([^ ]+) 0 0\\)`))[1])
  const linear = lightness ** 3
  const srgb = linear <= .0031308 ? linear * 12.92 : 1.055 * linear ** (1 / 2.4) - .055
  const channel = Math.round(srgb * 255).toString(16).padStart(2, '0')
  return `#${channel.repeat(3)}`
}
const surfaces = { seed: '#4f46e5', light: [0, 50, 100].map(neutral), dark: [950, 900, 800].map(neutral) }
assert.equal(contrast('#000000', '#ffffff'), 21)
assert.equal(contrast('#ffffff', '#ffffff'), 1)
assert.equal(normalizeHex('#aBc'), '#aabbcc')
assert.equal(normalizeHex('not a color'), null)
const blendHalf = (a, b) => '#' + [1, 3, 5].map(i => Math.round((parseInt(a.slice(i, i + 2), 16) + parseInt(b.slice(i, i + 2), 16)) / 2).toString(16).padStart(2, '0')).join('')
let random = 61619
const seeds = ['#ffffff', '#000000', '#ffff00', '#00ff00', '#0000ff', '#ff0000', '#00ffff', '#ff00ff', '#888888', '#fffefe', '#010101', '#ff8800']
for (let i = 0; i < 1200; i++) { random = (Math.imul(random, 1664525) + 1013904223) >>> 0; seeds.push('#' + (random & 0xffffff).toString(16).padStart(6, '0')) }
const minimum = { text: 21, accent: 21, hover: 21, focus: 21 }
for (const seed of seeds) {
  const palette = createThemePalette(seed, surfaces)
  assert.equal(Object.keys(palette.shades).length, 11)
  assert.equal(Object.values(palette.variables).every(color => /^#[0-9a-f]{6}$/.test(color)), true)
  for (const mode of ['light', 'dark']) {
    const roles = palette[mode]
    const text = contrast(roles.primary, roles.foreground), accent = contrast(roles.accent, roles['accent-foreground']), hover = contrast(roles.hover, roles.foreground)
    assert(text >= 4.5 && accent >= 4.5 && hover >= 4.5, `${seed} ${mode} text`)
    for (const background of [...surfaces[mode], roles.accent]) {
      const focus = contrast(blendHalf(background, roles.ring), background)
      assert(focus >= 3, `${seed} ${mode} focus on ${background}`)
      minimum.focus = Math.min(minimum.focus, focus)
    }
    minimum.text = Math.min(minimum.text, text); minimum.accent = Math.min(minimum.accent, accent); minimum.hover = Math.min(minimum.hover, hover)
  }
}
console.log(JSON.stringify({ seeds: seeds.length, themes: seeds.length * 2, minimum, result: 'pass' }, null, 2))
