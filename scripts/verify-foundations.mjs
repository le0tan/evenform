import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const origin = process.env.EVENFORM_URL || "http://127.0.0.1:5173"
const output = new URL("../evidence/design-refresh/", import.meta.url)
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const report = { matrix: [], interactions: [], errors: [] }

async function openFoundations(page) {
  await page.goto(`${origin}/#foundations`)
  await page.locator(".foundations").waitFor()
  await page.evaluate(() => document.fonts.ready)
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(15000)
  page.on("pageerror", error => report.errors.push(error.message))
  await openFoundations(page)
  const foundations = page.locator(".foundations")
  const progress = foundations.getByRole("progressbar", { name: "Tasks completed" })
  const finalTask = foundations.getByRole("checkbox", { name: "Share it with the world" })
  await finalTask.press("Space")
  assert.equal(await finalTask.getAttribute("aria-checked"), "true")
  assert.equal(await progress.getAttribute("aria-valuenow"), "100")
  assert.equal(await foundations.locator(".foundation-progress-count").innerText(), "3 of 3")
  assert.equal(await foundations.locator(".foundation-project [data-slot='badge']").innerText(), "Ready to go")
  await finalTask.press("Space")
  assert.equal(await finalTask.getAttribute("aria-checked"), "false")
  assert.equal(await foundations.locator(".foundation-progress-count").innerText(), "2 of 3")
  report.interactions.push("Keyboard checklist updates progress, count and completion status")

  const email = foundations.getByRole("textbox", { name: "Email address" })
  const submit = foundations.getByRole("button", { name: "Preview invitation" })
  const invitation = foundations.locator('.foundation-invitation [role="status"]')
  await submit.click()
  assert(await email.evaluate(element => element.validity.valueMissing && element === document.activeElement))
  await email.fill("not-an-email")
  await submit.click()
  assert(await email.evaluate(element => element.validity.typeMismatch))
  assert.equal(await invitation.innerText(), "")
  await email.fill("alex@example.com")
  const role = foundations.getByRole("combobox", { name: "Workspace role" })
  await role.press("Space")
  await page.getByRole("option", { name: "Viewer", exact: true }).press("Enter")
  await page.getByRole("listbox").waitFor({ state: "hidden" })
  await page.waitForFunction(() => document.activeElement?.getAttribute("data-slot") === "select-trigger")
  assert(await role.evaluate(element => element === document.activeElement))
  await submit.click()
  assert.match(await invitation.innerText(), /Invitation preview: alex@example.com · Viewer/)
  await email.fill("jamie@example.com")
  assert.equal(await invitation.innerText(), "")
  report.interactions.push("Required/email validation, keyboard role selection and accurate invitation preview")

  const digest = foundations.getByRole("switch", { name: "Daily digest" })
  await digest.press("Space")
  assert.equal(await digest.getAttribute("aria-checked"), "false")
  assert.match(await foundations.locator(".foundation-digest").innerText(), /Daily digest disabled/)
  await foundations.locator("label").filter({ hasText: /^Daily digest$/ }).click()
  assert.equal(await digest.getAttribute("aria-checked"), "true")
  const updates = foundations.getByRole("switch", { name: "Product updates" })
  await updates.press("Space")
  assert.equal(await updates.getAttribute("aria-checked"), "true")
  report.interactions.push("Preference labels and keyboard switches update independently")

  const neutral = foundations.getByRole("radio", { name: "Neutral theme" })
  await neutral.focus()
  await neutral.press("ArrowRight")
  assert(await foundations.getByRole("radio", { name: "Indigo theme" }).isChecked())
  assert.equal(await page.locator("html").getAttribute("data-palette"), "indigo")
  assert(await foundations.getByRole("radio", { name: "Indigo theme" }).evaluate(element => getComputedStyle(element.parentElement).outlineStyle !== "none"))
  await foundations.getByRole("combobox", { name: "Preview density" }).click()
  await page.getByRole("option", { name: "Comfortable", exact: true }).click()
  await page.reload()
  await page.locator(".foundations").waitFor()
  assert.equal(await page.locator("html").getAttribute("data-density"), "comfortable")
  assert.equal(await page.locator("html").getAttribute("data-palette"), "indigo")
  assert(await foundations.getByRole("radio", { name: "Indigo theme" }).isChecked())
  assert.match(await foundations.getByRole("combobox", { name: "Preview density" }).innerText(), /Comfortable/)
  report.interactions.push("Native radio keyboard/focus behavior and palette/density persistence")

  const disclosure = foundations.locator("summary")
  await disclosure.press("Enter")
  assert(await foundations.locator("details").evaluate(element => element.open))
  await disclosure.press("Space")
  assert.equal(await foundations.locator("details").evaluate(element => element.open), false)
  report.interactions.push("Token guide keyboard disclosure")

  // Every destination is exercised from the rendered page, including both CTA links.
  const destinations = [
    [".foundation-intro-actions a[href='#components']", "#components", "Core controls"],
    [".foundation-intro-actions a[href='#appearance']", "#appearance", "Appearance lab"],
    [".foundation-destinations a[href='#components']", "#components", "Core controls"],
    [".foundation-destinations a[href^='#patterns']", null, "Operational review"],
    [".foundation-destinations a[href='#charts']", "#charts", "Advanced charts"],
    [".foundation-text-link[href='#settings']", "#settings", "Settings"],
  ]
  for (const [selector, hash, heading] of destinations) {
    await openFoundations(page)
    const link = page.locator(selector)
    assert.notEqual(await link.getAttribute("role"), "button")
    const destination = hash || await link.getAttribute("href")
    await link.press("Enter")
    await page.waitForFunction(expected => location.hash === expected, destination)
    await page.getByRole("heading", { name: heading, exact: true }).first().waitFor()
  }
  report.interactions.push("All hero, library and settings destinations navigate by keyboard")
  await page.close()

  for (const width of [320, 1440]) for (const density of ["compact", "comfortable"]) for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, hasTouch: width === 320, reducedMotion: "reduce" })
    await context.addInitScript(({ density, theme }) => {
      localStorage.setItem("evenform-theme", theme)
      localStorage.setItem("evenform-tokens-v1", JSON.stringify({ density, overrides: {}, palette: "neutral" }))
    }, { density, theme })
    const matrixPage = await context.newPage()
    matrixPage.setDefaultTimeout(15000)
    matrixPage.on("pageerror", error => report.errors.push(error.message))
    await openFoundations(matrixPage)
    const measurements = await matrixPage.evaluate(() => {
      const rect = element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom } }
      const root = document.documentElement
      const title = document.querySelector(".foundation-project h3")
      const badge = document.querySelector(".foundation-project [data-slot='badge']")
      const target = document.querySelector(".foundation-destinations a")
      const interactive = [...document.querySelectorAll(".foundations input:not([type='hidden']), .foundations button, .foundations a, .foundations summary")].filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== "hidden")
      return {
        scrollWidth: root.scrollWidth, viewport: innerWidth,
        density: root.dataset.density, dark: root.classList.contains("dark"),
        title: rect(title), badge: rect(badge), titleScroll: title.scrollWidth, titleClient: title.clientWidth,
        avatars: [...document.querySelectorAll(".foundation-avatars span")].map(rect),
        paletteTargets: [...document.querySelectorAll(".foundation-palette")].map(rect),
        outOfBounds: interactive.map(element => ({ name: element.getAttribute("aria-label") || element.textContent, ...rect(element) })).filter(r => r.x < -1 || r.right > innerWidth + 1),
        transitionDuration: getComputedStyle(target).transitionDuration,
      }
    })
    report.matrix.push({ width, density, theme, ...measurements })
    assert.equal(measurements.density, density)
    assert.equal(measurements.dark, theme === "dark")
    assert(measurements.scrollWidth <= width, `${width}/${density}/${theme}: page overflow`)
    assert.deepEqual(measurements.outOfBounds, [], `${width}/${density}/${theme}: controls outside viewport`)
    assert(measurements.titleScroll <= measurements.titleClient + 1, "Project heading must not clip")
    const { title, badge } = measurements
    assert(title.bottom <= badge.y || badge.bottom <= title.y || title.right <= badge.x || badge.right <= title.x, "Project badge must not overlap its title")
    assert(measurements.avatars.every(r => r.width >= 24 && r.height >= 24), "Team avatars must retain their intended circle size")
    if (width === 320) assert(measurements.paletteTargets.every(r => r.width >= 44 && r.height >= 44), "Touch palette targets must be at least 44px")
    assert(measurements.transitionDuration.split(",").every(duration => parseFloat(duration) <= 0.001), "Reduced motion keeps transitions effectively instant")
    await matrixPage.locator(".foundation-token-guide summary").press("Enter")
    assert(await matrixPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Expanded token guide must not overflow")
    // Full-page captures place fixed chrome relative to the current scroll offset.
    await matrixPage.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0) })
    await matrixPage.waitForFunction(() => scrollY === 0)
    await matrixPage.screenshot({ path: new URL(`foundations-${width}-${density}-${theme}.png`, output).pathname, fullPage: true })
    await context.close()
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  throw error
} finally {
  await writeFile(new URL("foundations-report.json", output), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(`Foundations: ${report.interactions.length} interaction groups and ${report.matrix.length} responsive/theme/density combinations passed.`)
