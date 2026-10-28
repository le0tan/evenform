import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const output = new URL("../evidence/copy-writer/", import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL("fixture.html", output), '<!doctype html><div id="root"></div><script type="module" src="./fixture.tsx"></script>')
await writeFile(new URL("fixture.tsx", output), `import React from'react';import{createRoot}from'react-dom/client';import'../../src/core.css';import{CopyButton}from'../../src/components/ui/copy-button';window.writes=[];window.results=[];window.fail=true;const writer=async value=>{window.writes.push(value);await new Promise(r=>setTimeout(r,80));if(value==='retry'&&window.fail)throw Error('bridge denied')};createRoot(document.getElementById('root')).render(<main><CopyButton value={async()=> 'example'} writeText={writer} label="Copy example" onCopy={value=>window.results.push(value)}/><CopyButton value="retry" writeText={writer} label="Copy retry" onCopyError={()=>window.results.push('error')}/></main>);`)
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
try {
  const page = await browser.newPage()
  const errors = []
  page.on("pageerror", error => errors.push(error.message))
  await page.goto(`${process.env.EVENFORM_URL || "http://127.0.0.1:4173"}/evidence/copy-writer/fixture.html`)
  const first = page.getByRole("button", { name: "Copy example", exact: true })
  await first.waitFor()
  await first.dblclick()
  await page.getByRole("status").filter({ hasText: "Copied" }).waitFor()
  assert.deepEqual(await page.evaluate(() => window.writes), ["example"])
  assert.deepEqual(await page.evaluate(() => window.results), ["example"])
  const retry = page.getByRole("button", { name: "Copy retry", exact: true })
  await retry.click()
  await page.getByRole("status").filter({ hasText: "Copy failed" }).waitFor()
  assert.deepEqual(await page.evaluate(() => window.results), ["example", "error"])
  await page.evaluate(() => { window.fail = false })
  await page.getByRole("button", { name: "Retry copy", exact: true }).click()
  await page.getByRole("button", { name: "Copied", exact: true }).nth(1).waitFor()
  assert.deepEqual(await page.evaluate(() => window.writes), ["example", "retry", "retry"])
  assert.deepEqual(errors, [])
  await page.screenshot({ path: new URL("result.png", output).pathname })
  await writeFile(new URL("report.json", output), JSON.stringify({ result: "pass", checks: ["async value", "single pending write", "success callback", "announced rejection", "retry recovery"], errors }, null, 2))
  console.log("PASS custom clipboard writer: async value, pending protection, success, rejection and retry")
} finally { await browser.close() }
