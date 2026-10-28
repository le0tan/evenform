import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const origin = process.env.EVENFORM_URL || "http://127.0.0.1:5173"
const output = new URL("../evidence/control-resilience/", import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL("fixture.html", output), `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="./fixture.tsx"></script></body></html>`)
await writeFile(new URL("fixture.css", output), '@import "../../src/index.css"; @source inline("hidden flex");')
await writeFile(new URL("fixture.tsx", output), `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './fixture.css';
import { OptionSelect } from '../../src/components/ui/option-select';
import { Select, SelectTrigger, SelectValue } from '../../src/components/ui/select';
import { Textarea } from '../../src/components/ui/textarea';
import { SearchField } from '../../src/components/ui/search-field';
import { PasswordInput } from '../../src/components/ui/password-input';
const query = new URLSearchParams(location.search);
document.documentElement.classList.toggle('dark', query.get('theme') === 'dark');
document.documentElement.dataset.density = query.get('density');
const options = [
  { value: 'global', label: 'Worldwide enterprise workspace with regional access and reporting permissions' },
  { value: 'disabled', label: 'Unavailable workspace', disabled: true },
  { value: 'identifier', label: 'workspace_0123456789_abcdefghijklmnopqrstuvwxyz_0123456789_abcdefghijklmnopqrstuvwxyz' },
];
function Fixture() {
  const [value, setValue] = useState('global');
  const [search, setSearch] = useState('Unrecognised project');
  return <main style={{padding: 16}}><div id="controls" style={{display:'grid', gap: 16, width:'min(100%, 18rem)'}}>
    <label htmlFor="workspace">Workspace</label>
    <OptionSelect options={options} value={value} onValueChange={setValue} triggerProps={{id:'workspace'}} />
    <output aria-label="Chosen workspace">{value}</output>
    <label htmlFor="team">Team</label>
    <OptionSelect defaultValue="design" options={[{value:'design',label:<><svg aria-hidden="true" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="currentColor" /></svg><span>Design team</span></>}]} triggerProps={{id:'team'}} />
    <Select defaultValue="design"><SelectTrigger aria-label="Hidden value override"><SelectValue className="hidden">Design team</SelectValue></SelectTrigger></Select>
    <Select defaultValue="design"><SelectTrigger aria-label="Flex value override"><SelectValue className="flex">Design team</SelectValue></SelectTrigger></Select>
    <label htmlFor="notes">Notes</label>
    <Textarea id="notes" defaultValue="Notes stay within the form when resized." />
    <SearchField aria-label="Project search" aria-invalid="true" value={search} onValueChange={setSearch} />
    <PasswordInput aria-label="Password" aria-invalid="true" defaultValue="example-password" />
  </div></main>;
}
createRoot(document.getElementById('root')).render(<Fixture />);
`)

const report = { result: "fail", cases: [], errors: [] }
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
try {
  for (const width of [320, 1280]) for (const theme of ["light", "dark"]) for (const density of ["compact", "comfortable"]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width === 320, hasTouch: width === 320 })
    const page = await context.newPage()
    page.on("pageerror", error => report.errors.push(error.message))
    await page.goto(`${origin}/evidence/control-resilience/fixture.html?theme=${theme}&density=${density}`)
    const select = page.getByRole("combobox", { name: "Workspace", exact: true })
    await select.waitFor()
    const trigger = await select.evaluate(element => {
      const value = element.querySelector('[data-slot="select-value"]')
      return { width: element.getBoundingClientRect().width, container: element.parentElement.clientWidth, height: element.getBoundingClientRect().height, truncates: getComputedStyle(value).textOverflow, overflowingValue: value.scrollWidth > value.clientWidth }
    })
    assert(trigger.width <= trigger.container, "Long selected labels must not widen the form")
    assert.equal(trigger.truncates, "ellipsis")
    assert(trigger.overflowingValue, "Fixture must actually exercise a truncated label")
    assert.equal(trigger.height, width === 320 ? 44 : density === "compact" ? 32 : 40)
    const richLabel = await page.getByRole("combobox", { name: "Team", exact: true }).evaluate(element => {
      const value = element.querySelector('[data-slot="select-value"]')
      const icon = value.querySelector('svg').getBoundingClientRect()
      const text = value.querySelector('span').getBoundingClientRect()
      const box = value.getBoundingClientRect()
      return { height: element.getBoundingClientRect().height, valueHeight: box.height, iconCenter: icon.top + icon.height / 2, textCenter: text.top + text.height / 2, iconRight: icon.right, textLeft: text.left, display: getComputedStyle(value).display, clipped: value.scrollHeight > value.clientHeight }
    })
    assert.equal(richLabel.height, trigger.height, "Rich labels must retain the same control height")
    assert.equal(richLabel.display, "flex")
    assert(richLabel.valueHeight <= richLabel.height - 2, "Rich labels must fit inside the trigger borders")
    assert(Math.abs(richLabel.iconCenter - richLabel.textCenter) < 1, "Rich label icons and text must align on one row")
    assert(richLabel.textLeft > richLabel.iconRight, "Rich labels must preserve the icon/text gap")
    assert.equal(richLabel.clipped, false, "Rich labels must not clip vertically")
    for (const [name, display] of [["Hidden value override", "none"], ["Flex value override", "flex"]]) {
      const valueDisplay = await page.getByRole("combobox", { name, exact: true }).locator('[data-slot="select-value"]').evaluate(element => getComputedStyle(element).display)
      assert.equal(valueDisplay, display, "Caller display utilities must override SelectValue defaults")
    }

    await select.press("Space")
    await page.getByRole("option").first().waitFor()
    const menu = await page.locator('[data-slot="select-content"]').evaluate(element => ({
      width: element.getBoundingClientRect().width,
      viewport: innerWidth,
      options: [...element.querySelectorAll('[data-slot="select-item"]')].filter(item => !item.hasAttribute('data-disabled')).map(item => {
        const label = item.firstElementChild
        return { width: label.clientWidth, scrollWidth: label.scrollWidth, height: label.clientHeight, lineHeight: parseFloat(getComputedStyle(label).lineHeight) }
      }),
    }))
    assert(menu.width <= menu.viewport, "Options must fit in the viewport")
    for (const option of menu.options) {
      assert(option.scrollWidth <= option.width + 1, "Option labels must remain fully readable")
      assert(option.height > option.lineHeight, "Long labels must wrap instead of being clipped")
    }
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    assert.equal(await page.getByLabel("Chosen workspace").textContent(), "global", "Disabled options must not become selected")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await page.locator('[data-slot="select-content"]').waitFor({ state: "hidden" })
    assert.equal(await page.getByLabel("Chosen workspace").textContent(), "identifier", "Keyboard users must be able to choose the full long label")
    await page.waitForFunction(() => document.activeElement?.id === "workspace")

    assert.equal(await page.getByRole("textbox", { name: "Notes" }).evaluate(element => getComputedStyle(element).resize), "vertical")
    for (const name of ["Project search", "Password"]) {
      const field = page.getByLabel(name, { exact: true })
      await field.focus()
      const feedback = await field.evaluate(element => {
        const style = getComputedStyle(element.closest('[data-slot="input-group"]'))
        return { outline: style.outlineColor, border: style.borderColor, width: parseFloat(style.outlineWidth) }
      })
      assert(feedback.width > 0)
      assert.equal(feedback.outline, feedback.border, "Invalid grouped fields must keep their error feedback when focused")
    }
    await page.screenshot({ path: new URL(`${width}-${theme}-${density}.png`, output).pathname, fullPage: true })
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Page must not overflow horizontally")
    report.cases.push({ width, theme, density, trigger, richLabel, menu })
    await context.close()
  }
  assert.deepEqual(report.errors, [])
  report.result = "pass"
  console.log(JSON.stringify({ result: report.result, cases: report.cases.length, errors: report.errors }))
} finally {
  await writeFile(new URL("verification.json", output), JSON.stringify(report, null, 2))
  await browser.close()
}
