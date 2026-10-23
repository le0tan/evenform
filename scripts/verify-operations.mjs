import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const origin = process.env.EVENFORM_URL || 'http://127.0.0.1:4173'
const output = new URL('../evidence/operations/', import.meta.url)
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const report = { result: 'fail', matrix: [], contrast: [], errors: [] }
try {
  for (const width of [1380, 390]) for (const theme of ['light', 'dark']) for (const density of ['compact', 'comfortable']) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
    await context.addInitScript(({ theme, density }) => {
      localStorage.setItem('evenform-theme', theme)
      localStorage.setItem('evenform-tokens-v1', JSON.stringify({ density }))
      // Observe actual recipe scroll requests, without substituting browser behavior.
      window.recipeScrolls = []
      const original = Element.prototype.scrollTo
      Element.prototype.scrollTo = function (...args) {
        if (this.matches('.operations-flow, .operations-strip')) window.recipeScrolls.push(args[0])
        return original.apply(this, args)
      }
    }, { theme, density })
    const page = await context.newPage()
    page.on('pageerror', e => report.errors.push(e.message))
    await page.goto(`${origin}/#patterns/operations?anchor=example-operational-review`)
    const scope = page.getByRole('group', { name: 'Operational review example', exact: true })
    await scope.waitFor()
    const settle = () => scope.evaluate(async root => {
      getComputedStyle(root).backgroundColor
      await Promise.all(root.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {})))
    })
    await scope.locator('.operations-analysis > summary').press('Enter')
    const flow = scope.getByRole('region', { name: 'Contribution workflow' })
    const strip = scope.getByRole('region', { name: 'Readable contribution strip' })
    const comparison = scope.locator(width === 1380 ? '.operations-comparison-desktop' : '.operations-comparison-mobile')
    const row = name => width === 1380 ? comparison.getByRole('button', { name, exact: true }) : comparison.getByRole('button', { name: `Select ${name}`, exact: true })
    const heading = scope.locator('#operations-inspector-heading')
    const path = name => scope.getByRole('button', { name, exact: true })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.equal(await scope.locator('button dl, button div, button details, button button').count(), 0)
    assert.equal(await flow.locator('[data-owner]').count(), 8, 'Unique nodes, including both entry choices')
    assert.equal(await flow.getByRole('button', { name: 'Partner receipt', exact: true }).isDisabled(), true)
    assert.equal(await row('Partner receipt').isDisabled(), true)
    await flow.getByRole('button', { name: 'External delivery', exact: true }).press('Enter')
    assert.equal(await heading.innerText(), 'External delivery', 'Unknown observation still opens a real record')
    assert.equal(await scope.locator('.operations-inspector').getByText('Not available', { exact: true }).count(), 3)

    // The old <1px chart overlay is now a real minimum-width button. Click its
    // center with the pointer, then exercise keyboard and precise-list selection.
    const tiny = strip.getByRole('button', { name: 'Select Sample audit in contribution strip', exact: true })
    const tinyWidth = await tiny.evaluate(e => e.getBoundingClientRect().width)
    assert(tinyWidth >= 128, `Readable hit area: ${tinyWidth}px`)
    await tiny.click()
    assert.equal(await heading.innerText(), 'Sample audit')
    assert.equal(await row('Sample audit').getAttribute('aria-pressed'), 'true')
    assert((await tiny.innerText()).includes('<0.01%'))
    await strip.getByRole('button', { name: 'Select Source collection and normalization in contribution strip', exact: true }).press('Space')
    assert((await strip.innerText()).includes('99.8%'))
    await row('Content enrichment and verification').press('Enter')
    assert.equal(await heading.innerText(), 'Content enrichment and verification')
    await settle()
    const selectedStyle = await flow.locator('[data-owner="enrich"]').evaluate(e => {
      const s = getComputedStyle(e), probe = document.createElement('span')
      e.append(probe)
      probe.style.backgroundColor = 'var(--op-selected)'
      probe.style.borderColor = 'var(--op-tone)'
      const expected = getComputedStyle(probe)
      const result = { actualBackground: s.backgroundColor, expectedBackground: expected.backgroundColor, border: s.borderColor, expectedBorder: expected.borderColor, align: s.alignItems }
      probe.remove()
      return result
    })
    assert.equal(selectedStyle.actualBackground, selectedStyle.expectedBackground)
    assert.equal(selectedStyle.border, selectedStyle.expectedBorder)
    assert.equal(selectedStyle.align, 'stretch')
    if (width === 1380) assert.equal(await comparison.locator('tr[data-state="selected"]').evaluate(e => getComputedStyle(e).backgroundColor), selectedStyle.expectedBackground)

    // Shared node selection preserves the active path. Selecting an entry changes it.
    await path('Import path').click()
    assert.equal(await heading.innerText(), 'Content enrichment and verification')
    assert.equal(await row('Batch import').count(), 1)
    assert.equal(await comparison.getByText('Source collection and normalization', { exact: true }).count(), 0)
    assert((await path('Import path').innerText()).includes('602'))
    const contextButton = flow.getByRole('button', { name: 'Validation rules Context', exact: true })
    // A context's owner is far to the left. Selecting context must keep the
    // actual selected button visible, including while its analysis is collapsed.
    await scope.locator('.operations-analysis > summary').press('Enter')
    for (const action of ['click', 'Enter', 'Space']) {
      await flow.getByRole('button', { name: 'External delivery', exact: true }).click()
      await contextButton.scrollIntoViewIfNeeded()
      await contextButton.focus()
      const beforeContext = await flow.evaluate(e => ({ left: e.scrollLeft, top: scrollY }))
      if (action === 'click') await contextButton.click()
      else await contextButton.press(action)
      await settle()
      const afterContext = await contextButton.evaluate(e => {
        const region = e.closest('.operations-flow'), bounds = region.getBoundingClientRect(), target = e.getBoundingClientRect()
        return { left: region.scrollLeft, top: scrollY, visible: target.left >= bounds.left - 1 && target.right <= bounds.right + 1, focused: document.activeElement === e }
      })
      assert(Math.abs(afterContext.left - beforeContext.left) <= 1, `${action}: context selection must not jump to its owner`)
      assert(Math.abs(afterContext.top - beforeContext.top) <= 1, `${action}: context selection preserves vertical position`)
      assert(afterContext.visible, `${action}: selected context stays visible`)
      assert(afterContext.focused, `${action}: context retains initiating focus`)
    }
    await scope.locator('.operations-analysis > summary').press('Enter')
    const detail = comparison.locator('details')
    await page.waitForFunction(() => [...document.querySelectorAll('.operations-context')].every(e => e.open))
    await detail.locator('summary').press('Enter')
    await page.waitForFunction(() => [...document.querySelectorAll('.operations-context')].every(e => !e.open))
    const refresh = scope.getByRole('button', { name: 'Refresh sample', exact: true })
    await refresh.focus()
    const scroll = await page.evaluate(() => scrollY)
    await refresh.press('Space')
    assert.equal(await page.evaluate(() => scrollY), scroll)
    assert.equal(await refresh.evaluate(e => document.activeElement === e), true)
    assert.equal(await detail.getAttribute('open'), null, 'Same relationship preserves manual collapse')
    await refresh.press('Space')
    await page.waitForFunction(() => [...document.querySelectorAll('.operations-context')].every(e => e.open))
    assert.equal(await flow.locator('[data-owner="import"]').getAttribute('data-linked'), 'true', 'Entry resolution is scoped to the import path')
    assert.equal(await flow.locator('[data-owner="collect"]').getAttribute('data-linked'), null)
    await refresh.press('Space')
    assert.equal(await scope.locator('.operations-inspector').getByText('Owner unavailable', { exact: true }).count(), 1)
    assert.equal(await flow.locator('[data-linked]').count(), 0)
    await flow.getByRole('button', { name: 'Source collection and normalization', exact: true }).press('Enter')
    assert.equal(await path('Collection path').getAttribute('aria-pressed'), 'true')

    // Zero/unknown/rounding share one model across the strip, exact list and inspector.
    const sample = scope.getByLabel('Sample', { exact: true })
    await sample.selectOption('zero')
    assert.equal(await strip.count(), 0)
    assert((await scope.getByRole('status').innerText()).includes('Recorded total is zero'))
    assert((await comparison.innerText()).includes('—'))
    await sample.selectOption('unknown')
    assert((await scope.getByRole('status').innerText()).includes('No known observations'))
    assert.equal(await flow.getByRole('button', { name: 'Sample audit', exact: true }).isEnabled(), true)
    assert(!(await comparison.innerText()).includes('0%'))
    await sample.selectOption('rounding')
    assert((await strip.innerText()).includes('>99.99%'))
    assert((await strip.innerText()).includes('<0.01%'))
    await sample.selectOption('skewed')

    // Initial, dynamic OS, and local reduced motion: horizontal reveal is always
    // instant, retains the initiating focus, and never moves vertical reading.
    for (const motion of ['no-preference', 'reduce', 'local']) {
      await page.emulateMedia({ reducedMotion: motion === 'reduce' ? 'reduce' : 'no-preference' })
      await scope.evaluate((e, mode) => { if (mode === 'local') e.dataset.motion = 'reduce'; else delete e.dataset.motion }, motion)
      await row('Sample audit').focus()
      await strip.evaluate(e => { e.scrollLeft = 0 })
      const before = await page.evaluate(() => scrollY)
      await row('Sample audit').press('Enter')
      assert(Math.abs(await page.evaluate(() => scrollY) - before) <= 1, "Vertical position stays within one CSS pixel")
      assert.equal(await row('Sample audit').evaluate(e => document.activeElement === e), true)
      await row('Content enrichment and verification').press('Space')
      if (motion !== 'no-preference') assert(await flow.locator('[data-owner="enrich"]').evaluate(e => parseFloat(getComputedStyle(e).transitionDuration) <= 0.00001))
    }
    assert(await page.evaluate(() => recipeScrolls.length > 0 && recipeScrolls.every(request => request.behavior === 'instant')))
    await scope.getByRole('button', { name: 'Inspect selection', exact: true }).click()
    assert.equal(await heading.evaluate(e => document.activeElement === e), true)

    // Resolve actual token colors with Canvas, then composite every ancestor
    // surface and alpha badge background before measuring text contrast.
    if (density === 'compact') for (const palette of ['neutral', 'indigo', 'teal', 'rose']) {
      await page.evaluate(value => document.documentElement.dataset.palette = value, palette)
      await settle()
      const pairs = await scope.evaluate(root => {
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        const rgba = css => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data] }
        const composite = (fg, bg) => fg.slice(0, 3).map((n, i) => n * fg[3] / 255 + bg[i] * (1 - fg[3] / 255))
        const background = e => {
          const chain = []; for (let p = e; p; p = p.parentElement) chain.unshift(p)
          return chain.reduce((bg, node) => composite(rgba(getComputedStyle(node).backgroundColor), bg), [255, 255, 255])
        }
        const luminance = rgb => rgb.map(n => { n /= 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4 }).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0)
        const badge = root.querySelector('.operations-identity [data-slot="badge"]')
        const selected = root.querySelector('.operations-segment[aria-pressed="true"]')
        const category = selected.querySelector('.operations-category')
        const items = [badge, selected, category].map(e => {
          const bg = background(e), fg = composite(rgba(getComputedStyle(e).color), bg)
          const a = luminance(bg), b = luminance(fg)
          return { text: e.textContent, foreground: fg, background: bg, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) }
        })
        // A valid red status role must remain red, not inherited neutral text.
        const red = items[0].foreground
        return { items, redHue: red[0] > red[1] * 1.25 && red[0] > red[2] * 1.1, badgeAlpha: rgba(getComputedStyle(badge).backgroundColor)[3] }
      })
      assert(pairs.redHue, 'Destructive role resolves to red')
      assert(pairs.badgeAlpha > 0 && pairs.badgeAlpha < 255, 'Measure actual translucent badge')
      for (const pair of pairs.items) assert(pair.ratio >= 4.5, `${width}/${theme}/${palette}: ${pair.text}: ${pair.ratio}`)
      report.contrast.push({ width, theme, palette, ...pairs })
    }
    await page.evaluate(() => { document.documentElement.dataset.palette = 'neutral'; document.activeElement?.blur(); scrollTo(0, 0) })
    await settle()
    await page.screenshot({ fullPage: true, path: new URL(`${width}-${theme}-${density}.png`, output).pathname })
    report.matrix.push({ width, theme, density, tinyWidth, selectedStyle, selection: 'strip/list/inspector', path: 'exclusive entries and shared downstream', refresh: 'unchanged/changed/missing owner', motion: 'initial/dynamic OS/local reduce; instant horizontal reveal' })
    await context.close()
  }
  assert.deepEqual(report.errors, [])
  report.result = 'pass'
  console.log(`PASS ${report.matrix.length} operational cases; ${report.contrast.length} composited contrast cases`)
} finally {
  await writeFile(new URL('report.json', output), JSON.stringify(report, null, 2))
  await browser.close()
}
