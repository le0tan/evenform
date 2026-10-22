import assert from 'node:assert/strict'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {chromium} from 'playwright'
const origin=process.env.EVENFORM_URL||'http://127.0.0.1:4173'
const output=new URL('../evidence/reading-contrast/',import.meta.url)
await mkdir(output,{recursive:true})
const fixture=async(path,content)=>{if(await readFile(path,'utf8').catch(()=>null)!==content)await writeFile(path,content)}
await fixture(new URL('fixture.html',output),'<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script type="module" src="./fixture.ts"></script></body></html>')
await fixture(new URL('fixture.ts',output),`import '../../src/core.css';import{createThemePalette}from'../../src/lib/theme-palette';window.createThemePalette=createThemePalette;`)
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined})
const report={result:'fail',matrix:[],baseline:[],errors:[]}
try{
 const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(origin+'/evidence/reading-contrast/fixture.html');await page.waitForFunction(()=>typeof window.createThemePalette==='function')
 for(const theme of ['light','dark'])for(const palette of ['neutral','indigo','teal','rose','custom'])for(const density of ['compact','comfortable']){
  const pairs=await page.evaluate(({theme,palette,density})=>{
   const root=document.documentElement;root.classList.toggle('dark',theme==='dark');root.dataset.palette=palette;root.dataset.density=density
   const probe=document.createElement('span');document.body.append(probe);const ctx=document.createElement('canvas').getContext('2d',{willReadFrequently:true});ctx.canvas.width=ctx.canvas.height=1
   const rgb=token=>{probe.style.color='var('+token+')';ctx.clearRect(0,0,1,1);ctx.fillStyle=getComputedStyle(probe).color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3)}
   const hex=token=>'#'+rgb(token).map(n=>n.toString(16).padStart(2,'0')).join('')
   if(palette==='custom'){
    const surfaces={seed:'#b45309',light:[0,50,100].map(n=>hex('--ds-neutral-'+n)),dark:[950,900,800].map(n=>hex('--ds-neutral-'+n))}
    for(const[key,value]of Object.entries(window.createThemePalette(surfaces.seed,surfaces).variables))root.style.setProperty(key,value)
   }
   const luminance=channels=>channels.map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4}).reduce((a,n,i)=>a+n*[.2126,.7152,.0722][i],0)
   const measure=(surface,text)=>{const background=rgb(surface),foreground=rgb(text),a=luminance(background),b=luminance(foreground);return{surface,text,background,foreground,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}}
   const pairs=[['--background','--foreground'],['--background','--muted-foreground'],['--card','--foreground'],['--card','--muted-foreground'],['--muted','--foreground'],['--muted','--ds-reading-muted-foreground'],['--sidebar','--muted-foreground'],['--accent','--accent-foreground'],['--primary','--primary-foreground']].map(([s,t])=>measure(s,t))
   const baseline=measure('--muted','--muted-foreground');probe.remove();return{pairs,baseline}
  },{theme,palette,density})
  for(const pair of pairs.pairs)assert(pair.ratio>=4.5,`${theme}/${palette}/${density}: ${pair.text} on ${pair.surface}: ${pair.ratio}`)
  report.matrix.push({theme,palette,density,pairs:pairs.pairs});report.baseline.push({theme,palette,density,...pairs.baseline})
 }
 assert.deepEqual(report.errors,[]);report.result='pass';console.log(`PASS ${report.matrix.length} theme/preset/density cases; ${report.matrix.reduce((n,c)=>n+c.pairs.length,0)} actual CSS text/surface pairs`)
}finally{await writeFile(new URL('report.json',output),JSON.stringify(report,null,2));await browser.close()}
