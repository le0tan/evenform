import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { createServer } from "vite"
import { chromium } from "playwright"

const origin = process.env.EVENFORM_URL || "http://127.0.0.1:4173"
const output = new URL("../evidence/ssr/", import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL("fixture.tsx", output), `import React from 'react';import{ThemeProvider,useTheme}from'../../src/components/theme-provider';
function Controls(){React.useEffect(()=>{document.documentElement.dataset.ssrHydrated="true"},[]);const{theme,resolvedTheme,setTheme}=useTheme();return <><output id="theme-state">{theme}:{resolvedTheme}</output><button aria-label={resolvedTheme==='dark'?'Switch to light':'Switch to dark'} onClick={()=>setTheme(resolvedTheme==='dark'?'light':'dark')}>Toggle theme</button><button onClick={()=>setTheme('system')}>Use system</button></>}
export function Fixture({mode='system'}){return <ThemeProvider storageKey="ssr-theme" defaultTheme={mode}><Controls/></ThemeProvider>}`)
await writeFile(new URL("server.tsx", output), `import React from 'react';import{renderToString}from'react-dom/server';import{Fixture}from'./fixture';export function render(mode){return renderToString(<Fixture mode={mode}/>)};`)
await writeFile(new URL("client.tsx", output), `import React from'react';import{hydrateRoot}from'react-dom/client';import'../../src/core.css';import{Fixture}from'./fixture';hydrateRoot(document.getElementById('root'),<Fixture mode={document.documentElement.dataset.defaultTheme}/>,{onRecoverableError:error=>console.error(error)});`)
const report = { result: "fail", serverStorageReads: 0, serverModes: [], hydration: [], errors: [] }
const vite = await createServer({ configFile: false, cacheDir: "node_modules/.vite-ssr-verification", optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true }, appType: "custom", plugins: [(await import("@vitejs/plugin-react")).default()] })
const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage")
try {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { report.serverStorageReads++; throw Error("Server storage must not be read") } })
  const fixture = await vite.ssrLoadModule("/evidence/ssr/server.tsx")
  for (const mode of ["light", "dark", "system"]) {
    const html = fixture.render(mode)
    assert.equal(html, fixture.render(mode), "SSR output is deterministic")
    assert(html.replace(/<!--.*?-->/g, "").includes(`${mode}:${mode === "system" ? "light" : mode}`))
    report.serverModes.push(mode)
    await writeFile(new URL(`${mode}.html`, output), `<!doctype html><html lang="en" data-default-theme="${mode}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><script src="/evenform-init.js" data-theme-key="ssr-theme" data-density-key="ssr-appearance" data-default-theme="${mode}"></script></head><body><main id="root">${html}</main><script type="module" src="./client.tsx"></script></body></html>`)
  }
  assert.equal(report.serverStorageReads, 0)
} finally {
  if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor)
  else delete globalThis.localStorage
  await vite.close()
}
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
try {
  for (const mode of ["system", "light", "dark"]) for (const stored of [null, "light", "dark", "system", "invalid", "blocked"]) {
    const context = await browser.newContext({ colorScheme: "dark", reducedMotion: "reduce" })
    await context.addInitScript(value => {
      if (value === "blocked") Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new DOMException("Denied", "SecurityError") } })
      else if (value !== null) localStorage.setItem("ssr-theme", value)
    }, stored)
    const page = await context.newPage()
    page.on("pageerror", error => report.errors.push(error.message))
    page.on("console", message => { if (message.type() === "error") report.errors.push(message.text()) })
    // Hold hydration so the first-paint bootstrap can be checked independently.
    let release
    const resume = new Promise(resolve => { release = resolve })
    await page.route("**/evidence/ssr/client.tsx", async route => { await resume; await route.continue() })
    await page.goto(`${origin}/evidence/ssr/${mode}.html`, { waitUntil: "commit" })
    await page.locator("#theme-state").waitFor()
    const selected = ["light", "dark", "system"].includes(stored) ? stored : mode
    const resolved = selected === "system" ? "dark" : selected
    assert.equal(await page.locator("html").getAttribute("class"), resolved)
    assert.equal(await page.locator("#theme-state").innerText(), `${mode}:${mode === "system" ? "light" : mode}`)
    release()
    await page.waitForFunction(expected => document.querySelector("#theme-state").textContent === expected, `${selected}:${resolved}`)
    assert.equal(await page.locator("html").getAttribute("class"), resolved)
    await page.waitForFunction(() => document.documentElement.dataset.ssrHydrated === "true")
    await page.getByRole("button", { name: resolved === "dark" ? "Switch to light" : "Switch to dark", exact: true }).click()
    await page.waitForFunction(expected => document.querySelector("#theme-state").textContent === `${expected}:${expected}`, resolved === "dark" ? "light" : "dark")
    await page.getByRole("button", { name: "Use system", exact: true }).click()
    await page.waitForFunction(() => document.querySelector("#theme-state").textContent === "system:dark")
    await page.emulateMedia({ colorScheme: "light" })
    await page.waitForFunction(() => document.querySelector("#theme-state").textContent === "system:light")
    await page.screenshot({ path: new URL(`${mode}-${stored ?? "missing"}.png`, output).pathname })
    report.hydration.push({ mode, stored, firstPaint: resolved, hydration: "matched", systemChange: "tracked" })
    await context.close()
  }
  assert.deepEqual(report.errors, [])
  report.result = "pass"
  console.log(`PASS zero server storage reads; ${report.serverModes.length} SSR snapshots and ${report.hydration.length} hydration/preference cases`)
} finally {
  await writeFile(new URL("report.json", output), JSON.stringify(report, null, 2))
  await browser.close()
}
