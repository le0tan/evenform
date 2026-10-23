import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const origin = process.env.EVENFORM_URL || "http://127.0.0.1:4173"
const output = new URL("../evidence/input-adoption/", import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL("fixture.html", output), '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="./fixture.tsx"></script></body></html>')
await writeFile(new URL("fixture.tsx", output), `import React from 'react';import{createRoot}from'react-dom/client';import'../../src/core.css';
import{FreeEntryComboboxExample,SvgDialogExample}from'../../src/playground/input-adoption-example';
import{Dialog,DialogTrigger,DialogContent,DialogTitle}from'../../src/components/ui/dialog';import{Button}from'../../src/components/ui/button';
const query=new URLSearchParams(location.search);document.documentElement.classList.toggle('dark',query.get('theme')==='dark');document.documentElement.dataset.density=query.get('density')||'compact';
const load=async(signal)=>{const response=await fetch('/__adoption/records',query.has('ignore-abort')?{}:{signal});if(!response.ok)throw Error('Request failed');return response.json()};
createRoot(document.getElementById('root')).render(<main style={{padding:'var(--ds-page-padding-x)'}}><FreeEntryComboboxExample loadSuggestions={load}/><SvgDialogExample/><Dialog><DialogTrigger render={<Button/>}>HTML opener</DialogTrigger><DialogContent><DialogTitle>HTML dialog</DialogTitle></DialogContent></Dialog></main>);`)

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const report = { result: "fail", matrix: [], contracts: [], errors: [] }
let activePage
const records = ["record-101", "record-102", "saved-record"]
try {
  for (const width of [1380, 390]) for (const theme of ["light", "dark"]) for (const density of ["compact", "comfortable"]) for (const reducedMotion of ["no-preference", "reduce"]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion })
    const page = await context.newPage()
    activePage = page
    page.setDefaultTimeout(10000)
    page.on("pageerror", error => report.errors.push(error.message))
    await page.route("**/__adoption/records", async route => {
      // A small, deliberate response delay makes the request's loading state observable.
      await new Promise(resolve => setTimeout(resolve, 100))
      await route.fulfill({ json: records }).catch(() => {})
    })
    await page.goto(`${origin}/evidence/input-adoption/fixture.html?theme=${theme}&density=${density}`)
    const input = page.getByRole("combobox", { name: "Record ID", exact: true })
    await input.waitFor()
    assert.equal(await input.inputValue(), "saved-record")
    await input.fill("unlisted-record")
    await input.press("Tab")
    assert.equal(await input.inputValue(), "unlisted-record", "blur must preserve unmatched text")
    await page.getByRole("button", { name: "Clear record ID", exact: true }).click()
    assert.equal(await input.inputValue(), "")
    assert.equal(await input.evaluate(element => element === document.activeElement), true)
    await page.getByRole("button", { name: "Show records", exact: true }).click()
    await page.getByRole("status").waitFor()
    await page.getByRole("option", { name: "record-101", exact: true }).click()
    assert.equal(await input.inputValue(), "record-101")
    await input.fill("record-102")
    await input.press("ArrowDown")
    await page.getByRole("option", { name: "record-102", exact: true }).waitFor()
    await input.press("ArrowDown")
    await input.press("Enter")
    assert.equal(await input.inputValue(), "record-102")
    await page.getByRole("button", { name: "Restore saved ID", exact: true }).click()
    assert.equal(await input.inputValue(), "saved-record")
    await input.fill("no-suggestion")
    await input.press("ArrowDown")
    await page.getByText("No suggestions.", { exact: true }).waitFor()
    await input.press("Escape")
    assert.equal(await input.inputValue(), "no-suggestion")
    assert.equal(await input.getAttribute("aria-expanded"), "false")
    // SVG keyboard opener, connected return, removed return target and native fallback.
    const collect = page.getByRole("button", { name: "Inspect Collect", exact: true })
    await collect.press("Enter")
    const dialog = page.getByRole("dialog", { name: "Collect", exact: true })
    await dialog.waitFor()
    await page.keyboard.press("Escape")
    await dialog.waitFor({ state: "detached" })
    assert.equal(await collect.evaluate(element => element === document.activeElement), true)
    await collect.press("Space")
    await page.getByRole("button", { name: "Remove step", exact: true }).click()
    await dialog.waitFor({ state: "detached" })
    assert.equal(await collect.count(), 0)
    const fallback = page.getByRole("button", { name: "Reset sequence", exact: true })
    assert.equal(await fallback.evaluate(element => element === document.activeElement), true)
    await fallback.press("Enter")
    await collect.waitFor()
    const htmlOpener = page.getByRole("button", { name: "HTML opener", exact: true })
    await htmlOpener.click()
    await page.getByRole("dialog", { name: "HTML dialog", exact: true }).waitFor()
    await page.keyboard.press("Escape")
    await page.getByRole("dialog", { name: "HTML dialog", exact: true }).waitFor({ state: "detached" })
    assert.equal(await htmlOpener.evaluate(element => element === document.activeElement), true)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await page.screenshot({ path: new URL(`${width}-${theme}-${density}-${reducedMotion}.png`, output).pathname })
    report.matrix.push({ width, theme, density, reducedMotion })
    await context.close()
  }
  // Failure/retry and a late response after cancellation must not replace a newer request.
  const page = await browser.newPage()
  activePage = page
  page.setDefaultTimeout(10000)
  page.on("pageerror", error => report.errors.push(error.message))
  let attempt = 0
  await page.route("**/__adoption/records", async route => {
    attempt++
    if (attempt === 1) await route.fulfill({ status: 503, json: { error: "Unavailable" } })
    else await route.fulfill({ json: records })
  })
  await page.goto(`${origin}/evidence/input-adoption/fixture.html`)
  const input = page.getByRole("combobox", { name: "Record ID", exact: true })
  await page.getByRole("button", { name: "Show records", exact: true }).click()
  await page.getByRole("alert").waitFor()
  assert.equal(await input.inputValue(), "saved-record")
  await page.getByRole("button", { name: "Retry", exact: true }).click()
  await page.getByRole("option", { name: "saved-record", exact: true }).waitFor()
  await input.press("Escape")
  await page.unroute("**/__adoption/records")
  let release
  const pending = new Promise(resolve => { release = resolve })
  let requestStarted
  const started = new Promise(resolve => { requestStarted = resolve })
  await page.route("**/__adoption/records", async route => {
    requestStarted()
    await pending
    await route.fulfill({ json: ["stale-record"] }).catch(() => {})
  })
  await page.getByRole("button", { name: "Show records", exact: true }).click()
  await started
  await input.fill("new-draft")
  await input.press("Escape")
  release()
  await input.press("Tab")
  assert.equal(await input.inputValue(), "new-draft")
  assert.equal(await input.getAttribute("aria-expanded"), "false")
  assert.equal(await page.getByRole("alert").count(), 0)
  // A loader may not honor AbortSignal. A late completion must still be ignored.
  const stalePage = await browser.newPage()
  activePage = stalePage
  stalePage.on("pageerror", error => report.errors.push(error.message))
  let releaseOld
  const oldResponse = new Promise(resolve => { releaseOld = resolve })
  let oldStarted
  const oldRequest = new Promise(resolve => { oldStarted = resolve })
  let generation = 0
  await stalePage.route("**/__adoption/records", async route => {
    generation++
    if (generation === 1) {
      oldStarted()
      await oldResponse
      await route.fulfill({ json: ["stale-record"] })
    } else await route.fulfill({ json: ["record-201"] })
  })
  await stalePage.goto(`${origin}/evidence/input-adoption/fixture.html?ignore-abort=1`)
  const staleInput = stalePage.getByRole("combobox", { name: "Record ID", exact: true })
  await stalePage.getByRole("button", { name: "Show records", exact: true }).click()
  await oldRequest
  await staleInput.press("Escape")
  await staleInput.fill("record")
  await stalePage.getByRole("option", { name: "record-201", exact: true }).waitFor()
  const lateResponse = stalePage.waitForResponse("**/__adoption/records")
  releaseOld()
  await (await lateResponse).finished()
  await stalePage.evaluate(() => new Promise(requestAnimationFrame))
  assert.equal(await stalePage.getByRole("option", { name: "record-201", exact: true }).count(), 1)
  assert.equal(await stalePage.getByRole("option", { name: "stale-record", exact: true }).count(), 0)
  assert.equal(await staleInput.inputValue(), "record")
  report.contracts.push("Free text, blur, clear/focus, restored value, mouse/keyboard suggestion, Escape", "Async loading, failure/retry, cancelled stale response", "SVG keyboard opener, exact return and removed-opener fallback; HTML trigger unchanged")
  assert.deepEqual(report.errors, [])
  report.result = "pass"
  console.log(`PASS ${report.matrix.length} input/focus cases, async recovery and SVG/HTML focus contracts`)
} finally {
  if (report.result !== "pass" && activePage && !activePage.isClosed()) {
    await activePage.screenshot({ path: new URL("failure.png", output).pathname })
    await writeFile(new URL("failure.txt", output), await activePage.locator("body").ariaSnapshot())
  }
  await writeFile(new URL("report.json", output), JSON.stringify(report, null, 2))
  await browser.close()
}
