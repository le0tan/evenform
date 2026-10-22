import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"
const origin = process.env.EVENFORM_URL || "http://127.0.0.1:4173"
const output = new URL("../evidence/field-feedback/", import.meta.url)
await mkdir(output, { recursive: true })
// The fixture is generated outside application sources and excluded from
// Tailwind's utility scan. Only real component code supplies these utilities.
await writeFile(new URL("fixture.html", output), '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="./fixture.tsx"></script></body></html>')
await writeFile(new URL("fixture.tsx", output), `import React from 'react';import{createRoot}from'react-dom/client';import'../../src/core.css';
import{Button}from'../../src/components/ui/button';import{Badge}from'../../src/components/ui/badge';import{Input}from'../../src/components/ui/input';
import{Select,SelectTrigger,SelectValue}from'../../src/components/ui/select';import{Tabs,TabsList,TabsTrigger,TabsContent}from'../../src/components/ui/tabs';
import{Accordion,AccordionItem,AccordionTrigger,AccordionContent}from'../../src/components/ui/accordion';
const p=new URLSearchParams(location.search);document.documentElement.dataset.density=p.get('density')||'compact';document.documentElement.dataset.controlSize=p.get('size')||'auto';document.documentElement.classList.toggle('dark',p.get('theme')==='dark');
createRoot(document.getElementById('root')).render(<main style={{padding:24}}><div id="controls" style={{display:'flex',alignItems:'center',gap:8}}><Input aria-label="Search"/><Select defaultValue="all"><SelectTrigger><SelectValue/></SelectTrigger></Select><Tabs defaultValue="grid"><TabsList size="control" motion="slide" aria-label="View"><TabsTrigger value="grid" className={()=>'font-medium'}>Grid</TabsTrigger><TabsTrigger value="list">List</TabsTrigger><TabsTrigger value="disabled" disabled>Disabled</TabsTrigger></TabsList><TabsContent value="grid">Grid view</TabsContent><TabsContent value="list">List view</TabsContent></Tabs><Button className={()=>'text-label'}>Create</Button><Badge className="text-label">Ready</Badge></div><Tabs defaultValue="a"><TabsList aria-label="Navigation"><TabsTrigger value="a">Overview</TabsTrigger><TabsTrigger value="b">Activity</TabsTrigger></TabsList></Tabs><p id="outside">Ordinary report text</p><Accordion defaultValue={['report','help']}><AccordionItem value="report"><AccordionTrigger>Report</AccordionTrigger><AccordionContent><p id="inside">Ordinary report text</p><ul><li>Finding</li></ul><h3>Conclusion</h3></AccordionContent></AccordionItem><AccordionItem value="help"><AccordionTrigger>Help</AccordionTrigger><AccordionContent className="text-muted-foreground"><p id="help">Supporting text</p></AccordionContent></AccordionItem></Accordion></main>);
`)
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const report = { matrix: [], interactions: [], errors: [] }
try {
  for (const coarse of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 1381, height: 950 }, hasTouch: coarse, isMobile: coarse, reducedMotion: "no-preference" })
    const page = await context.newPage()
    page.on("pageerror", error => report.errors.push(error.message))
    for (const density of ["compact", "comfortable"]) for (const theme of ["light", "dark"]) for (const size of ["auto", "small", "medium", "large"]) {
      await page.goto(`${origin}/evidence/field-feedback/fixture.html?density=${density}&theme=${theme}&size=${size}`)
      await page.locator("#inside").waitFor()
      const result = await page.evaluate(() => {
        const e = selector => document.querySelector(selector)
        const h = selector => e(selector).getBoundingClientRect().height
        const color = selector => getComputedStyle(e(selector)).color
        return { coarse: matchMedia('(pointer: coarse)').matches,
          input: h('[data-slot="input"]'), select: h('[data-slot="select-trigger"]'),
          list: h('[aria-label="View"]'), trigger: h('[aria-label="View"] [data-slot="tabs-trigger"]'),
          navigation: h('[aria-label="Navigation"]'), button: h('[data-slot="button"]'),
          outside: color('#outside'), inside: color('#inside'), help: color('#help'),
          buttonColor: color('[data-slot="button"]'), badgeColor: color('[data-slot="badge"]'), primaryForeground: getComputedStyle(document.documentElement).getPropertyValue("--primary-foreground").trim(),
          buttonClass: e('[data-slot="button"]').className, badgeClass: e('[data-slot="badge"]').className,
          tabClass: e('[aria-label="View"] [data-slot="tabs-trigger"]').className }
      })
      assert.equal(result.coarse, coarse)
      for (const classes of [result.buttonClass, result.badgeClass]) {
        assert(classes.includes("text-label") && classes.includes("text-primary-foreground"))
      }
      assert(result.tabClass.includes("font-medium") && result.tabClass.includes("data-active:text-primary"))
      assert.equal(result.buttonColor, result.primaryForeground)
      assert.equal(result.badgeColor, result.primaryForeground)
      assert.equal(result.inside, result.outside)
      assert.notEqual(result.help, result.inside)
      if (coarse) assert(result.trigger >= 44 && result.input >= 44 && result.button >= 44)
      else {
        assert.equal(result.list, result.input)
        assert.equal(result.list, result.select)
        assert.equal(result.list, result.button)
        assert.equal(result.navigation, result.input + 8)
      }
      report.matrix.push({density,theme,size,...result})
    }
    await context.close()
  }
  const page = await browser.newPage({ viewport: { width: 1381, height: 950 } })
  await page.goto(`${origin}/evidence/field-feedback/fixture.html`)
  const grid = page.getByRole("tab", { name: "Grid", exact: true })
  const list = page.getByRole("tab", { name: "List", exact: true })
  await grid.press("ArrowRight"); await list.press("Enter")
  assert.equal(await list.getAttribute("aria-selected"), "true")
  await list.press("ArrowRight")
  assert.notEqual(await page.getByRole("tab", { name: "Disabled" }).getAttribute("aria-selected"), "true")
  report.interactions.push("Tabs keyboard navigation and disabled tab")
  await page.getByRole("button", { name: "Report", exact: true }).click()
  await page.locator("#inside").waitFor({state:"hidden"})
  await page.getByRole("button", { name: "Report", exact: true }).click()
  await page.locator("#inside").waitFor({state:"visible"})
  report.interactions.push("Accordion closes and reopens")
  for (const viewport of [1381,768,390,320]) {
    await page.setViewportSize({width:viewport,height:950})
    await page.goto(`${origin}/#patterns/records`)
    await page.getByRole("heading", {name:"Documents",exact:true}).waitFor()
    assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth))
    await page.getByRole("tab",{name:"List",exact:true}).click()
    const record = page.getByRole('tabpanel',{name:'List',exact:true}).locator('.record-browser-item').filter({hasText:"Making complex work"})
    await record.hover()
    assert.notEqual(await record.evaluate(e=>getComputedStyle(e).backgroundColor), "rgba(0, 0, 0, 0)")
    await record.click()
    await page.getByRole("button",{name:"Close report",exact:true}).waitFor()
    const sizes = await page.locator('.record-browser-actions button').evaluateAll(elements=>elements.map(e=>({height:e.getBoundingClientRect().height,y:e.getBoundingClientRect().y})))
    assert.equal(new Set(sizes.map(s=>s.y)).size,1)
    assert.equal(new Set(sizes.map(s=>s.height)).size,1)
    const region = page.getByRole('region',{name:'Findings and recommendations; scroll horizontally for all columns'})
    if (viewport < 640) {
      await region.focus(); await page.keyboard.press('ArrowRight');
      await page.waitForFunction(()=>document.querySelector('.record-report-table').scrollLeft>0)
    }
    await page.keyboard.press('Escape')
    await page.locator('[data-slot="sheet-content"]').waitFor({state:'detached'})
    assert(await record.evaluate(e=>e===document.activeElement))
    await page.getByRole('textbox',{name:'Search documents'}).fill('no-such-document')
    await page.getByRole('heading',{name:'No documents found'}).waitFor()
    await page.getByRole('button',{name:'Clear filters'}).click()
    assert.equal(await page.getByRole('tabpanel',{name:'List',exact:true}).locator('.record-browser-item').count(),4)
    report.interactions.push(`${viewport}px: no page overflow, full-row hover, header alignment, Sheet focus, table scroll, empty reset`)
  }
  assert.deepEqual(report.errors, [])
  console.log(`PASS ${report.matrix.length} theme/density/size/pointer combinations; ${report.interactions.length} interaction groups`)
} finally {
  await writeFile(new URL("checks.json", output), JSON.stringify(report,null,2))
  await browser.close()
}
