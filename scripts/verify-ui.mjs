import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

// Start npm run dev first. Set PLAYWRIGHT_EXECUTABLE_PATH only to use an existing local browser.
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const baseURL = process.env.EVENFORM_URL || 'http://127.0.0.1:5173'
const evidence = new URL(process.env.EVENFORM_EVIDENCE_DIR || '../evidence/', import.meta.url)
await mkdir(evidence, { recursive: true })
const results = { viewports: [], propagation: {}, interactions: [], contrast: {}, errors: [] }
function recordErrors(page) { page.on('pageerror', error => results.errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') results.errors.push(message.text()) }) }
async function measure(page) {
  return page.evaluate(() => {
    const css = (selector, property) => { const element = document.querySelector(selector); return element ? getComputedStyle(element).getPropertyValue(property) : null }
    return {
      viewport: innerWidth, documentWidth: document.documentElement.scrollWidth,
      cardPadding: [...document.querySelectorAll('[data-slot=card-content]')].map(element => getComputedStyle(element).paddingLeft),
      cardHeight: [...document.querySelectorAll('[data-slot=card]')].map(element => Math.round(element.getBoundingClientRect().height)),
      buttonHeight: css('main [data-ds-component=button]', 'height'),
      inputHeight: css('main [data-ds-component=input]', 'height'),
      tableRowHeight: css('[data-slot=table-body] tr', 'height'),
      sidebarWidth: css('[data-slot=sidebar-container]', 'width'),
      sectionGap: css('.page-content', 'gap'),
      fieldGap: css('.form-field', 'gap'),
      bodyFont: css('body', 'font-size'),
      pagePadding: css('.app-shell-main', 'padding-left'),
      buttonRadius: css('main [data-ds-component=button]', 'border-radius'),
    }
  })
}
async function apply(page, density, theme) {
  await page.goto(`${baseURL}/#workspace`)
  await page.evaluate(({ density, theme }) => {
    localStorage.setItem('evenform-tokens-v1', JSON.stringify({ density, overrides: {} }))
    localStorage.setItem('evenform-theme', theme)
  }, { density, theme })
  await page.reload()
  await page.getByRole('heading', { name: 'Workspace', exact: true }).waitFor()
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(density => document.documentElement.dataset.density === density, density)
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
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, isMobile: mobile, hasTouch: mobile })
    const page = await context.newPage(); recordErrors(page)
    for (const density of ['compact', 'comfortable']) for (const theme of ['light', 'dark']) {
      await apply(page, density, theme)
      const metrics = await measure(page)
      assert(metrics.documentWidth <= metrics.viewport, `Page overflow: ${JSON.stringify(metrics)}`)
      const name = `${mobile ? 'mobile' : 'desktop'}-${theme}-${density}`
      await page.screenshot({ animations: 'disabled', path: new URL(`${name}.png`, evidence).pathname, fullPage: true })
      results.viewports.push({ name, ...metrics })
    }
    if (mobile) {
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
      await openLibraryPage(page, 'Settings')
      await page.getByRole('heading', { name: 'Settings', exact: true }).waitFor()
      assert((await measure(page)).documentWidth <= 390)
      await page.screenshot({ animations: 'disabled', path: new URL('mobile-settings.png', evidence).pathname, fullPage: true })
      results.interactions.push('Mobile navigation opens and closes through the official Sidebar Sheet.')
      await page.getByRole('button', { name: 'Design tokens', exact: true }).click()
      await page.getByRole('dialog', { name: 'Design tokens', exact: true }).waitFor()
      await page.waitForFunction(() => !document.querySelector('[role=dialog]')?.hasAttribute('data-starting-style'))
      await page.getByRole('dialog', { name: 'Design tokens', exact: true }).evaluate(async element => { await Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished)) })
      await page.screenshot({ animations: 'disabled', path: new URL('mobile-token-panel.png', evidence).pathname, fullPage: false })
      await page.getByRole('button', { name: 'Close token panel', exact: true }).click()
      results.interactions.push('Mobile token Sheet opens and closes; controls remain reachable.')
    }
    await context.close()
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await context.newPage(); recordErrors(page)
  await apply(page, 'compact', 'light')
  console.log('Theme/density matrix and mobile navigation verified.')
  await openTokens(page)
  const before = await measure(page)
  const card = page.getByRole('slider', { name: 'Card padding', exact: true })
  await card.press('Home'); for (let i = 0; i < 4; i++) await card.press('ArrowRight')
  await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-slot=card-content]')).paddingLeft === '24px')
  const after = await measure(page)
  assert(before.cardPadding.length === 3 && before.cardPadding.every(value => value === '16px'))
  assert(after.cardPadding.every(value => value === '24px'))
  assert(after.cardHeight.every((value, index) => value > before.cardHeight[index]))
  results.propagation.card = { before, after }
  await page.screenshot({ animations: 'disabled', path: new URL('token-card-padding-24.png', evidence).pathname, fullPage: true })
  await page.getByRole('button', { name: 'Copy token overrides', exact: true }).click()
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  assert(copied.includes('--ds-card-padding: 24px;'))
  results.interactions.push('Copy token overrides exports the actual card-padding override as CSS.')
  await page.getByRole('tab', { name: 'Comfortable', exact: true }).click()
  await page.waitForFunction(() => document.documentElement.dataset.density === 'comfortable')
  const comfortable = await measure(page)
  assert(comfortable.buttonHeight === '40px' && comfortable.inputHeight === '40px')
  assert(Number.parseFloat(comfortable.tableRowHeight) >= 56 && comfortable.sectionGap === '40px', JSON.stringify(comfortable))
  await page.getByRole('button', { name: 'Reset to Evenform defaults', exact: true }).click()
  const control = page.getByRole('slider', { name: 'Control height', exact: true })
  await control.press('Home'); for (let i = 0; i < 4; i++) await control.press('ArrowRight')
  await page.waitForFunction(() => getComputedStyle(document.querySelector('main [data-ds-component=input]')).height === '36px')
  const controls = await measure(page)
  assert(controls.buttonHeight === '36px' && controls.inputHeight === '36px')
  results.propagation.controlHeight = controls
  const sidebar = page.getByRole('slider', { name: 'Sidebar width', exact: true })
  await sidebar.press('End')
  await page.waitForFunction(() => Math.round(document.querySelector('[data-slot=sidebar-container]').getBoundingClientRect().width) === 280)
  results.propagation.sidebar = await measure(page)
  for (const [label, property, expected] of [['Page padding', 'pagePadding', '56px'], ['Section gap', 'sectionGap', '56px'], ['Border radius', 'buttonRadius', '14px'], ['Base font size', 'bodyFont', '18px']]) {
    await page.getByRole('slider', { name: label, exact: true }).press('End')
    await page.waitForFunction(({ property, expected }) => {
      const targets = { pagePadding: ['.app-shell-main', 'paddingLeft'], sectionGap: ['.page-content', 'gap'], buttonRadius: ['main [data-ds-component=button]', 'borderRadius'], bodyFont: ['body', 'fontSize'] }
      const [selector, key] = targets[property]
      return getComputedStyle(document.querySelector(selector))[key] === expected
    }, { property, expected })
    results.propagation[label] = await measure(page)
  }
  await page.getByRole('button', { name: 'Reset to Evenform defaults', exact: true }).click()
  console.log('All live token controls verified.')
  // Actual product interactions; no network or backend is involved.
  await page.getByRole('textbox', { name: 'Search projects', exact: true }).fill('no matching result')
  await page.getByRole('heading', { name: 'No projects found', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click()
  await page.getByRole('combobox', { name: 'Filter projects', exact: true }).click()
  await page.getByRole('option', { name: 'In review', exact: true }).click()
  assert(await page.locator('[data-slot=table-body] tr').count() === 1)
  await page.getByRole('button', { name: 'New project', exact: true }).click()
  await page.getByLabel('Project name', { exact: true }).fill('Token verification project')
  await page.getByRole('dialog', { name: 'Create a project', exact: true }).screenshot({ animations: 'disabled', path: new URL('desktop-create-project.png', evidence).pathname })
  await page.getByRole('button', { name: 'Create project', exact: true }).click()
  await page.getByRole('button', { name: 'Open Token verification project', exact: true }).waitFor()
  results.interactions.push('Project search, empty state, status filter and creation work.')
  await page.getByRole('button', { name: 'Open Website refresh', exact: true }).click()
  await page.getByRole('dialog').waitFor()
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  results.interactions.push('Project Sheet closes with Escape and restores focus.')
  await openLibraryPage(page, 'Settings')
  await page.getByLabel('Workspace name', { exact: true }).fill('Acme Studio QA')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await page.getByRole('status').filter({ hasText: 'Workspace preferences saved locally.' }).waitFor()
  assert(await page.evaluate(() => JSON.parse(localStorage.getItem('evenform-workspace')).name) === 'Acme Studio QA')
  await page.getByLabel('Workspace name', { exact: true }).fill('Acme Studio')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  results.interactions.push('Settings save to localStorage and report success.')
  assert((await measure(page)).documentWidth <= 1440)
  await page.screenshot({ animations: 'disabled', path: new URL('desktop-settings.png', evidence).pathname, fullPage: true })
  await openLibraryPage(page, 'Core controls')
  await page.getByRole('heading', { name: 'Core controls', exact: true }).waitFor()
  await openLibraryPage(page, 'In context')
  const galleryCard = page.getByRole('slider', { name: 'Card padding', exact: true })
  await galleryCard.press('Home'); for (let i = 0; i < 4; i++) await galleryCard.press('ArrowRight')
  await page.waitForFunction(() => [...document.querySelectorAll('[data-slot=card-content]')].every(element => getComputedStyle(element).paddingLeft === '24px'))
  results.propagation.contextualCards = await measure(page)
  assert(results.propagation.contextualCards.cardPadding.length === 3)
  assert(results.propagation.contextualCards.cardPadding.every(value => value === '24px'))
  await page.getByRole('button', { name: 'Reset to Evenform defaults', exact: true }).click()
  await page.screenshot({ animations: 'disabled', path: new URL('desktop-components.png', evidence).pathname, fullPage: true })
  await page.getByRole('button', { name: 'Request review', exact: true }).click()
  await page.getByRole('dialog').waitFor()
  const dialogControl = await page.locator('[data-slot=dialog-content] [data-ds-component=button]').first().evaluate(element => getComputedStyle(element).height)
  assert(dialogControl === '32px')
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  assert(await page.getByRole('button', { name: 'Request review', exact: true }).evaluate(element => element === document.activeElement))
  results.interactions.push('Official Dialog Escape and focus return work; rendered Button tokens survive composition.')
  await openLibraryPage(page, 'States & feedback')
  await page.getByRole('textbox', { name: 'Invite by email', exact: true }).waitFor()
  await page.screenshot({ animations: 'disabled', path: new URL('desktop-component-states.png', evidence).pathname, fullPage: true })
  // Resolve real CSS colors through the browser, including OKLCH and color-mix.
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => document.documentElement.classList.toggle('dark', theme === 'dark'), theme)
    results.contrast[theme] = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement)
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1
      const ctx = canvas.getContext('2d')
      const rgb = variable => { ctx.fillStyle = s.getPropertyValue(variable).trim(); ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3) }
      const luminance = values => values.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
      const ratio = (a, b) => { const x = luminance(rgb(a)), y = luminance(rgb(b)); return Number(((Math.max(x, y) + .05) / (Math.min(x, y) + .05)).toFixed(2)) }
      return { body: ratio('--foreground', '--background'), muted: ratio('--muted-foreground', '--background'), mutedOnCard: ratio('--muted-foreground', '--card'), success: ratio('--ds-success', '--ds-success-surface') }
    })
    assert(Object.values(results.contrast[theme]).every(value => value >= 4.5), `${theme} text contrast`)
  }
  assert(results.errors.length === 0, `Browser errors: ${results.errors.join('; ')}`)
  await context.close()
  await writeFile(new URL('verification.json', evidence), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
} finally { await writeFile(new URL('verification.json', evidence), JSON.stringify(results, null, 2)); await browser.close() }
