import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const baseURL = process.env.EVENFORM_URL || 'http://127.0.0.1:5173'
const evidence = new URL(process.env.EVENFORM_EVIDENCE_DIR || '../evidence/library-navigation/', import.meta.url)
await mkdir(evidence, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const report = { cases: [], errors: [] }

try {
  for (const mobile of [false, true]) for (const theme of ['light', 'dark']) for (const density of ['compact', 'comfortable']) {
    const name = `${mobile ? 'mobile' : 'desktop'}-${theme}-${density}`
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce',
    })
    await context.addInitScript(({ theme, density }) => {
      localStorage.setItem('evenform-theme', theme)
      localStorage.setItem('evenform-tokens-v1', JSON.stringify({ density, palette: 'indigo', overrides: {} }))
    }, { theme, density })
    const page = await context.newPage()
    page.on('pageerror', error => report.errors.push(`${name}: ${error.message}`))
    page.on('console', message => { if (message.type() === 'error') report.errors.push(`${name}: ${message.text()}`) })
    await page.goto(`${baseURL}/#components/catalog`)
    await page.getByRole('heading', { name: 'Core controls', exact: true }).waitFor()
    if (mobile) await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
    const navigation = page.getByRole('navigation', { name: 'Library navigation', exact: true })
    assert.equal(await navigation.getByRole('link', { name: 'Core controls', exact: true }).getAttribute('aria-current'), 'page')
    await page.screenshot({ path: new URL(`${name}-navigation.png`, evidence).pathname })
    await page.locator('.showcase-library-search').click()
    const dialog = page.getByRole('dialog', { name: 'Search library', exact: true })
    const input = dialog.getByRole('combobox')
    await input.fill('appearance')
    const appearance = dialog.getByRole('option').filter({ hasText: 'Appearance lab' })
    await appearance.waitFor()
    assert.equal(await appearance.getAttribute('aria-selected'), 'true')
    const bounds = await dialog.boundingBox()
    assert(bounds.x >= 0 && bounds.x + bounds.width <= page.viewportSize().width, `${name}: dialog overflows`)
    await page.screenshot({ path: new URL(`${name}-search.png`, evidence).pathname })
    await input.press('Enter')
    await page.getByRole('heading', { name: 'Appearance lab', exact: true }).waitFor()
    await dialog.waitFor({ state: 'hidden' })
    await page.waitForFunction(() => document.activeElement?.id === 'main-content')
    if (mobile) await navigation.waitFor({ state: 'hidden' })

    // A failed search must not leave stray unfiltered links inside the listbox.
    await page.getByRole('button', { name: 'Search library', exact: true }).click()
    await input.fill('no-such-component-4b63')
    await dialog.getByText('No results found', { exact: true }).waitFor()
    assert.equal(await dialog.getByRole('option').count(), 0)
    assert.equal(await dialog.getByRole('link').count(), 0)
    await dialog.getByRole('button', { name: 'Clear', exact: true }).click()
    assert.equal(await input.inputValue(), '')
    assert(await input.evaluate(element => element === document.activeElement))
    await input.press('Escape')
    await dialog.waitFor({ state: 'hidden' })
    await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Search library')
    report.cases.push({ name, appearanceKeyboardNavigation: 'pass', focusTransfer: 'pass', emptyStateAndClear: 'pass', escapeFocusReturn: 'pass' })
    await context.close()
  }
  assert.equal(report.cases.length, 8)
  assert.deepEqual(report.errors, [])
  console.log(JSON.stringify(report, null, 2))
} finally {
  await writeFile(new URL('verification.json', evidence), JSON.stringify(report, null, 2))
  await browser.close()
}
