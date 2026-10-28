import { chromium } from 'playwright'
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const url = process.env.EVENFORM_URL || 'http://127.0.0.1:4173'
const output = new URL(process.env.EVENFORM_EVIDENCE_DIR || '../evidence/refinements/', import.meta.url)
await mkdir(output, { recursive: true })
const report = { startup: {}, cascade: {}, density: {}, advanced: {}, starter: {}, errors: [] }
async function context(options = {}, preferences = { theme: 'light', density: 'compact', overrides: {} }) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'], ...options })
  await ctx.addInitScript(prefs => {
    if (!localStorage.getItem('evenform-test-seeded')) {
      localStorage.setItem('evenform-theme', prefs.theme)
      localStorage.setItem('evenform-tokens-v1', JSON.stringify({ density: prefs.density, overrides: prefs.overrides }))
      localStorage.setItem('evenform-test-seeded', 'yes')
    }
  }, preferences)
  return ctx
}
function errors(page) {
  page.on('pageerror', error => report.errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()) })
}
async function shot(page, name, fullPage = true) { await page.screenshot({ path: new URL(`${name}.png`, output).pathname, fullPage, animations: 'disabled' }) }
async function metrics(page) {
  return page.evaluate(() => {
    const value = (selector, property) => { const e = document.querySelector(selector); return e ? getComputedStyle(e)[property] : null }
    return { viewport: innerWidth, width: document.documentElement.scrollWidth, card: [...document.querySelectorAll('[data-slot=card-content]')].map(e => getComputedStyle(e).paddingLeft), input: value('main [data-ds-component=input]', 'height'), button: value('main [data-ds-component=button]', 'height'), row: value('[data-slot=table-body] tr', 'height'), cellX: value('[data-slot=table-cell]', 'paddingLeft'), cellY: value('[data-slot=table-cell]', 'paddingTop'), field: value('.form-field', 'gap'), form: value('.form-stack', 'gap'), header: value('.app-shell-header', 'height') }
  })
}
async function waitPage(page, name) { await page.getByRole('heading', { name, exact: true }).waitFor(); await page.evaluate(() => document.fonts.ready) }
async function setSlider(page, label, value) {
  const slider = page.getByRole('slider', { name: label, exact: true })
  await slider.evaluate((element, number) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(element, String(number)); element.dispatchEvent(new Event('input', { bubbles: true })); element.dispatchEvent(new Event('change', { bubbles: true })) }, value)
  await page.waitForFunction(({ label, value }) => Number(document.querySelector(`input[aria-label="${label}"]`).value) === value, { label, value })
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
  // Hold the React entry: saved preferences must already be applied by the head bootstrap.
  const bootContext = await context({ colorScheme: 'dark' }, { theme: 'system', density: 'comfortable', overrides: { '--ds-card-padding': '28px', '--ds-line-height-body': '1.7' } })
  const boot = await bootContext.newPage()
  await boot.route('**/assets/showcase-*.js', route => route.fulfill({ contentType: 'application/javascript', body: '// React entry deliberately held.' }))
  await boot.goto(url)
  report.startup.beforeReact = await boot.evaluate(() => ({ theme: document.documentElement.className, density: document.documentElement.dataset.density, card: getComputedStyle(document.documentElement).getPropertyValue('--ds-card-padding').trim(), leading: getComputedStyle(document.documentElement).getPropertyValue('--ds-line-height-body').trim(), reactChildren: document.getElementById('root').childElementCount }))
  assert.equal(report.startup.beforeReact.reactChildren, 0)
  assert(report.startup.beforeReact.theme.includes('dark'))
  assert.equal(report.startup.beforeReact.density, 'comfortable')
  assert.equal(report.startup.beforeReact.card, '28px')
  assert.equal(report.startup.beforeReact.leading, '1.7')
  await bootContext.close()

  const ctx = await context({ colorScheme: 'dark' }, { theme: 'system', density: 'compact', overrides: {} })
  const page = await ctx.newPage(); errors(page)
  await page.goto(`${url}/#workspace`); await waitPage(page, 'Workspace')
  await page.getByRole('button', { name: 'Switch to light theme', exact: true }).waitFor()
  await page.emulateMedia({ colorScheme: 'light' })
  await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).waitFor()
  assert(await page.locator('html').evaluate(e => e.classList.contains('light')))
  await page.keyboard.press('d')
  assert.equal(await page.evaluate(() => localStorage.getItem('evenform-theme')), 'system')
  assert(await page.locator('html').evaluate(e => e.classList.contains('light')))
  report.startup.systemSubscription = 'OS change updated both root theme and toggle accessible name; d did not change theme.'

  // Two representative theme/density pairs, rather than every possible combination.
  for (const [density, theme] of [['compact', 'light'], ['comfortable', 'dark']]) {
    await page.evaluate(({ density, theme }) => { localStorage.setItem('evenform-theme', theme); localStorage.setItem('evenform-tokens-v1', JSON.stringify({ density, overrides: {} })) }, { density, theme })
    await page.goto(`${url}/#workspace`)
    // Hash navigation keeps React mounted; reload to restore the seeded preferences.
    await page.reload(); await waitPage(page, 'Workspace')
    const workspace = await metrics(page)
    assert.equal(workspace.width, workspace.viewport)
    assert.equal(workspace.button, density === 'compact' ? '32px' : '40px')
    assert.equal(workspace.input, density === 'compact' ? '32px' : '40px')
    assert.equal(workspace.cellY, density === 'compact' ? '8px' : '12px')
    assert.equal(workspace.cellX, density === 'compact' ? '12px' : '16px')
    await shot(page, `workspace-${theme}-${density}`)
    await page.getByRole('combobox', { name: 'Filter projects', exact: true }).click()
    await page.locator('[data-slot="select-content"]').evaluate(async element => {
      await Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {})))
    })
    const option = await page.getByRole('option', { name: 'In review', exact: true }).evaluate(e => ({ height: e.getBoundingClientRect().height, y: getComputedStyle(e).paddingTop, x: getComputedStyle(e).paddingLeft }))
    assert.equal(option.height, density === 'compact' ? 32 : 40)
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'New project', exact: true }).click()
    const dialog = await page.getByRole('dialog', { name: 'Create a project', exact: true }).evaluate(e => ({ padding: getComputedStyle(e).paddingTop, gap: getComputedStyle(e).gap, form: getComputedStyle(e.querySelector('form')).gap, field: getComputedStyle(e.querySelector('.form-field')).gap }))
    assert.equal(dialog.padding, density === 'compact' ? '24px' : '32px')
    assert.equal(dialog.field, density === 'compact' ? '8px' : '12px')
    assert.equal(dialog.form, density === 'compact' ? '20px' : '24px')
    // Focus is visible, stays inside the dialog through Tab, then returns on Escape.
    const input = page.getByRole('textbox', { name: 'Project name', exact: true })
    await input.focus(); assert(await input.evaluate(e => e.matches(':focus-visible') && getComputedStyle(e).boxShadow !== 'none'))
    await page.keyboard.press('Tab')
    assert(await page.getByRole('dialog').evaluate(e => e.contains(document.activeElement)))
    await page.getByRole('dialog').screenshot({ path: new URL(`dialog-${density}.png`, output).pathname, animations: 'disabled' })
    await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    await page.waitForFunction(() => document.activeElement?.textContent.includes('New project'))
    await page.getByRole('button', { name: 'Open Website refresh', exact: true }).click()
    const sheet = await page.getByRole('dialog').evaluate(e => ({ inset: getComputedStyle(e).paddingTop, body: getComputedStyle(e.querySelector('[data-slot=sheet-body]')).paddingLeft, header: getComputedStyle(e.querySelector('[data-slot=sheet-header]')).paddingLeft }))
    assert.equal(sheet.body, sheet.header)
    assert.equal(sheet.body, density === 'compact' ? '24px' : '32px')
    await page.keyboard.press('Escape')
    await openLibraryPage(page, 'Settings'); await waitPage(page, 'Settings')
    const settings = await metrics(page)
    assert.equal(settings.width, settings.viewport)
    assert.equal(settings.field, density === 'compact' ? '8px' : '12px')
    await shot(page, `settings-${theme}-${density}`)
    await openLibraryPage(page, 'Core controls'); await waitPage(page, 'Core controls')
    await shot(page, `components-${theme}-${density}`)
    report.density[density] = { workspace, option, dialog, sheet, settings }
  }

  await openLibraryPage(page, 'Local overrides')
  for (const [id, height] of [['cascade-default', '40px'], ['cascade-token', '44px'], ['cascade-utility', '48px'], ['cascade-both', '48px'], ['cascade-inline', '52px']]) {
    report.cascade[id] = await page.getByTestId(id).evaluate(e => getComputedStyle(e).height)
    assert.equal(report.cascade[id], height)
  }
  report.cascade.cardToken = await page.getByTestId('cascade-card').evaluate(e => [...e.querySelectorAll('[data-slot=card-header], [data-slot=card-content]')].map(child => getComputedStyle(child).paddingLeft))
  assert.deepEqual(report.cascade.cardToken, ['24px', '24px'])
  report.cascade.cardUtility = await page.getByTestId('cascade-card-content').evaluate(e => getComputedStyle(e).paddingLeft)
  assert.equal(report.cascade.cardUtility, '32px')
  await shot(page, 'override-contract')

  // Advanced editor defaults resolve CSS calc(), metadata contains no default values.
  await openTokens(page)
  assert.equal(await page.locator('.token-panel-inner > .token-controls input').count(), 7)
  await page.getByText('Advanced tokens', { exact: true }).click()
  for (const label of ['Layout', 'Controls', 'Forms', 'Data', 'Overlays', 'Typography']) await page.locator('.advanced-token-group').getByText(label, { exact: true }).click()
  assert.equal(await page.getByRole('slider', { name: 'Page title size', exact: true }).inputValue(), '28')
  await setSlider(page, 'Card padding', 28)
  await setSlider(page, 'Field label gap', 14)
  await setSlider(page, 'Dialog padding', 36)
  await setSlider(page, 'Sheet content padding', 28)
  await setSlider(page, 'Body line height', 1.7)
  await setSlider(page, 'Table cell vertical padding', 16)
  await page.getByRole('button', { name: 'Copy token overrides', exact: true }).click()
  const css = await page.evaluate(() => navigator.clipboard.readText())
  assert(css.includes('--ds-line-height-body: 1.7;') && !css.includes('1.7px'))
  await page.reload(); await waitPage(page, 'Local overrides'); await openTokens(page)
  assert.equal(await page.locator('html').evaluate(e => e.style.getPropertyValue('--ds-line-height-body')), '1.7')
  await openLibraryPage(page, 'Workspace'); await waitPage(page, 'Workspace')
  report.advanced.applied = await metrics(page)
  assert(report.advanced.applied.card.every(value => value === '28px'))
  assert.equal(report.advanced.applied.cellY, '16px')
  // Exported CSS is reused in the independent starter entry, without the editor hook.
  const adopted = await ctx.newPage(); errors(adopted)
  await adopted.goto(`${url}/starter.html`); await waitPage(adopted, 'Workspace')
  await adopted.evaluate(() => { document.documentElement.dataset.density = 'comfortable' })
  await adopted.addStyleTag({ content: css })
  report.advanced.exportedCSS = await adopted.evaluate(() => ({ leading: getComputedStyle(document.body).lineHeight, card: getComputedStyle(document.documentElement).getPropertyValue('--ds-card-padding').trim(), field: getComputedStyle(document.documentElement).getPropertyValue('--ds-form-field-gap').trim(), overlay: getComputedStyle(document.documentElement).getPropertyValue('--ds-dialog-padding').trim() }))
  assert.equal(report.advanced.exportedCSS.card, '28px')
  assert.equal(report.advanced.exportedCSS.field, '14px')
  assert.equal(report.advanced.exportedCSS.overlay, '36px')
  assert.equal(report.advanced.exportedCSS.leading, '23.8px')
  report.advanced.css = css
  await adopted.close()
  await page.getByRole('button', { name: 'Reset to Evenform defaults', exact: true }).click()
  assert(await page.locator('html').evaluate(e => e.dataset.density === 'compact' && e.style.getPropertyValue('--ds-card-padding') === '' && e.style.getPropertyValue('--ds-line-height-body') === ''))
  await ctx.close()

  const mobileCtx = await context({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, { theme: 'dark', density: 'comfortable', overrides: {} })
  const mobile = await mobileCtx.newPage(); errors(mobile)
  await mobile.goto(`${url}/#workspace`); await waitPage(mobile, 'Workspace')
  assert.equal((await metrics(mobile)).width, 390)
  await mobile.getByRole('combobox', { name: 'Filter projects', exact: true }).click()
  await mobile.locator('[data-slot="select-content"]').evaluate(async element => {
    await Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {})))
  })
  assert((await mobile.getByRole('option', { name: 'In review', exact: true }).evaluate(e => e.getBoundingClientRect().height)) >= 44)
  await mobile.keyboard.press('Escape')
  await mobile.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await openLibraryPage(mobile, 'Settings'); await waitPage(mobile, 'Settings')
  await shot(mobile, 'mobile-settings')
  await mobile.getByRole('button', { name: 'Design tokens', exact: true }).click()
  await mobile.getByRole('dialog', { name: 'Design tokens', exact: true }).waitFor()
  const body = await mobile.locator('[data-slot=sheet-body]').evaluate(e => ({ padding: getComputedStyle(e).paddingLeft, scroll: getComputedStyle(e).overflowY, height: e.clientHeight, content: e.scrollHeight }))
  assert.equal(body.padding, '0px'); assert.equal(body.scroll, 'auto'); assert(body.content > body.height)
  await mobile.getByText('Advanced tokens', { exact: true }).click()
  await mobile.getByRole('button', { name: 'Copy token overrides', exact: true }).scrollIntoViewIfNeeded()
  await shot(mobile, 'mobile-token-panel', false)
  report.advanced.mobileScroll = body
  await mobileCtx.close()

  // Isolated production entry: network and emitted code must not include Showcase.
  const starterContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const starter = await starterContext.newPage(); errors(starter)
  const requests = []; starter.on('request', req => requests.push(req.url()))
  await starter.goto(`${url}/starter.html`); await waitPage(starter, 'Workspace')
  await shot(starter, 'clean-starter')
  assert(!requests.some(path => /showcase|gallery|settings/.test(path)))
  const assets = await readdir(new URL('../dist-starter/assets/', import.meta.url))
  assert(!assets.some(name => /showcase|gallery|settings|vchart|charts|analytics/i.test(name)))
  const scripts = await Promise.all(assets.filter(name => name.endsWith('.js')).map(name => readFile(new URL(`../dist-starter/assets/${name}`, import.meta.url), 'utf8')))
  assert(scripts.every(source => !source.includes('evenform-tokens-v1') && !source.includes('Token verification project') && !source.includes('Website refresh') && !source.includes('Advanced tokens')))
  report.starter = { requests: requests.map(path => new URL(path).pathname), productionAssets: assets, showcaseAbsent: true }
  await starterContext.close()
  assert.deepEqual(report.errors, [])
  console.log('Passed: pre-React preferences, system theme, shortcut removal, cascade contract, two density/theme pairs, advanced export/reset, mobile touch/scroll, isolated starter.')
} finally {
  await writeFile(new URL('verification.json', output), JSON.stringify(report, null, 2))
  await browser.close()
}
