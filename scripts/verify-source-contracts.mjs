import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const origin = process.env.EVENFORM_URL || "http://127.0.0.1:4173"
const output = new URL("../evidence/source-contracts/", import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL("fixture.html", output), '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="./fixture.tsx"></script></body></html>')
// The host must actually generate its explicit utility overrides; evidence is
// excluded from the library's automatic Tailwind scan.
await writeFile(new URL("fixture.css", output), '@import "../../src/core.css"; @source inline("rounded-none ring-0 shrink");')
await writeFile(new URL("fixture.tsx", output), `import React,{useState} from 'react';import{createRoot}from'react-dom/client';import'./fixture.css';import'../../src/styles/workflow-aids.css';
import{WorkspaceAdoptionExample}from'../../src/playground/workspace-adoption-example';
import{OptionSelect}from'../../src/components/ui/option-select';
import{Dialog,DialogContent,DialogTitle}from'../../src/components/ui/dialog';
import{Sheet,SheetContent,SheetTitle}from'../../src/components/ui/sheet';
import{AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogCancel}from'../../src/components/ui/alert-dialog';
const params=new URLSearchParams(location.search);document.documentElement.classList.toggle('dark',params.get('theme')==='dark');document.documentElement.dataset.density=params.get('density')||'compact';
function Fixture(){const[value,setValue]=useState('fields');const[options,setOptions]=useState([{value:'fields',label:'Fields'}]);const[kind,setKind]=useState(null);
return <><WorkspaceAdoptionExample embedded={false}/><div id="test-tools" style={{display:'none'}}><input aria-label="Restored value" onChange={e=>setValue(e.target.value)}/><OptionSelect options={options} value={value} onValueChange={setValue} triggerProps={{'aria-label':'Async field'}}/><button onClick={()=>setOptions([{value:'fields',label:'Fields'},{value:'optional',label:'Optional'}])}>Load options</button>{['dialog','sheet','alert'].map(k=><button key={k} onClick={()=>setKind(k)}>Open {k}</button>)}</div><Dialog open={kind==='dialog'} onOpenChange={o=>!o&&setKind(null)}><DialogContent><DialogTitle>Dialog test</DialogTitle></DialogContent></Dialog><Sheet open={kind==='sheet'} onOpenChange={o=>!o&&setKind(null)}><SheetContent><SheetTitle>Sheet test</SheetTitle></SheetContent></Sheet><AlertDialog open={kind==='alert'} onOpenChange={o=>!o&&setKind(null)}><AlertDialogContent><AlertDialogTitle>Alert test</AlertDialogTitle><AlertDialogCancel>Cancel</AlertDialogCancel></AlertDialogContent></AlertDialog></>}
createRoot(document.getElementById('root')).render(<Fixture/>);`)
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const report = { result: "fail", matrix: [], interactions: [], errors: [] }
try {
  const page = await browser.newPage()
  page.on('pageerror', error => report.errors.push(error.message))
  for (const width of [1380, 390]) for (const theme of ['light', 'dark']) for (const density of ['compact', 'comfortable']) {
    await page.setViewportSize({ width, height: 600 })
    await page.goto(`${origin}/evidence/source-contracts/fixture.html?theme=${theme}&density=${density}`)
    const select = page.getByRole('combobox', { name: 'Field mode', exact: true })
    await select.waitFor()
    assert.equal((await select.innerText()).trim(), 'Fields')
    assert.equal(await page.locator('[data-slot="select-content"]').count(), 0)
    await page.getByRole('button', { name: 'Restore value', exact: true }).click()
    assert.equal((await select.innerText()).trim(), 'Optional')
    assert.equal(await page.locator('[data-slot="select-content"]').count(), 0)
    await select.press('Space')
    await page.getByRole('option', { name: 'Fields', exact: true }).click()
    assert.equal((await select.innerText()).trim(), 'Fields')
    await page.locator('[data-slot="select-content"]').waitFor({state:'hidden'})
    await select.evaluate(e => e.focus())
    await page.getByRole('button', { name: 'Snapshot parts', exact: true }).click()
    const choice = page.getByRole('menuitemcheckbox', { name: 'Execution plan', exact: true })
    await page.getByRole('group', { name: 'Included parts' }).waitFor()
    await choice.click()
    assert.equal(await choice.getAttribute('aria-checked'), 'false')
    await choice.press('Space')
    assert.equal(await choice.getAttribute('aria-checked'), 'true')
    await choice.press('Escape')
    await page.waitForFunction(() => !document.querySelector('[data-slot="dropdown-menu-content"]'))
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Snapshot parts').catch(async error => { console.log({width, theme, density, focus: await page.evaluate(() => document.activeElement?.tagName + ':' + document.activeElement?.getAttribute('id'))}); throw error })
    const geometry = await page.evaluate(() => {
      const feed = document.querySelector('.adoption-workspace-feed')
      const cards = [...feed.querySelectorAll('[data-slot="card"]')]
      const main = document.querySelector('main')
      return { mainCount: document.querySelectorAll('main').length, padding: getComputedStyle(main).padding, mainWidth: main.clientWidth, shellWidth: main.parentElement.clientWidth,
        shellHeight: main.parentElement.getBoundingClientRect().height, viewportHeight: innerHeight,
        pageOverflow: document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth,
        feedScrolls: feed.scrollHeight > feed.clientHeight, cardCount: cards.length,
        clipped: cards.some(card => card.scrollHeight > card.clientHeight + 1), radius: getComputedStyle(cards[0]).borderRadius,
        shrink: getComputedStyle(cards[0]).flexShrink, ring: getComputedStyle(cards[0]).boxShadow }
    })
    assert.equal(geometry.mainCount, 1); assert.equal(geometry.padding, '0px')
    assert.equal(geometry.mainWidth, geometry.shellWidth)
    assert.equal(geometry.shellHeight, geometry.viewportHeight); assert.equal(geometry.pageOverflow, false); assert(geometry.feedScrolls)
    assert.equal(geometry.cardCount, 18); assert.equal(geometry.clipped, false); assert.equal(geometry.shrink, '0')
    const summary = page.locator('#adoption-step-1 summary')
    await summary.press('Enter')
    assert.equal(await page.locator('#adoption-step-1 details').getAttribute('open'), '')
    await page.getByRole('link', { name: 'Step 16', exact: true }).click()
    await page.locator('#adoption-step-16 summary').press('Enter')
    assert.equal(await page.locator('#adoption-step-16 details').getAttribute('open'), '')
    assert(await page.locator('.adoption-workspace-feed').evaluate(e => e.scrollTop > 0))
    const before = await page.locator('.adoption-workspace-feed').evaluate(e => e.scrollTop)
    await page.locator('.adoption-workspace-navigation').evaluate(e => { e.scrollTop = e.scrollHeight })
    assert.equal(await page.locator('.adoption-workspace-feed').evaluate(e => e.scrollTop), before)
    // Keep screenshots at the first card with its disclosure open.
    await page.getByRole('link', { name: 'Step 1', exact: true }).click()
    await page.screenshot({ path: new URL(`${width}-${theme}-${density}.png`, output).pathname })
    report.matrix.push({ width, theme, density, ...geometry })
  }
  report.interactions.push('Restored labels before lazy popup mounts; closed value changes; option selection', 'Named menu group, mouse + keyboard keep-open, Escape focus restoration', '18 cards with intrinsic heights, keyboard disclosures, independent scrolling')
  await page.goto(`${origin}/evidence/source-contracts/fixture.html?theme=dark&density=comfortable`)
  await page.getByRole('combobox', { name: 'Field mode', exact: true }).waitFor()
  await page.evaluate(() => { document.querySelector('[data-slot="header-shell"]').style.display='none'; document.querySelector('#test-tools').style.display='block' })
  const asyncSelect = page.getByRole('combobox', { name: 'Async field', exact: true })
  assert.equal((await asyncSelect.innerText()).trim(), 'Fields')
  await page.getByRole('textbox', { name: 'Restored value' }).fill('optional')
  await page.getByRole('button', { name: 'Load options' }).click()
  assert.equal((await asyncSelect.innerText()).trim(), 'Optional')
  assert.equal(await page.locator('[data-slot="select-content"]').count(), 0)
  report.interactions.push('Controlled input restoration and asynchronous options resolve while closed')
  for (const theme of ['light', 'dark']) for (const reducedMotion of ['no-preference', 'reduce']) {
    await page.evaluate(theme => document.documentElement.classList.toggle('dark', theme === 'dark'), theme)
    await page.emulateMedia({ reducedMotion })
    await page.addStyleTag({ content: ':root { --ds-backdrop-color: #123456; --ds-backdrop-opacity: 30%; --ds-backdrop-blur: 0px; --ds-card-radius: 3px; --ds-card-boundary-width: 2px; --ds-card-boundary-color: rgb(10, 20, 30); }' })
    for (const kind of ['dialog', 'sheet', 'alert']) {
      await page.getByRole('button', { name: `Open ${kind}`, exact: true }).click()
      const overlay = page.locator(`[data-slot="${kind === 'alert' ? 'alert-dialog' : kind}-overlay"]`)
      await overlay.waitFor()
      const style = await overlay.evaluate(e => { const s=getComputedStyle(e);return { background:s.backgroundColor, blur:s.backdropFilter, duration:s.transitionDuration } })
      assert(style.background.includes('0.3'), JSON.stringify(style))
      assert.equal(style.blur, 'blur(0px)')
      if (reducedMotion === 'reduce') assert(style.duration.split(',').every(d => parseFloat(d) <= .001))
      if (kind === 'alert') await page.getByRole('button', {name:'Cancel',exact:true}).click()
      else await page.keyboard.press('Escape')
      await overlay.waitFor({state:'detached'})
    }
  }
  // Public surface parameters and explicit utility overrides remain independently usable.
  await page.goto(`${origin}/evidence/source-contracts/fixture.html`)
  await page.locator('#adoption-step-1').waitFor()
  await page.addStyleTag({ content: ':root { --ds-card-radius: 3px; --ds-card-boundary-width: 2px; --ds-card-boundary-color: rgb(10, 20, 30); }' })
  const card = page.locator('#adoption-step-1')
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#adoption-step-1')).borderRadius === '3px')
  assert((await card.evaluate(e => getComputedStyle(e).boxShadow)).includes('2px'))
  await card.evaluate(e => e.classList.add('rounded-none', 'ring-0', 'shrink'))
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#adoption-step-1')).borderRadius === '0px')
  assert.equal(await card.evaluate(e => getComputedStyle(e).flexShrink), '1')
  assert(!(await card.evaluate(e => getComputedStyle(e).boxShadow)).includes(' 2px '))
  report.interactions.push('Shared backdrop preset on Dialog/Sheet/AlertDialog with normal and reduced motion', 'Card surface preset and explicit utility overrides')
  assert.deepEqual(report.errors, [])
  report.result = "pass"
  console.log(`PASS ${report.matrix.length} viewport/theme/density cases and ${report.interactions.length} interaction contracts`)
} finally {
  await writeFile(new URL('report.json', output), JSON.stringify(report, null, 2))
  await browser.close()
}
