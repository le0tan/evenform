import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { access, mkdir, mkdtemp, readFile, readdir, rename, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"

// Read-only profiling of two React Router/Vite consumer revisions. Build inputs
// stay private in a temporary directory; no package install or host edit occurs.
const [hostArg, beforeArg, afterArg, ...flags] = process.argv.slice(2)
assert(hostArg && beforeArg && afterArg, "Usage: node scripts/analyze-adoption-size.mjs /path/to/consumer before-ref after-ref")
const host = resolve(hostArg)
const output = new URL("../evidence/adoption-size/", import.meta.url)
await mkdir(output, { recursive: true })
const temporary = await mkdtemp(join(tmpdir(), "evenform-build-profile-"))
const exists = async path => { try { await access(path); return true } catch { return false } }
const store = await readdir(join(host, "node_modules/.pnpm"))
const report = { runtime: process.version, scope: "React Router/Vite client output; no production changes", cases: [] }
const cases = [["before", beforeArg], ["after", afterArg]]
if (flags.includes("--ablate-combobox")) cases.push(["after-without-combobox", afterArg])
if (flags.includes("--ablate-workspace-style")) cases.push(["after-without-workspace-style", afterArg])
assert(flags.every(flag => ["--ablate-combobox", "--ablate-workspace-style"].includes(flag)), "Unknown profiling flag")
for (const [label, ref] of cases) {
  const revision = execFileSync("git", ["rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`], { cwd: host, encoding: "utf8" }).trim()
  const root = join(temporary, label)
  await mkdir(root)
  const archive = execFileSync("git", ["archive", "--format=tar", revision], { cwd: host, maxBuffer: 64 * 1024 * 1024 })
  execFileSync("tar", ["-xf", "-", "-C", root], { input: archive })
  const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"))
  for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
    let installed = join(host, "node_modules", name)
    if (!await exists(installed)) {
      const prefix = `${name.replace("/", "+")}@`
      const candidates = []
      for (const folder of store.filter(folder => folder.startsWith(prefix))) {
        const path = join(host, "node_modules/.pnpm", folder, "node_modules", name)
        if (await exists(path)) candidates.push(path)
      }
      assert.equal(candidates.length, 1, `Provide an unambiguous installed version for ${name}; this profiler never installs or guesses versions`)
      installed = candidates[0]
    }
    const link = join(root, "node_modules", name)
    await mkdir(dirname(link), { recursive: true })
    await symlink(installed, link)
  }
  await symlink(join(host, "node_modules/.bin"), join(root, "node_modules/.bin"))
  if (label === "after-without-workspace-style") {
    const css = join(root, "app/app.css")
    const content = await readFile(css, "utf8")
    assert(content.includes("../src/styles/workflow-aids.css"), "Expected an explicit workflow stylesheet import")
    await writeFile(css, content.replace(/@import ["']\.\.\/src\/styles\/workflow-aids\.css["'];/, ""))
  }
  await rename(join(root, "vite.config.ts"), join(root, "vite.profile-original.ts"))
  await writeFile(join(root, "vite.config.ts"), `import original from './vite.profile-original.ts';
import{defineConfig}from'vite';import{writeFileSync}from'node:fs';import{gzipSync}from'node:zlib';
export default defineConfig(async env=>{const config=typeof original==='function'?await original(env):await original;return{...config,plugins:[${label === "after-without-combobox" ? `{name:'combobox-ablation-only',enforce:'pre',resolveId(id){if(id==='@/components/ui/combobox')return '\\0combobox-ablation'},load(id){if(id==='\\0combobox-ablation')return ${JSON.stringify(`import React from 'react';const Part=({children})=>React.createElement('div',null,typeof children==='function'?children(''):children);export const Combobox=Part,ComboboxInputGroup=Part,ComboboxInput=Part,ComboboxTrigger=Part,ComboboxClear=Part,ComboboxContent=Part,ComboboxList=Part,ComboboxItem=Part,ComboboxEmpty=Part;`)}}},` : ""}...(config.plugins||[]),{name:'evenform-private-build-profile',generateBundle(options,bundle){
const chunks=Object.values(bundle).filter(item=>item.type==='chunk');
const files=Object.values(bundle).map(item=>{const content=item.type==='chunk'?item.code:item.source;return{file:item.fileName,kind:item.type==='chunk'?'javascript':item.fileName.endsWith('.css')?'css':'asset',bytes:Buffer.byteLength(content),gzipBytes:gzipSync(content).byteLength}});
const groups={};for(const chunk of chunks)for(const[id,info]of Object.entries(chunk.modules)){const marker='/node_modules/';const offset=id.lastIndexOf(marker);const tail=offset<0?'':id.slice(offset+marker.length);let name=tail?tail.startsWith('@')?tail.split('/').slice(0,2).join('/'):tail.split('/')[0]:'host';
if(name.startsWith('@byted'))name='private-dependency';const group=groups[name]??={modules:0,renderedBytes:0,hasRenderedLengths:true};group.modules++;if(typeof info.renderedLength==='number')group.renderedBytes+=info.renderedLength;else group.hasRenderedLengths=false;}
const result={files,groups};const client=this.environment.name==='client';writeFileSync(${JSON.stringify(join(root, "profile-"))}+(client?'client':'server')+'.json',JSON.stringify(result,null,2));
}}]}});`)
  const logs = execFileSync("pnpm", ["exec", "react-router", "build"], { cwd: root, env: { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH}` }, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 })
  await writeFile(new URL(`${label}-build.log`, output), logs)
  const profile = JSON.parse(await readFile(join(root, "profile-client.json"), "utf8"))
  const totals = Object.fromEntries(["javascript", "css", "asset"].map(kind => [kind, profile.files.filter(file => file.kind === kind).reduce((sum, file) => ({ bytes: sum.bytes + file.bytes, gzipBytes: sum.gzipBytes + file.gzipBytes }), { bytes: 0, gzipBytes: 0 })]))
  const styles = []
  for (const relative of ["app/app.css", "src/core.css", "src/styles/tokens.css", "src/styles/appearance.css", "src/styles/control-sizing.css", "src/styles/patterns.css", "src/styles/extended-controls.css", "src/styles/extended-patterns.css", "src/styles/motion.css", "src/styles/workflow-aids.css"]) {
    if (await exists(join(root, relative))) styles.push({ file: relative, sourceBytes: Buffer.byteLength(await readFile(join(root, relative))) })
  }
  report.cases.push({ label, revision, versions: Object.fromEntries(await Promise.all(["react", "react-dom", "vite", "@tailwindcss/vite", "@react-router/dev"].map(async name => [name, JSON.parse(await readFile(join(root, "node_modules", name, "package.json"), "utf8")).version]))), totals, styles, ...profile })
  console.log(`Profiled ${label}: ${totals.javascript.bytes} JS bytes; ${totals.css.bytes} CSS bytes`)
}
await writeFile(new URL("report.json", output), JSON.stringify(report, null, 2))
console.log(`Private snapshots retained at ${temporary}. Reports are under ignored evidence/adoption-size/.`)
