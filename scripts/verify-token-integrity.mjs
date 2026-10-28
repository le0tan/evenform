import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

// Exercise the imported CSS in an isolated host: the Playground normally creates
// custom palette roles, which can conceal missing-role and alias regressions.
const origin = process.env.EVENFORM_URL || 'http://127.0.0.1:5173'
const output = new URL('../evidence/token-integrity/', import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL('fixture.html', output), '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="./fixture.tsx"></script></body></html>')
await writeFile(new URL('fixture.tsx', output), `import React from 'react';import{createRoot}from'react-dom/client';import{DirectionProvider}from'@base-ui/react/direction-provider';import'../../src/core.css';import{Button}from'../../src/components/ui/button';import{Input}from'../../src/components/ui/input';import{OptionSelect}from'../../src/components/ui/option-select';const params=new URLSearchParams(location.search);const direction=params.get('dir')||'ltr';document.documentElement.dir=direction;document.documentElement.dataset.density=params.get('density')||'compact';createRoot(document.getElementById('root')).render(<DirectionProvider direction={direction}><Button id="action">Save changes</Button><Button id="small" size="sm">Cancel</Button><Input id="input" aria-label="Name"/><OptionSelect options={[{value:'design',label:'Design'}]} defaultValue="design" triggerProps={{id:'select','aria-label':'Team'}}/><div id="sidebar" style={{background:'var(--sidebar-primary)',color:'var(--sidebar-primary-foreground)'}}>Sidebar action</div></DirectionProvider>);`)
const tokenCss = await readFile(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
// All primitive/semantic declarations before component rules must resolve. CSS
// names are discovered, not copied into a parallel source of design defaults.
const names = [...new Set([...tokenCss.split('/* Semantic utility bridge.')[0].matchAll(/(--ds-[\w-]+)\s*:/g)].map(match => match[1]))]
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const report = { matrix: [], typography: [], directions: [], errors: [] }
try {
  const page = await browser.newPage()
  page.on('pageerror', error => report.errors.push(error.message))
  await page.goto(`${origin}/evidence/token-integrity/fixture.html`)
  await page.locator('#action').waitFor()
  for (const theme of ['light', 'dark']) for (const density of ['compact', 'comfortable']) for (const size of ['auto', 'small', 'medium', 'large']) for (const palette of ['neutral', 'indigo', 'teal', 'rose', 'custom']) for (const elevation of ['soft', 'flat', 'layered']) {
    const result = await page.evaluate(({ theme, density, size, palette, elevation, names }) => {
      const root = document.documentElement
      root.classList.toggle('dark', theme === 'dark')
      Object.assign(root.dataset, { density, controlSize: size, palette, elevation })
      const styles = getComputedStyle(root)
      const unresolved = names.filter(name => !styles.getPropertyValue(name).trim())
      const roles = ['--primary', '--primary-foreground', '--accent', '--accent-foreground', '--ring', '--sidebar-primary', '--sidebar-primary-foreground']
      unresolved.push(...roles.filter(name => !styles.getPropertyValue(name).trim()))
      const heights = ['action', 'input', 'select'].map(id => getComputedStyle(document.getElementById(id)).height)
      const canvas = document.createElement('canvas'), context = canvas.getContext('2d')
      const luminance = name => {
        context.fillStyle = styles.getPropertyValue(name).trim()
        context.fillRect(0, 0, 1, 1)
        return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(c => { const n = c / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4 }).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0)
      }
      const a = luminance('--sidebar-primary'), b = luminance('--sidebar-primary-foreground')
      const muted = luminance('--muted-foreground')
      const mutedContrasts = ['--background', '--card', '--popover', '--muted', '--secondary', '--sidebar'].map(name => {
        const surface = luminance(name)
        return (Math.max(muted, surface) + .05) / (Math.min(muted, surface) + .05)
      })
      return { unresolved, heights, sidebarContrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05), mutedContrast: Math.min(...mutedContrasts) }
    }, { theme, density, size, palette, elevation, names })
    const label = `${theme}/${density}/${size}/${palette}/${elevation}`
    assert.deepEqual(result.unresolved, [], `${label}: unresolved tokens`)
    assert.equal(new Set(result.heights).size, 1, `${label}: action/input/select alignment`)
    assert(result.sidebarContrast >= 4.5, `${label}: sidebar primary contrast ${result.sidebarContrast}`)
    assert(result.mutedContrast >= 4.5, `${label}: supporting text on neutral surfaces ${result.mutedContrast}`)
    report.matrix.push({ theme, density, size, palette, elevation, ...result })
  }
  for (const size of ['auto', 'small', 'medium', 'large']) {
    const sizes = []
    for (const base of [14, 18]) sizes.push(await page.evaluate(({ size, base }) => {
      const root = document.documentElement
      root.dataset.controlSize = size
      root.style.setProperty('--ds-font-size-base', `${base}px`)
      return ['action', 'small', 'input', 'select'].map(id => parseFloat(getComputedStyle(document.getElementById(id)).fontSize))
    }, { size, base }))
    sizes[0].forEach((value, index) => assert.equal(sizes[1][index] - value, 4, `${size}: base type scale inheritance`))
    report.typography.push({ size, sizes })
  }
  for (const direction of ['ltr', 'rtl']) for (const density of ['compact', 'comfortable']) {
    await page.goto(`${origin}/evidence/token-integrity/fixture.html?dir=${direction}&density=${density}`)
    const trigger = page.locator('#select')
    await trigger.waitFor()
    assert.equal(await page.locator('[data-slot="select-value"]').evaluate(element => getComputedStyle(element).textAlign), 'start')
    await trigger.click()
    const option = page.getByRole('option', { name: 'Design', exact: true })
    await option.waitFor()
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-slot="select-content"]')).transform === 'none')
    const geometry = await option.evaluate(element => {
      const style = getComputedStyle(element), root = getComputedStyle(document.documentElement)
      const row = element.getBoundingClientRect(), indicator = element.lastElementChild.getBoundingClientRect()
      return { start: parseFloat(style.paddingInlineStart), end: parseFloat(style.paddingInlineEnd),
        padding: parseFloat(root.getPropertyValue('--ds-control-padding-x')), reserved: parseFloat(root.getPropertyValue('--ds-space-6')),
        indicatorEnd: document.documentElement.dir === 'rtl' ? indicator.left - row.left : row.right - indicator.right,
        inset: parseFloat(root.getPropertyValue('--ds-space-2')) }
    })
    assert.equal(geometry.start, geometry.padding, `${direction}/${density}: option start padding`)
    assert.equal(geometry.end, geometry.padding + geometry.reserved, `${direction}/${density}: checkmark reservation`)
    assert.equal(geometry.indicatorEnd, geometry.inset, `${direction}/${density}: checkmark follows inline end`)
    await option.evaluate(element => element.classList.add('p-0'))
    assert.equal(await option.evaluate(element => getComputedStyle(element).padding), '0px', 'Caller utility overrides component-layer padding')
    await page.keyboard.press('Escape')
    report.directions.push({ direction, density, ...geometry })
  }
  assert.deepEqual(report.errors, [])
  console.log(`PASS ${report.matrix.length} token/theme/density/size/palette/elevation cases; ${report.typography.length} base type scale cases; ${report.directions.length} direction/density cases`)
} finally {
  await writeFile(new URL('report.json', output), JSON.stringify(report, null, 2))
  await browser.close()
}
