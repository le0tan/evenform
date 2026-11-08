// Regression checks for issues found while building a real product page on a
// source-adopted Evenform: nested overlay dismissal, icon-only CopyButton hit
// area, overlay width tokens, FormSection surface and divided StatGroup.
import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const origin = process.env.EVENFORM_URL || "http://localhost:5173"
const output = new URL("../evidence/adoption-feedback/", import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL("fixture.html", output), '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="./fixture.tsx"></script></body></html>')
await writeFile(new URL("fixture.tsx", output), `
import React from 'react';
import {createRoot} from 'react-dom/client';
import '../../src/index.css';
import {Button} from '../../src/components/ui/button';
import {CopyButton} from '../../src/components/ui/copy-button';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription} from '../../src/components/ui/dialog';
import {Sheet,SheetTrigger,SheetContent,SheetTitle,SheetDescription,SheetBody} from '../../src/components/ui/sheet';
import {FormSection} from '../../src/components/patterns/form-section';
import {StatGroup,Stat} from '../../src/components/patterns/stat';
const query = new URLSearchParams(location.search);
document.documentElement.dataset.density = query.get('density') || 'compact';
document.documentElement.classList.toggle('dark', query.get('theme') === 'dark');
window.audit = {opened:0};
const Nested = ({name}) => <Dialog><DialogTrigger render={<Button/>}>{'Open nested ' + name}</DialogTrigger><DialogContent><DialogTitle>{'Nested ' + name}</DialogTitle><DialogDescription>Details</DialogDescription></DialogContent></Dialog>;
function Fixture(){return <main style={{padding:24,display:'grid',gap:24,justifyItems:'start'}}>
<Sheet><SheetTrigger render={<Button/>}>Open sheet</SheetTrigger><SheetContent data-testid="sheet" style={{'--ds-sheet-max-width':'720px'}}><SheetTitle>Result sheet</SheetTitle><SheetDescription>Run</SheetDescription><SheetBody><Nested name="from sheet"/></SheetBody></SheetContent></Sheet>
<Dialog><DialogTrigger render={<Button/>}>Open dialog</DialogTrigger><DialogContent data-testid="dialog" style={{'--ds-dialog-max-width':'860px'}}><DialogTitle>Parent dialog</DialogTitle><DialogDescription>Parent</DialogDescription><Nested name="from dialog"/></DialogContent></Dialog>
<span data-testid="url-actions" style={{display:'inline-flex',gap:4}}>
  <CopyButton value="https://example.com" size="icon-sm" variant="ghost" label="Copy full URL" copiedLabel="Copied full URL" aria-label="Copy full URL" writeText={() => new Promise(() => {})} />
  <Button size="icon-sm" variant="ghost" aria-label="Open URL" onClick={() => window.audit.opened++}>↗</Button>
</span>
<div style={{width:'100%',maxWidth:560}}><FormSection data-testid="surface" surface title="Model" description="Choose a model">Fields</FormSection></div>
<StatGroup data-testid="divided" divided style={{width:900}}><Stat label="Tokens" value="1.20M"/><Stat label="Cache" value="87.1%"/><Stat label="Cost" value="$3.81"/></StatGroup>
</main>}
createRoot(document.getElementById('root')).render(<Fixture/>);
`)

const report = { result: "fail", checks: [], errors: [] }
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const check = (name, condition) => { assert(condition, name); report.checks.push(name); console.log("PASS", name) }
// The divider is visible when its border box lies inside the group's clip and not left of the parent's content box.
const visibleDividers = element => {
  const clip = parseFloat(getComputedStyle(element).clipPath.match(/inset\(([^)]*)\)/)?.[1].split(" ")[3] ?? "0")
  const visibleLeft = element.getBoundingClientRect().left + clip
  const containerLeft = Math.round(element.parentElement.getBoundingClientRect().left + parseFloat(getComputedStyle(element.parentElement).paddingLeft))
  const items = [...element.children].map(child => { const box = child.getBoundingClientRect(); const style = getComputedStyle(child); return { top: Math.round(box.top), left: box.left, dividerVisible: parseFloat(style.borderInlineStartWidth) > 0 && box.left >= visibleLeft - 0.5, contentLeft: Math.round(box.left + parseFloat(style.borderInlineStartWidth) + parseFloat(style.paddingInlineStart)), containerLeft } })
  const minLeft = Math.min(...items.map(item => item.left))
  return items.map(item => ({ ...item, rowStart: Math.abs(item.left - minLeft) < 1 }))
}
const settle = page => page.evaluate(() => Promise.all(document.getAnimations().filter(animation => animation.effect?.getComputedTiming().endTime !== Infinity).map(animation => animation.finished.catch(() => {}))))
try {
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 860 }, reducedMotion: theme === "dark" ? "reduce" : "no-preference" })
    const page = await context.newPage()
    page.setDefaultTimeout(5000)
    page.on("pageerror", error => report.errors.push(error.message))
    await page.goto(`${origin}/evidence/adoption-feedback/fixture.html?theme=${theme}&density=${theme === "dark" ? "comfortable" : "compact"}`)

    // Dialog opened from a Sheet: a press outside it, over the Sheet, closes only the nested Dialog.
    await page.getByRole("button", { name: "Open sheet" }).click()
    await page.getByRole("button", { name: "Open nested from sheet" }).click()
    await page.getByRole("dialog", { name: "Nested from sheet" }).waitFor()
    await settle(page)
    const sheetBox = await page.getByTestId("sheet").boundingBox()
    await page.mouse.click(sheetBox.x + sheetBox.width - 24, sheetBox.y + sheetBox.height - 24)
    await page.getByRole("dialog", { name: "Nested from sheet" }).waitFor({ state: "hidden" })
    check(`${theme}: outside press over the sheet closes only the nested dialog`, await page.getByRole("dialog", { name: "Result sheet" }).isVisible())
    await page.getByRole("button", { name: "Open nested from sheet" }).click()
    await page.getByRole("dialog", { name: "Nested from sheet" }).waitFor()
    await settle(page)
    await page.keyboard.press("Escape")
    await page.getByRole("dialog", { name: "Nested from sheet" }).waitFor({ state: "hidden" })
    check(`${theme}: Escape closes only the nested dialog`, await page.getByRole("dialog", { name: "Result sheet" }).isVisible())
    check(`${theme}: sheet width follows --ds-sheet-max-width`, Math.round(sheetBox.width) === 720)
    await page.keyboard.press("Escape")
    await page.getByRole("dialog", { name: "Result sheet" }).waitFor({ state: "hidden" })

    // Dialog opened from a Dialog.
    await page.getByRole("button", { name: "Open dialog" }).click()
    await page.getByRole("button", { name: "Open nested from dialog" }).click()
    await page.getByRole("dialog", { name: "Nested from dialog" }).waitFor()
    await settle(page)
    const parentBox = await page.getByTestId("dialog").boundingBox()
    const nestedBox = await page.getByRole("dialog", { name: "Nested from dialog" }).boundingBox()
    check(`${theme}: dialog width follows --ds-dialog-max-width`, Math.round(parentBox.width) === 860)
    await page.mouse.click(parentBox.x + 12, parentBox.y + parentBox.height - 12)
    assert(parentBox.x + 12 < nestedBox.x, "click lands outside the nested dialog")
    await page.getByRole("dialog", { name: "Nested from dialog" }).waitFor({ state: "hidden" })
    check(`${theme}: outside press over the parent dialog closes only the nested dialog`, await page.getByRole("dialog", { name: "Parent dialog" }).isVisible())
    await page.mouse.click(8, 8)
    await page.getByRole("dialog", { name: "Parent dialog" }).waitFor({ state: "hidden" })
    check(`${theme}: top-level dialog still dismisses on outside press`, true)

    // Icon-only CopyButton: its status faces stay inside the button, including while copying.
    const copy = page.getByRole("button", { name: "Copy full URL" })
    const open = page.getByRole("button", { name: "Open URL" })
    const copyBox = await copy.boundingBox()
    check(`${theme}: icon CopyButton keeps its icon size`, Math.abs(copyBox.width - copyBox.height) < 1)
    await copy.click()
    await page.waitForTimeout(250)
    const openBox = await open.boundingBox()
    const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('button')?.getAttribute('aria-label'), [openBox.x + openBox.width / 2, openBox.y + openBox.height / 2])
    check(`${theme}: copying state does not cover the neighbouring button (${hit})`, hit === "Open URL")
    check(`${theme}: icon CopyButton faces are clipped`, await copy.evaluate(button => [...button.querySelectorAll('.evenform-feedback-face')].every(face => { const a = face.getBoundingClientRect(); const b = button.getBoundingClientRect(); return a.width <= b.width + 0.5 })))
    await open.click()
    check(`${theme}: neighbouring button remains clickable`, await page.evaluate(() => window.audit.opened === 1))

    // FormSection surface and divided StatGroup use tokens, no consumer CSS.
    const surface = await page.getByTestId("surface").evaluate(element => { const style = getComputedStyle(element); const legend = element.querySelector('legend').getBoundingClientRect(); const box = element.getBoundingClientRect(); return { border: style.borderTopWidth, background: style.backgroundColor, radius: style.borderTopLeftRadius, legendInside: legend.top >= box.top + 1 } })
    check(`${theme}: FormSection surface has border, background and radius`, surface.border !== "0px" && surface.background !== "rgba(0, 0, 0, 0)" && surface.radius !== "0px")
    check(`${theme}: FormSection surface keeps the legend inside the padded box`, surface.legendInside)
    const divided = await page.getByTestId("divided").evaluate(visibleDividers)
    check(`${theme}: divided StatGroup stays on one row`, new Set(divided.map(stat => stat.top)).size === 1)
    check(`${theme}: divided StatGroup shows a separator before every stat but the first`, !divided[0].dividerVisible && divided.slice(1).every(stat => stat.dividerVisible))
    check(`${theme}: divided StatGroup starts flush with its container`, divided[0].contentLeft === divided[0].containerLeft)
    await page.screenshot({ path: new URL(`${theme}.png`, output).pathname, fullPage: true })
    await context.close()
  }
  // Narrow screen: divided StatGroup wraps without dangling separators on the row start.
  const context = await browser.newContext({ viewport: { width: 390, height: 860 } })
  const page = await context.newPage()
  await page.goto(`${origin}/evidence/adoption-feedback/fixture.html`)
  await page.getByTestId("divided").evaluate(element => { element.style.width = "100%" })
  const narrow = await page.getByTestId("divided").evaluate(visibleDividers)
  check("narrow: divided StatGroup wraps", new Set(narrow.map(stat => stat.top)).size > 1)
  check("narrow: stats that start a row show no separator and start flush", narrow.filter(stat => stat.rowStart).every(stat => !stat.dividerVisible && stat.contentLeft === stat.containerLeft))
  await page.screenshot({ path: new URL("narrow.png", output).pathname, fullPage: true })
  await context.close()
  assert.deepEqual(report.errors, [])
  report.result = "pass"
} finally {
  await browser.close()
  await writeFile(new URL("report.json", output), JSON.stringify(report, null, 2))
}
