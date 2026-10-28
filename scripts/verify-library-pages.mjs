import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const origin = process.env.EVENFORM_URL || "http://127.0.0.1:5173"
const output = new URL("../evidence/library-pages/", import.meta.url)
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const report = { cases: [], failures: [], errors: [] }

try {
  const discovery = await browser.newPage()
  await discovery.goto(origin)
  const routes = await discovery.evaluate(async () => {
    const { showcaseGroups } = await import("/src/playground/showcase-navigation.ts")
    return [
      ...Object.entries({ foundations: "Foundations", appearance: "Appearance lab", workspace: "Workspace", settings: "Settings", dashboard: "Data dashboard", inbox: "Support inbox" }).map(([route, title]) => ({ route, title })),
      ...showcaseGroups.flatMap(group => group.entries.map(entry => ({ route: `${group.page}/${entry.id}`, title: entry.title })))
    ]
  })
  await discovery.close()
  for (const width of [320, 1440]) for (const theme of ["light", "dark"]) for (const density of ["compact", "comfortable"]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, hasTouch: width === 320, reducedMotion: "reduce" })
    await context.addInitScript(({ theme, density }) => {
      localStorage.setItem("evenform-theme", theme)
      localStorage.setItem("evenform-tokens-v1", JSON.stringify({ density, palette: "neutral", overrides: {} }))
    }, { theme, density })
    const page = await context.newPage()
    page.setDefaultTimeout(15000)
    let currentRoute = ""
    page.on("pageerror", error => report.errors.push({ route: currentRoute, width, theme, density, message: error.message }))
    for (const { route, title } of routes) {
      currentRoute = route
      const sample = { route, width, theme, density }
      try {
        const response = await page.goto(`${origin}/#${route}`)
        if (response) assert(response.ok(), `HTTP ${response.status()}`)
        await page.getByRole("heading", { level: 1, name: title, exact: true }).waitFor()
        await page.evaluate(async () => {
          await document.fonts.ready
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        })
        const layout = await page.evaluate(() => ({
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          headings: [...document.querySelectorAll("main h1")].filter(element => element.getClientRects().length).map(element => element.textContent),
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          density: document.documentElement.dataset.density,
          brokenReferences: [...document.querySelectorAll("main [aria-labelledby], main [aria-describedby]")].flatMap(element => {
            if (!element.getClientRects().length) return []
            return ["aria-labelledby", "aria-describedby"].flatMap(attribute => (element.getAttribute(attribute) || "").split(/\s+/).filter(id => id && !document.getElementById(id)).map(id => ({ tag: element.tagName, attribute, id })))
          }),
          overflowing: [...document.querySelectorAll("main *")].filter(element => {
            const rect = element.getBoundingClientRect()
            return rect.width && rect.right > innerWidth + 1 && !element.closest('[data-slot="table-container"], [data-slot="scroll-area"], [data-slot="scroll-area-viewport"]')
          }).slice(0, 8).map(element => ({ tag: element.tagName, className: element.getAttribute("class"), text: element.textContent.slice(0, 80) })),
        }))
        assert.equal(layout.theme, theme)
        assert.equal(layout.density, density)
        assert.equal(layout.headings.length, 1, `Expected one visible page heading: ${layout.headings}`)
        assert.deepEqual(layout.brokenReferences, [], "Accessible labels and descriptions must resolve")
        assert(layout.documentWidth <= width, `Page is ${layout.documentWidth}px wide at ${width}px: ${JSON.stringify(layout.overflowing)}`)
        report.cases.push({ ...sample, heading: layout.headings[0], result: "pass" })
      } catch (error) {
        report.failures.push({ ...sample, message: error.message })
        await page.screenshot({ path: new URL(`${route.replaceAll("/", "-")}-${width}-${theme}-${density}.png`, output).pathname, fullPage: true }).catch(() => {})
      }
    }
    console.log(`${width}px ${theme} ${density}: ${routes.length} pages checked`)
    await context.close()
  }
  assert.deepEqual(report.failures, [])
  assert.deepEqual(report.errors, [])
  report.result = "pass"
} finally {
  await writeFile(new URL("verification.json", output), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(`${report.cases.length} page/theme/density/viewport combinations passed`)
