import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const url = process.env.EVENFORM_URL || 'http://127.0.0.1:4173'
const output = new URL(process.env.EVENFORM_EVIDENCE_DIR || '../evidence/description-list/', import.meta.url)
await mkdir(output, { recursive: true })
const report = { layouts: [], propagation: {}, editor: {}, errors: [] }
async function metrics(page) {
  return page.evaluate(() => {
    const dl = document.querySelector('[data-testid="run-properties"]')
    const item = dl.firstElementChild
    const style = getComputedStyle(item)
    return {
      viewport: innerWidth, pageWidth: document.documentElement.scrollWidth,
      columns: getComputedStyle(dl).gridTemplateColumns.split(' ').length,
      itemColumns: style.gridTemplateColumns.split(' ').length,
      padding: style.paddingTop,
      labelWidth: item.querySelector('dt').getBoundingClientRect().width,
      labelColor: getComputedStyle(item.querySelector('dt')).color,
      valueColor: getComputedStyle(item.querySelector('dd')).color,
      maxOverflow: Math.max(...[...dl.querySelectorAll('dt,dd')].map(e => e.scrollWidth - e.clientWidth)),
      terms: dl.querySelectorAll(':scope > div > dt').length,
      values: dl.querySelectorAll(':scope > div > dd').length,
      tag: dl.tagName,
    }
  })
}
async function edit(page, label, value) {
  const slider = page.getByRole('slider', { name: label, exact: true })
  await slider.fill(String(value))
  await page.waitForFunction(({ label, value }) => document.querySelector(`input[aria-label="${label}"]`).value === String(value), { label, value })
}
async function openLibraryPage(page, name) {
  const link = page.getByRole('navigation', { name: 'Library navigation', exact: true }).getByRole('link', { name, exact: true })
  if (!(await link.isVisible())) {
    const group = ['Workspace', 'Settings'].includes(name) ? 'Application examples' : 'Components'
    await page.getByRole('button', { name: group, exact: true }).click()
  }
  await link.click()
}
async function openTokens(page) {
  const toggle = page.getByRole('button', { name: 'Design tokens', exact: true })
  if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click()
}
try {
  for (const [width, theme, density] of [
    [1440, 'light', 'compact'], [1440, 'dark', 'compact'],
    [1440, 'light', 'comfortable'], [1440, 'dark', 'comfortable'],
    [390, 'light', 'compact'], [390, 'dark', 'comfortable'],
  ]) {
    const ctx = await browser.newContext({ viewport: { width, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] })
    await ctx.addInitScript(({ theme, density }) => {
      if (!localStorage.getItem('description-test')) {
        localStorage.setItem('evenform-theme', theme)
        localStorage.setItem('evenform-tokens-v1', JSON.stringify({ density, overrides: {} }))
        localStorage.setItem('description-test', '1')
      }
    }, { theme, density })
    const page = await ctx.newPage()
    page.on('pageerror', error => report.errors.push(error.message))
    await page.goto(`${url}/#components/compose`)
    await page.getByRole('heading', { name: 'Run details', exact: true }).waitFor()
    await page.evaluate(() => document.fonts.ready)
    const result = await metrics(page)
    assert.equal(result.pageWidth, width)
    assert.equal(result.columns, width === 390 ? 1 : 2)
    assert.equal(result.itemColumns, width === 390 ? 1 : 2)
    assert.equal(result.padding, density === 'compact' ? '8px' : '12px')
    if (width !== 390) assert.equal(result.labelWidth, 128)
    assert.equal(result.terms, 10); assert.equal(result.values, 10)
    assert.equal(result.tag, 'DL'); assert.notEqual(result.labelColor, result.valueColor)
    assert(result.maxOverflow <= 1)
    const divided = await page.getByTestId('review-properties').locator('[data-slot=description-item]').first().evaluate(e => getComputedStyle(e).borderBottomWidth)
    assert.equal(divided, '1px')
    await page.getByRole('region', { name: 'Run details', exact: true }).screenshot({ path: new URL(`${width}-${theme}-${density}.png`, output).pathname, animations: 'disabled', style: '.app-shell-header { position: static !important; }' })
    if (width === 1440 && theme === 'dark' && density === 'compact') {
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({ path: new URL('components-context.png', output).pathname, fullPage: true, animations: 'disabled' })
    }
    report.layouts.push({ theme, density, ...result, divided })

    if (width === 1440 && theme === 'light' && density === 'compact') {
      await openTokens(page)
      // Real controls: no TS copy of the CSS default values.
      await page.locator('.advanced-tokens > summary').click()
      await page.locator('.advanced-token-group > summary').filter({ hasText: /^Data$/ }).click()
      assert.equal(await page.getByRole('slider', { name: 'Property vertical padding', exact: true }).inputValue(), '8')
      await edit(page, 'Property vertical padding', 18)
      await edit(page, 'Property label width', 152)
      const edited = await metrics(page)
      assert.equal(edited.padding, '18px'); assert.equal(edited.labelWidth, 152)
      const reviewPadding = await page.getByTestId('review-properties').locator('[data-slot=description-item]').first().evaluate(e => getComputedStyle(e).paddingTop)
      assert.equal(reviewPadding, '18px')
      await page.getByRole('button', { name: 'Copy token overrides', exact: true }).click()
      const css = await page.evaluate(() => navigator.clipboard.readText())
      assert(css.includes('--ds-description-item-padding-y: 18px'))
      assert(css.includes('--ds-description-label-width: 152px'))
      report.editor.css = css
      await page.reload(); await openTokens(page); await page.getByTestId('run-properties').waitFor()
      assert.equal((await metrics(page)).padding, '18px')
      report.editor.persisted = true
      // A local component variable changes all its children. A utility can deliberately opt out.
      const local = await page.getByTestId('run-properties').evaluate(dl => {
        dl.style.setProperty('--ds-description-padding-y', '16px')
        dl.firstElementChild.classList.add('py-0')
        return [...dl.children].slice(0, 2).map(e => getComputedStyle(e).paddingTop)
      })
      assert.deepEqual(local, ['0px', '16px']); report.propagation.localAndUtility = local
      await page.getByTestId('run-properties').evaluate(dl => { dl.style.removeProperty('--ds-description-padding-y'); dl.firstElementChild.classList.remove('py-0') })
      await openLibraryPage(page, 'Workspace')
      await page.getByRole('button', { name: 'Open Website refresh', exact: true }).click()
      const sheet = page.getByRole('dialog')
      await sheet.getByLabel('Project details', { exact: true }).waitFor()
      const sheetMetrics = await sheet.locator('[data-slot=description-item]').first().evaluate(e => ({ padding: getComputedStyle(e).paddingTop, columns: getComputedStyle(e).gridTemplateColumns.split(' ').length }))
      assert.equal(sheetMetrics.padding, '18px'); assert.equal(sheetMetrics.columns, 1)
      await sheet.screenshot({ path: new URL('workspace-sheet.png', output).pathname, animations: 'disabled' })
      report.propagation = { ...report.propagation, gallery: edited.padding, review: reviewPadding, sheet: sheetMetrics }
      await page.keyboard.press('Escape')
      await sheet.waitFor({ state: 'hidden' })
      await page.getByRole('button', { name: 'Reset to Evenform defaults', exact: true }).click()
      await openLibraryPage(page, 'Core controls')
      await openLibraryPage(page, 'In context')
      await page.getByTestId('run-properties').waitFor()
      assert.equal((await metrics(page)).padding, '8px')
      report.editor.reset = true
    }
    await ctx.close()
  }
  assert.deepEqual(report.errors, [])
  await writeFile(new URL('verification.json', output), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} finally { await browser.close() }
