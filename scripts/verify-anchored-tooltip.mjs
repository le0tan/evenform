import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const origin = process.env.EVENFORM_URL || "http://127.0.0.1:4173"
const output = new URL("../evidence/anchored-tooltip/", import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL("fixture.html", output), '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div><script type="module" src="./fixture.tsx"></script>')
await writeFile(new URL("fixture.tsx", output), `import React,{useState}from'react';import{createRoot}from'react-dom/client';import'../../src/core.css';import{Tooltip,TooltipContent}from'../../src/components/ui/tooltip';
function Example(){const[anchor,setAnchor]=useState(null),[open,setOpen]=useState(false);const show=e=>{setAnchor(e.currentTarget);setOpen(true)};return <><svg width="100%" height="400"><rect x="180" y="200" width="48" height="24" fill="currentColor" role="button" aria-label="Inspect segment" aria-describedby={open?'preview':undefined} tabIndex={0} onMouseEnter={show} onMouseLeave={()=>setOpen(false)} onFocus={show} onBlur={()=>setOpen(false)} onKeyDown={e=>{if(e.key==='Escape')setOpen(false)}}/></svg><Tooltip open={open} onOpenChange={setOpen}><TooltipContent id="preview" role="tooltip" side="bottom" sideOffset={8} showArrow={false} positionerProps={{anchor,positionMethod:'fixed',collisionPadding:16}} className="evenform-floating-panel block bg-popover text-popover-foreground">Segment preview</TooltipContent></Tooltip></>};createRoot(document.getElementById('root')).render(<Example/>);`)
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const cases = []
try {
  for (const width of [973, 1702]) for (const theme of ["light", "dark"]) for (const reducedMotion of ["reduce", "no-preference"]) {
    const page = await browser.newPage({ viewport: { width, height: 768 }, reducedMotion })
    const errors = []
    page.on("pageerror", error => errors.push(error.message))
    await page.goto(`${origin}/evidence/anchored-tooltip/fixture.html`)
    await page.getByRole("button", { name: "Inspect segment" }).waitFor()
    await page.evaluate(theme => document.documentElement.classList.toggle("dark", theme === "dark"), theme)
    const segment = page.getByRole("button", { name: "Inspect segment" })
    await segment.hover()
    const popup = page.getByRole("tooltip")
    await popup.waitFor()
    await popup.evaluate(async element => Promise.all(element.getAnimations().map(animation => animation.finished)))
    const a = await segment.boundingBox(), b = await popup.boundingBox()
    assert(b.y >= a.y + a.height && b.y - a.y - a.height < 20, "preview must attach below the SVG anchor")
    assert(Math.abs(b.x + b.width / 2 - a.x - a.width / 2) < 2, "preview stays centered on the segment")
    assert.equal(await popup.locator("svg").count(), 0, "optional arrow is absent")
    const positioner = await popup.evaluate(element => ({ position: getComputedStyle(element.parentElement).position, transition: getComputedStyle(element.parentElement).transitionDuration }))
    assert.equal(positioner.position, "fixed")
    assert(parseFloat(positioner.transition) <= 0.00001, "positioning coordinates must not animate")
    await segment.press("Escape")
    await popup.waitFor({ state: "hidden" })
    await segment.press("Tab")
    await segment.focus()
    await popup.waitFor()
    assert.equal(await segment.getAttribute("aria-describedby"), "preview")
    await page.screenshot({ path: new URL(`${width}-${theme}-${reducedMotion}.png`, output).pathname })
    assert.deepEqual(errors, [])
    cases.push({ width, theme, reducedMotion, anchor: "pass", focus: "pass", escape: "pass" })
    await page.close()
  }
  await writeFile(new URL("report.json", output), JSON.stringify({ result: "pass", cases }, null, 2))
  console.log(`Anchored tooltip: ${cases.length} cases passed`)
} finally { await browser.close() }
