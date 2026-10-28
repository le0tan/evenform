import assert from "node:assert/strict"
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const origin = process.env.EVENFORM_URL || "http://127.0.0.1:5173"
const output = new URL("../evidence/overlay-quality/", import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL("fixture.html", output), '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="./fixture.tsx"></script></body></html>')
await writeFile(new URL("fixture.tsx", output), `
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {DirectionProvider} from '@base-ui/react/direction-provider';
import '../../src/index.css';
import {Button} from '../../src/components/ui/button';
import {SidebarProvider,Sidebar,SidebarTrigger,SidebarContent,SidebarMenu,SidebarMenuItem,SidebarMenuButton,SidebarMenuAction,SidebarGroupAction,SidebarRail,SidebarMenuSkeleton} from '../../src/components/ui/sidebar';
import {AlertDialog,AlertDialogTrigger,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogCancel} from '../../src/components/ui/alert-dialog';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription} from '../../src/components/ui/dialog';
import {Sheet,SheetTrigger,SheetContent,SheetTitle,SheetDescription,SheetBody} from '../../src/components/ui/sheet';
import {TooltipProvider,Tooltip,TooltipTrigger,TooltipContent} from '../../src/components/ui/tooltip';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,DropdownMenuCheckboxItem} from '../../src/components/ui/dropdown-menu';
import {ContextMenu,ContextMenuTrigger,ContextMenuContent,ContextMenuItem} from '../../src/components/ui/context-menu';
import {Popover,PopoverTrigger,PopoverContent,PopoverTitle,PopoverClose} from '../../src/components/ui/popover';
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from '../../src/components/ui/accordion';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '../../src/components/ui/tabs';
import {CopyButton} from '../../src/components/ui/copy-button';
import {Countdown} from '../../src/components/ui/countdown';
import {PaginationControls} from '../../src/components/ui/pagination';
const query = new URLSearchParams(location.search);
document.documentElement.dir = query.get('dir') || 'ltr';
document.documentElement.dataset.density = query.get('density') || 'compact';
document.documentElement.classList.toggle('dark',query.get('theme') === 'dark');
window.audit = {submits:0,notifications:[],copies:0,completed:0,actions:[]};
const longText = 'workspace_0123456789_abcdefghijklmnopqrstuvwxyz_'.repeat(8);
function Fixture(){const [checked,setChecked]=useState(false);const [running,setRunning]=useState(false);const [target]=useState(()=>Date.now()+1500);return <DirectionProvider direction={document.documentElement.dir}><TooltipProvider delay={0}>
<form onSubmit={e=>{e.preventDefault();window.audit.submits++}}>
<SidebarProvider onOpenChange={open=>window.audit.notifications.push(open)} style={{minHeight:0}}>
 <SidebarTrigger aria-label="Navigation toggle" style={{position:'fixed',insetInlineEnd:16,top:8,zIndex:40}} />
 <Sidebar dir="rtl" data-testid="review-sidebar" className="review-sidebar" style={{'--review-sidebar-prop':'preserved'}}><SidebarContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton onClick={()=>window.audit.actions.push('menu')}>Sidebar item</SidebarMenuButton><SidebarMenuAction aria-label="Item action">+</SidebarMenuAction></SidebarMenuItem></SidebarMenu><SidebarGroupAction aria-label="Group action">+</SidebarGroupAction><SidebarMenuSkeleton /></SidebarContent><SidebarRail /></Sidebar>
</SidebarProvider></form>
<main style={{padding:24,marginInlineStart:250,display:'grid',gap:16}}>
<AlertDialog><AlertDialogTrigger render={<Button/>}>Open alert</AlertDialogTrigger><AlertDialogContent><AlertDialogTitle>Confirm action</AlertDialogTitle><AlertDialogDescription>This dialog stays centered in either direction.</AlertDialogDescription><AlertDialogCancel>Cancel alert</AlertDialogCancel></AlertDialogContent></AlertDialog>
<Dialog><DialogTrigger render={<Button/>}>Open dialog</DialogTrigger><DialogContent><DialogTitle>Review dialog</DialogTitle><DialogDescription>Escape restores focus.</DialogDescription><input aria-label="Dialog input" /></DialogContent></Dialog>
<Sheet><SheetTrigger render={<Button/>}>Open sheet</SheetTrigger><SheetContent><SheetTitle>Review sheet</SheetTitle><SheetDescription>Scrollable content.</SheetDescription><SheetBody>{Array.from({length:40},(_,i)=><p key={i}>Row {i+1}</p>)}<Button>Last row action</Button></SheetBody></SheetContent></Sheet>
<Tooltip><TooltipTrigger render={<Button/>}>Long tooltip</TooltipTrigger><TooltipContent>{longText}</TooltipContent></Tooltip>
<DropdownMenu><DropdownMenuTrigger render={<Button/>}>Open menu</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem disabled>Unavailable action</DropdownMenuItem><DropdownMenuItem onClick={()=>window.audit.actions.push('menu-choice')}>Available action</DropdownMenuItem><DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked} closeOnClick={false}>Keep menu open</DropdownMenuCheckboxItem><DropdownMenuItem>{longText}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
<ContextMenu><ContextMenuTrigger tabIndex={0}>Context target</ContextMenuTrigger><ContextMenuContent><ContextMenuItem>Context action</ContextMenuItem></ContextMenuContent></ContextMenu>
<Popover><PopoverTrigger render={<Button/>}>Open popover</PopoverTrigger><PopoverContent><PopoverTitle>Review popover</PopoverTitle><PopoverClose render={<Button/>}>Close popover</PopoverClose></PopoverContent></Popover>
<Accordion><AccordionItem value="one"><AccordionTrigger>Open details</AccordionTrigger><AccordionContent>Disclosure content</AccordionContent></AccordionItem><AccordionItem value="disabled" disabled><AccordionTrigger>Unavailable details</AccordionTrigger><AccordionContent>Hidden content</AccordionContent></AccordionItem></Accordion>
<Tabs defaultValue="first"><TabsList aria-label="Review tabs" motion="slide"><TabsTrigger value="first">First tab</TabsTrigger><TabsTrigger value="disabled" disabled>Disabled tab</TabsTrigger><TabsTrigger value="last">Last tab</TabsTrigger></TabsList><TabsContent value="first">First content</TabsContent><TabsContent value="last">Last content</TabsContent></Tabs>
<CopyButton value="example" writeText={()=>{window.audit.copies++;return new Promise((resolve,reject)=>{window.audit.resolveCopy=resolve;window.audit.rejectCopy=reject})}} />
<Countdown target={target} running={running} onComplete={()=>window.audit.completed++}/><Button onClick={()=>setRunning(value=>!value)}>Toggle timer</Button>
<PaginationControls aria-label="Invalid pagination" page={Infinity} pageCount={Infinity} onPageChange={()=>{}}/>
</main></TooltipProvider></DirectionProvider>};createRoot(document.getElementById('root')).render(<Fixture/>);
`)

const report = { result: "fail", checks: [], errors: [] }
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const check = (name, condition) => { assert(condition, name); report.checks.push(name); console.log("PASS", name) }
try {
  for (const dir of ["ltr", "rtl"]) for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width: 1100, height: 900 }, reducedMotion: theme === "dark" ? "reduce" : "no-preference" })
    const page = await context.newPage()
    page.on("pageerror", error => report.errors.push(error.message))
    await page.goto(`${origin}/evidence/overlay-quality/fixture.html?dir=${dir}&theme=${theme}&density=${theme === "dark" ? "comfortable" : "compact"}`)
    const toggle = page.getByRole("button", { name: "Navigation toggle" })
    await toggle.waitFor()
    await page.getByRole("button", { name: "Sidebar item", exact: true }).click()
    // Native helper controls remain ordinary buttons even inside a form.
    check(`${dir}/${theme}: sidebar buttons do not submit`, await page.evaluate(() => window.audit.submits === 0))
    check(`${dir}/${theme}: helper button types`, await page.locator('[data-slot="sidebar-menu-button"],[data-slot="sidebar-menu-action"],[data-slot="sidebar-group-action"],[data-slot="sidebar-rail"]').evaluateAll(elements => elements.every(element => element.type === "button")))
    await toggle.click()
    check(`${dir}/${theme}: uncontrolled callback remains functional`, await toggle.getAttribute("aria-expanded") === "false" && await page.evaluate(() => window.audit.notifications.at(-1) === false))
    check(`${dir}/${theme}: offscreen sidebar is inert`, await page.locator('[data-slot="sidebar-inner"]').evaluate(element => element.inert))
    await toggle.press("Tab")
    check(`${dir}/${theme}: keyboard skips collapsed content`, await page.evaluate(() => !document.activeElement.closest('[data-slot="sidebar-container"]')))
    const rail = page.locator('[data-slot="sidebar-rail"]')
    await rail.evaluate(element => Promise.all(element.parentElement.parentElement.getAnimations().map(animation => animation.finished)))
    const railBox = await rail.boundingBox()
    await page.mouse.click(Math.max(2, railBox.x + railBox.width - 3), 300)
    check(`${dir}/${theme}: collapsed edge rail reopens sidebar`, await toggle.getAttribute("aria-expanded") === "true")
    check(`${dir}/${theme}: expanded sidebar restores interaction and direction`, await page.locator('[data-slot="sidebar-inner"]').evaluate(element => !element.inert && element.parentElement.dir === "rtl"))

    const alertTrigger = page.getByRole("button", { name: "Open alert", exact: true })
    await alertTrigger.click()
    const alert = page.getByRole("alertdialog")
    await alert.waitFor()
    await alert.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)))
    const box = await alert.boundingBox()
    check(`${dir}/${theme}: alert stays horizontally centered`, Math.abs(box.x + box.width / 2 - 550) < 2)
    await page.screenshot({ path: new URL(`${dir}-${theme}-alert.png`, output).pathname })
    await page.getByRole("button", { name: "Cancel alert" }).click()
    await alert.waitFor({ state: "hidden" })
    check(`${dir}/${theme}: alert restores focus`, await alertTrigger.evaluate(element => document.activeElement === element))

    for (const [trigger, slot] of [["Open dialog", "dialog-content"], ["Open sheet", "sheet-content"], ["Open popover", "popover-content"]]) {
      const button = page.getByRole("button", { name: trigger, exact: true })
      await button.click()
      const popup = page.locator(`[data-slot="${slot}"]`)
      await popup.waitFor()
      if (slot === "dialog-content") {
        for (let index = 0; index < 3; index++) await page.keyboard.press("Tab")
        check(`${dir}/${theme}: dialog contains keyboard focus`, await popup.evaluate(element => element.contains(document.activeElement)))
      }
      if (slot === "sheet-content") {
        await popup.getByRole("button", { name: "Last row action" }).focus()
        check(`${dir}/${theme}: SheetBody scrolls focused content into view`, await popup.getByRole("button", { name: "Last row action" }).evaluate(element => {
          const item = element.getBoundingClientRect(), body = element.closest('[data-slot="sheet-body"]').getBoundingClientRect()
          return item.top >= body.top && item.bottom <= body.bottom + 1
        }))
      }
      await page.keyboard.press("Escape")
      await popup.waitFor({ state: "hidden" })
      check(`${dir}/${theme}: ${slot} Escape and focus`, await button.evaluate(element => document.activeElement === element))
    }
    await page.getByRole("button", { name: "Open menu", exact: true }).press("ArrowDown")
    const available = page.getByRole("menuitem", { name: "Available action", exact: true })
    await available.waitFor()
    check(`${dir}/${theme}: menu skips disabled first item`, await available.evaluate(element => element.hasAttribute("data-highlighted")))
    await page.getByRole("menuitemcheckbox").click()
    check(`${dir}/${theme}: checkbox menu remains open`, await page.getByRole("menuitemcheckbox").getAttribute("aria-checked") === "true")
    check(`${dir}/${theme}: long menu identifier wraps`, await page.locator('[data-slot="dropdown-menu-content"]').evaluate(element => element.scrollWidth <= element.clientWidth + 1))
    await page.keyboard.press("Escape")
    await page.getByText("Context target", { exact: true }).press("Shift+F10")
    await page.getByRole("menuitem", { name: "Context action" }).waitFor()
    await page.keyboard.press("Escape")
    check(`${dir}/${theme}: context keyboard path`, await page.getByText("Context target", { exact: true }).evaluate(element => document.activeElement === element))
    await page.getByRole("button", { name: "Open details", exact: true }).click()
    await page.getByText("Disclosure content", { exact: true }).waitFor()
    check(`${dir}/${theme}: disabled accordion contract`, await page.getByRole("button", { name: "Unavailable details", exact: true }).isDisabled())
    await page.getByRole("tab", { name: "First tab", exact: true }).press(dir === "rtl" ? "ArrowLeft" : "ArrowRight")
    await page.getByRole("tab", { name: "Last tab", exact: true }).press("Tab")
    check(`${dir}/${theme}: focused tab panel is visible`, await page.getByRole("tabpanel").evaluate(element => document.activeElement === element && parseFloat(getComputedStyle(element).outlineWidth) >= 2))
    await page.getByRole("button", { name: "Copy", exact: true }).click()
    await page.getByRole("button", { name: "Copy", exact: true }).press("Enter")
    check(`${dir}/${theme}: copy deduplicates pending keyboard actions`, await page.evaluate(() => window.audit.copies === 1))
    await page.evaluate(() => window.audit.rejectCopy(new Error("Clipboard unavailable")))
    await page.getByRole("button", { name: "Retry copy", exact: true }).waitFor()
    await page.getByRole("button", { name: "Retry copy", exact: true }).click()
    await page.evaluate(() => window.audit.resolveCopy())
    await page.getByRole("button", { name: "Copied", exact: true }).waitFor()
    check(`${dir}/${theme}: copy retry succeeds`, await page.evaluate(() => window.audit.copies === 2))
    check(`${dir}/${theme}: invalid pagination normalizes`, await page.getByRole("navigation", { name: "Invalid pagination" }).textContent() === "1")
    const countdown = page.getByRole("timer")
    const pausedTime = await countdown.textContent()
    await page.clock.install()
    await page.clock.fastForward(3000)
    check(`${dir}/${theme}: paused countdown retains remaining time`, await countdown.textContent() === pausedTime && await page.evaluate(() => window.audit.completed === 0))
    await page.getByRole("button", { name: "Toggle timer", exact: true }).click()
    await page.clock.runFor(1700)
    await page.clock.fastForward(3000)
    check(`${dir}/${theme}: resumed countdown completes once`, await page.evaluate(() => window.audit.completed === 1))
    await page.setViewportSize({ width: 320, height: 740 })
    await page.locator('main').evaluate(element => element.style.marginInlineStart = "0")
    await page.keyboard.press("Tab")
    await page.getByRole("button", { name: "Long tooltip", exact: true }).focus()
    const tooltip = page.locator('[data-slot="tooltip-content"][data-open]')
    await tooltip.waitFor()
    const tooltipBox = await tooltip.boundingBox()
    check(`${dir}/${theme}: narrow long tooltip fits viewport`, tooltipBox.x >= -1 && tooltipBox.x + tooltipBox.width <= 321 && await tooltip.evaluate(element => element.scrollWidth <= element.clientWidth + 1))
    await page.keyboard.press("Escape")
    await toggle.click()
    await page.locator('[data-mobile="true"]').waitFor()
    check(`${dir}/${theme}: mobile sidebar remains modal`, await page.getByRole("dialog", { name: "Sidebar", exact: true }).count() === 1)
    check(`${dir}/${theme}: mobile sidebar forwards DOM and style props`, await page.getByTestId("review-sidebar").evaluate(element => element.classList.contains("review-sidebar") && getComputedStyle(element).getPropertyValue("--review-sidebar-prop").trim() === "preserved"))
    await page.keyboard.press("Escape")
    await page.locator('[data-mobile="true"]').waitFor({ state: "hidden" })
    await context.close()
  }
  check("No browser errors", report.errors.length === 0)
  report.result = "pass"
} finally {
  await writeFile(new URL("report.json", output), JSON.stringify(report, null, 2))
  await browser.close()
}
