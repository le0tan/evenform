import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const origin = process.env.EVENFORM_URL || 'http://127.0.0.1:5173'
const output = new URL('../evidence/data-media/', import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL('fixture.html', output), '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="./fixture.tsx"></script></body></html>')
await writeFile(new URL('fixture.tsx', output), `
import React from 'react';import{createRoot}from'react-dom/client';import'../../src/index.css';
import{Image}from'../../src/components/ui/image';
import{CodeBlock}from'../../src/components/ui/code-block';
import{Carousel,CarouselContent,CarouselItem,CarouselPrevious,CarouselNext,CarouselPosition}from'../../src/components/ui/carousel';
import{RichTextEditor}from'../../src/components/ui/rich-text-editor';
import{Dialog,DialogTrigger,DialogContent,DialogTitle}from'../../src/components/ui/dialog';
import{Button}from'../../src/components/ui/button';
import{ExpandableText}from'../../src/components/ui/expandable-text';
import{EditableText}from'../../src/components/ui/editable-text';
import{ResizeBox}from'../../src/components/ui/resize-box';
import{VirtualList}from'../../src/components/ui/virtual-list';
import{ImagePreview}from'../../src/components/ui/image-preview';
import{Tree,TreeItem,TreeItemContent,TreeRow}from'../../src/components/ui/tree';
const image='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="#64748b"/></svg>');
const carouselReady=api=>window.carousel=api;
function Fixture(){return <main style={{padding:24,maxWidth:760,display:'grid',gap:24}}>
<Image src="/missing-audit-image.png" alt="Unavailable landscape" style={{width:240,height:160}} containerProps={{style:{justifySelf:"start"}}}/>
<Image src={image} alt="Landscape" style={{width:240,height:160}} containerProps={{style:{justifySelf:"start"}}}/>
<CodeBlock code="const value = 42" filename="example.ts" language="TypeScript"/>
<Carousel aria-label="Sample slides" setApi={carouselReady} opts={{duration:60}}><CarouselContent>{[1,2,3].map(n=><CarouselItem key={n}><div style={{height:120,background:'var(--muted)',padding:24}}>Slide {n}</div></CarouselItem>)}</CarouselContent><div style={{display:'flex',gap:8,marginTop:8}}><CarouselPrevious/><CarouselPosition/><CarouselNext/></div></Carousel>
<Dialog><DialogTrigger render={<Button/>}>Edit document</DialogTrigger><DialogContent><DialogTitle>Document</DialogTitle><RichTextEditor label="Document body"/></DialogContent></Dialog>
<ExpandableText lines={2}>{'Long content remains readable when expanded. '.repeat(30)}</ExpandableText>
<EditableText label="Project name" defaultValue="Atlas" validate={value=>value.trim()?'':'Enter a name.'}/>
<ResizeBox label="Preview" defaultSize={{width:280,height:160}} minWidth={160} maxWidth={320}><p>Resizable content</p></ResizeBox>
<VirtualList label="Records" estimateSize={40} items={Array.from({length:200},(_,id)=>({id}))} getItemKey={item=>item.id} renderItem={item=><button style={{height:40}}>{'Record '+item.id}</button>}/>
<Tree aria-label="Files" selectionMode="multiple"><TreeItem id="root" textValue="Folder"><TreeItemContent>{state=><TreeRow {...state} selectionMode="multiple">Folder</TreeRow>}</TreeItemContent><TreeItem id="child" textValue="Document"><TreeItemContent>{state=><TreeRow {...state} selectionMode="multiple">Document</TreeRow>}</TreeItemContent></TreeItem></TreeItem></Tree>
<ImagePreview trigger={<Button>Preview images</Button>} images={[{src:image,alt:'First landscape'},{src:image,alt:'Second landscape'}]}/>
</main>};createRoot(document.getElementById('root')).render(<Fixture/>);
`)
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined })
const report = { result: 'fail', checks: [], matrix: [], errors: [] }
const check = (name, value) => { assert(value, name); report.checks.push(name) }
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, reducedMotion: 'reduce' })
  page.on('pageerror', error => report.errors.push(error.message))
  await page.goto(`${origin}/evidence/data-media/fixture.html`)
  await page.waitForFunction(() => window.carousel && document.querySelector('[data-status="error"]'))
  const failedImage = page.locator('[data-slot="image"][data-status="error"]')
  const box = await failedImage.boundingBox()
  check('Failed image preserves native image dimensions for its visible fallback', box.width === 240 && box.height === 160)
  check('Failed image has one accessible image alternative', await failedImage.getByRole('img', { name: 'Image unavailable: Unavailable landscape' }).count() === 1)
  check('Successful image loads', await page.locator('[data-slot="image"][data-status="loaded"]').count() === 1)

  const carouselAtRest = () => page.evaluate(() => {
    const engine = window.carousel.internalEngine()
    return Math.abs(engine.location.get() - engine.target.get()) < 0.01
  })
  await page.getByRole('button', { name: 'Next slide' }).click()
  check('Reduced-motion pointer navigation reaches its target immediately', await carouselAtRest())
  await page.locator('[data-slot="carousel-viewport"]').press('ArrowRight')
  check('Reduced-motion keyboard navigation reaches final slide immediately', await carouselAtRest() && await page.getByRole('button', { name: 'Next slide' }).isDisabled())
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.locator('[data-slot="carousel"]').evaluate(element => element.dataset.motion = 'reduce')
  await page.getByRole('button', { name: 'Previous slide' }).click()
  check('Local reduced-motion navigation reaches its target immediately', await carouselAtRest())
  await page.locator('[data-slot="carousel"]').evaluate(element => delete element.dataset.motion)
  await page.getByRole('button', { name: 'Previous slide' }).click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForFunction(() => { const engine = window.carousel.internalEngine(); return Math.abs(engine.location.get() - engine.target.get()) < 0.01 })
  check('Enabling reduced motion settles an in-progress carousel', true)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.getByRole('button', { name: 'Next slide' }).click()
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await page.locator('main').evaluate(element => element.dataset.motion = 'reduce')
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  check('Ancestor local reduction settles an in-progress carousel', await carouselAtRest())
  await page.locator('main').evaluate(element => delete element.dataset.motion)
  await page.emulateMedia({ reducedMotion: 'reduce' })

  await page.getByRole('button', { name: 'Edit document' }).click()
  await page.setViewportSize({width:390,height:900})
  await page.getByRole('button', { name: 'Edit link', exact: true }).click()
  const url = page.getByRole('textbox', { name: 'Link URL' })
  check('Link editor fits the narrow dialog', await page.getByRole('dialog').evaluate(element => element.scrollWidth <= element.clientWidth))
  await url.fill('bad')
  await url.press('Enter')
  check('Link validation exposes an actionable error', await url.getAttribute('aria-invalid') === 'true')
  await url.fill('https://example.com')
  check('Editing a URL clears stale validation', await url.getAttribute('aria-invalid') !== 'true')
  await url.press('Escape')
  check('Escape closes link editing and preserves its parent dialog', await page.getByRole('dialog').count() === 1 && await url.count() === 0)
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Document body')
  check('Escape restores editor focus', await page.getByRole('textbox', { name: 'Document body' }).evaluate(element => element === document.activeElement))
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Show more' }).click()
  check('Expandable content announces its expanded state', await page.getByRole('button', { name: 'Show less' }).getAttribute('aria-expanded') === 'true')
  await page.getByRole('button', { name: 'Show less' }).click()
  await page.getByRole('button', { name: 'Edit: Project name' }).click()
  await page.getByRole('textbox', { name: 'Project name' }).fill('')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  check('Editable text retains invalid draft and reports validation', await page.getByRole('alert').innerText() === 'Enter a name.')
  await page.getByRole('textbox', { name: 'Project name' }).fill('Updated')
  await page.getByRole('textbox', { name: 'Project name' }).press('Enter')
  check('Editable text commits and restores trigger focus', await page.getByRole('button', { name: 'Edit: Project name' }).evaluate(element => element === document.activeElement))
  await page.getByRole('separator', { name: 'Preview: width, right edge' }).press('End')
  await page.waitForFunction(() => Math.round(document.querySelector('[data-slot="resize-box"]').getBoundingClientRect().width) === 320)
  check('Resize keyboard respects maximum width', Math.round((await page.locator('[data-slot="resize-box"]').boundingBox()).width) === 320)
  await page.getByRole('button', { name: 'Record 0', exact: true }).focus()
  await page.getByRole('region', { name: 'Records' }).evaluate(element => element.scrollTop = 4000)
  await page.waitForFunction(() => document.querySelector('[data-virtual-index="100"]'))
  check('Virtualized scrolling preserves the focused row', await page.getByRole('button', { name: 'Record 0', exact: true }).evaluate(element => element === document.activeElement))
  await page.getByRole('row', { name: 'Folder', exact: true }).press('ArrowRight')
  check('Tree expansion exposes nested content', await page.getByRole('row', { name: /Document/ }).count() === 1)
  await page.getByRole('button', { name: 'Preview images' }).click()
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  check('Image preview navigates and announces position', await page.getByRole('status').filter({ hasText: '2 of 2' }).count() === 1)
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
  check('Image preview zoom enables a keyboard pannable stage', await page.locator('[data-zoomed]').getAttribute('tabindex') === '0')
  await page.keyboard.press('Escape')
  for (const width of [1000, 390]) for (const theme of ['light', 'dark']) for (const density of ['compact', 'comfortable']) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(({ theme, density }) => { document.documentElement.classList.toggle('dark', theme === 'dark'); document.documentElement.dataset.density = density }, { theme, density })
    const contrast = await page.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1
      const context = canvas.getContext('2d', { willReadFrequently: true })
      const rgb = color => { context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1); return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3) }
      const luminance = color => rgb(color).map(value => { value /= 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4 }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0)
      return [['.evenform-image-placeholder', '.evenform-image'], ['.evenform-code-language', '.evenform-code-block']].map(([text, surface]) => {
        const element = document.querySelector(text), a = luminance(getComputedStyle(element).color), b = luminance(getComputedStyle(element.closest(surface)).backgroundColor)
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
      })
    })
    check(`${width}/${theme}/${density}: fallback and code captions retain text contrast`, contrast.every(ratio => ratio >= 4.5))
    await page.screenshot({ path: new URL(`${width}-${theme}-${density}.png`, output).pathname, fullPage: true })
    check(`${width}/${theme}/${density}: no page horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    report.matrix.push({ width, theme, density })
  }
  check('No browser runtime errors', report.errors.length === 0)
  report.result = 'pass'
  console.log(`PASS ${report.checks.length} data/media contracts; ${report.matrix.length} rendered layouts`)
} finally {
  await writeFile(new URL('report.json', output), JSON.stringify(report, null, 2))
  await browser.close()
}
