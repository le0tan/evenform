import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const origin = process.env.EVENFORM_URL || 'http://127.0.0.1:4173'
const output = new URL('../evidence/chart-contracts/', import.meta.url)
await mkdir(output, {recursive:true})
await writeFile(new URL('fixture.html',output), '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="./fixture.tsx"></script></body></html>')
await writeFile(new URL('fixture.tsx',output), `import React,{useState}from'react';import{createRoot}from'react-dom/client';import'../../src/core.css';
import VChart from '../../src/components/ui/vchart-runtime';import{EvenformChart}from'../../src/components/ui/evenform-chart';import{createThemePalette}from'../../src/lib/theme-palette';
const state=window.chartTest={instances:[],updates:[],released:[],listeners:new Set(),createThemePalette};
const matchMedia=window.matchMedia.bind(window);window.matchMedia=query=>{const media=matchMedia(query);if(query.includes('prefers-reduced-motion')){const add=media.addEventListener.bind(media),remove=media.removeEventListener.bind(media);media.addEventListener=(type,fn,...rest)=>{if(type==='change')state.listeners.add(fn);return add(type,fn,...rest)};media.removeEventListener=(type,fn,...rest)=>{if(type==='change')state.listeners.delete(fn);return remove(type,fn,...rest)}}return media};
const render=VChart.prototype.renderSync,update=VChart.prototype.updateSpecSync,release=VChart.prototype.release;
VChart.prototype.renderSync=function(...args){if(!state.instances.includes(this))state.instances.push(this);return render.apply(this,args)};
VChart.prototype.updateSpecSync=function(...args){state.updates.push(this);return update.apply(this,args)};
VChart.prototype.release=function(...args){state.released.push(this);return release.apply(this,args)};
const bar=id=>({type:'bar',direction:'horizontal',stack:true,animation:true,animationAppear:{duration:3000},padding:0,data:{id,values:[{group:'work',segment:'a',units:400},{group:'work',segment:'b',units:599.98},{group:'work',segment:'tiny',units:0.02}]},xField:'units',yField:'group',seriesField:'segment',color:['#4263eb'],bar:{style:{cornerRadius:0}},axes:[{orient:'bottom',visible:false,min:0,max:1000,nice:false},{orient:'left',visible:false}],legends:{visible:false},tooltip:{visible:false}});
const normal=bar('normal'),local=bar('local'),auto={...bar('auto'),color:{type:'ordinal',domain:['a','b','tiny'],range:[]}};const line={type:'line',animation:false,data:{id:'line',values:[{x:'a',y:1},{x:'b',y:3}]},xField:'x',yField:'y',color:['#14758e'],axes:[{orient:'bottom'},{orient:'left'}]};
function Fixture(){const[mounted,setMounted]=useState(true);return <><button onClick={()=>setMounted(!mounted)}>Toggle charts</button>{mounted&&<><div id="normal" style={{width:800,maxWidth:'100%'}}><EvenformChart spec={normal} label="Default bar" description="Adjacent same-color segments and one tiny segment"/></div><div id="local" style={{width:800,maxWidth:'100%','--ds-chart-bar-separator-width':'2px'}}><EvenformChart spec={local} label="Separated bar" description="Local boundaries"/></div><div id="line" style={{width:800,maxWidth:'100%'}}><EvenformChart spec={line} label="Existing line" description="Stable series color"/></div><div id="auto" style={{width:800,maxWidth:'100%'}}><EvenformChart spec={auto} label="Automatic palette" description="CSS-driven categorical colors"/></div></>}</>};createRoot(document.getElementById('root')).render(<Fixture/>);`)
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined})
const report={result:'fail',checks:[],samples:[],errors:[]}
const check=(name,condition)=>{assert(condition,name);report.checks.push(name)}
try {
  const page=await browser.newPage({viewport:{width:1380,height:1000},reducedMotion:'reduce'})
  page.on('pageerror',e=>report.errors.push(e.message))
  await page.goto(`${origin}/evidence/chart-contracts/fixture.html`)
  await page.waitForFunction(()=>window.chartTest?.instances.length===4&&document.querySelectorAll('[aria-busy="true"]').length===0)
  const sample=()=>page.evaluate(()=>window.chartTest.instances.filter(c=>!window.chartTest.released.includes(c)).map(c=>{
    const s=c.getSpec(),series=c.getChart().getAllSeries()[0],mark=series.getMarkInName(s.type==='bar'?'bar':'line'),graphics=mark.getGraphics();
    return {id:s.data.id,animation:s.animation,theme:s.theme.series.bar.bar.style,graphics:graphics.map(g=>({x:g.attribute.x,x1:g.attribute.x1,width:g.attribute.width,fill:g.attribute.fill,stroke:g.attribute.stroke,lineWidth:g.attribute.lineWidth,animates:g.animates?.size??0}))}
  }))
  let initial=await sample();report.samples.push({phase:'initial-reduced',values:initial})
  check('Initial reduced motion disables effective animation on real chart instances',initial.every(c=>c.animation===false))
  check('Initial reduced motion renders marks without active animations',initial.every(c=>c.graphics.every(g=>g.animates===0)))
  const originalGeometry=initial.find(c=>c.id==='normal').graphics
  for(const theme of ['light','dark']) {
    await page.evaluate(theme=>document.documentElement.classList.toggle('dark',theme==='dark'),theme)
    await page.waitForFunction(()=>window.chartTest.instances.filter(c=>!window.chartTest.released.includes(c)).every(c=>c.getSpec().theme.type===(document.documentElement.classList.contains('dark')?'dark':'light')))
    const values=await sample();report.samples.push({phase:theme,values})
    const normal=values.find(c=>c.id==='normal'),local=values.find(c=>c.id==='local'),line=values.find(c=>c.id==='line'),auto=values.find(c=>c.id==='auto')
    const expectedPalette = theme === 'light' ? 'rgba(66,99,235,1)' : 'rgba(145,167,255,1)'
    check(`${theme}: automatic palette resolves CSS series colors instead of inherited text`,auto.graphics[0].fill === expectedPalette)
    check(`${theme}: default zero separator and local two-pixel separator`,normal.graphics.every(g=>g.lineWidth===0)&&local.graphics.every(g=>g.lineWidth===2))
    const surfaceStroke=await page.evaluate(()=>{const probe=document.createElement('span');probe.style.color='var(--card)';document.body.append(probe);const ctx=document.createElement('canvas').getContext('2d');ctx.canvas.width=ctx.canvas.height=1;ctx.fillStyle=getComputedStyle(probe).color;ctx.fillRect(0,0,1,1);const[r,g,b,a]=ctx.getImageData(0,0,1,1).data;probe.remove();return `rgba(${r},${g},${b},${a/255})`})
    check(`${theme}: actual separator stroke follows the card surface in sRGB`,local.graphics.every(g=>g.stroke===surfaceStroke))
    check(`${theme}: same-color adjacent segments retained`,new Set(local.graphics.map(g=>g.fill)).size===1)
    const widths=c=>c.graphics.map(g=>Math.abs(g.width??g.x1-g.x))
    const a=widths(normal),b=widths(local)
    check(`${theme}: separator does not widen data geometry`,a.every((w,i)=>Math.abs(w-b[i])<0.001))
    check(`${theme}: tiny contribution keeps its real subpixel width`,Math.min(...b)>0&&Math.min(...b)<1)
    check(`${theme}: existing line retains explicit series color`,line.graphics.every(g=>g.stroke==='#14758e'||g.stroke==='rgb(20,117,142)'))
  }
  await page.locator('#local').evaluate(e=>e.style.setProperty('--ds-chart-bar-separator-color','#c2410c'))
  await page.waitForFunction(()=>window.chartTest.instances.find(c=>c.getSpec().data.id==='local').getChart().getAllSeries()[0].getMarkInName('bar').getGraphics().every(g=>g.attribute.stroke==='rgba(194,65,12,1)'))
  check('Local separator color override affects only that chart instance',(await sample()).find(c=>c.id==='normal').graphics.every(g=>g.stroke!=='rgba(194,65,12,1)'))
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.waitForFunction(()=>window.chartTest.instances.filter(c=>!window.chartTest.released.includes(c)&&c.getSpec().type==='bar').every(c=>c.getSpec().animation===true))
  check('Preference change restores caller animation while explicit false remains false',(await sample()).find(c=>c.id==='line').animation===false)
  // Start a fresh long appear animation, then interrupt it with a real media-query change.
  await page.getByRole('button',{name:'Toggle charts'}).click()
  await page.waitForFunction(()=>window.chartTest.listeners.size===0)
  await page.getByRole('button',{name:'Toggle charts'}).click()
  await page.waitForFunction(()=>window.chartTest.instances.length===8)
  await page.waitForFunction(()=>window.chartTest.instances.filter(c=>!window.chartTest.released.includes(c)&&c.getSpec().type==='bar').some(c=>c.getChart().getAllSeries()[0].getMarkInName('bar').getGraphics().some(g=>g.animates?.size>0)))
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.waitForFunction(()=>window.chartTest.instances.filter(c=>!window.chartTest.released.includes(c)).every(c=>c.getSpec().animation===false))
  await page.waitForFunction(()=>window.chartTest.instances.filter(c=>!window.chartTest.released.includes(c)).every(c=>c.getChart().getAllSeries()[0].getMarkInName(c.getSpec().type==='bar'?'bar':'line').getGraphics().every(g=>!g.animates?.size)))
  check('Dynamic reduced motion interrupts running mark animations',true)
  await page.getByRole('button',{name:'Toggle charts'}).click()
  await page.waitForFunction(()=>window.chartTest.listeners.size===0&&window.chartTest.released.length===8)
  const updates=await page.evaluate(()=>window.chartTest.updates.length)
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.evaluate(()=>document.documentElement.classList.toggle('dark'))
  await page.setViewportSize({width:1000,height:900})
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
  check('Unmount removes media listeners, releases instances and ignores later resize/preference changes',await page.evaluate(()=>window.chartTest.updates.length)===updates)
  check('Default geometry remains measurable',originalGeometry.length===3)
  check('No page runtime errors',report.errors.length===0)
  report.result='pass'
  console.log(`PASS ${report.checks.length} chart lifecycle/mark contracts`)
} finally {await writeFile(new URL('report.json',output),JSON.stringify(report,null,2));await browser.close()}
