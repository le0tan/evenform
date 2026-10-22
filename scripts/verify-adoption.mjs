import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdir, mkdtemp, readFile, stat, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "vite"

const source = fileURLToPath(new URL("../", import.meta.url))
const host = await mkdtemp(join(tmpdir(), "evenform-adoption-"))
const packages = ["react", "react-dom", "@base-ui/react", "lucide-react", "class-variance-authority", "cn", "tailwindcss", "@tailwindcss/vite", "@fontsource-variable/geist", "tw-animate-css", "shadcn"]
const dependencies = {}
for (const name of packages) {
  const target = join(host, "node_modules", name)
  await mkdir(dirname(target), { recursive: true })
  await symlink(join(source, "node_modules", name), target)
  dependencies[name] = JSON.parse(await readFile(join(target, "package.json"), "utf8")).version
}
await writeFile(join(host, "package.json"), JSON.stringify({ private: true, type: "module", dependencies }, null, 2))
await mkdir(join(host, "src"), { recursive: true })
const coreEntries = ["button", "badge", "input", "tabs", "accordion", "select", "sheet", "option-select"]
const selectedEntries = [...coreEntries.map(name => `src/components/ui/${name}.tsx`), "src/components/patterns/header-layout.tsx"]
execFileSync(process.execPath, [join(source, "scripts/adopt-source.mjs"), "--to", host, ...selectedEntries.flatMap(name => ["--entry", name])], { stdio: "inherit" })
const exported = JSON.parse(await readFile(join(host, "evenform-adoption.json"), "utf8"))
assert.equal(exported.schemaVersion, 1)
assert.match(exported.hashes['src/components/ui/option-select.tsx'], /^[a-f0-9]{64}$/)
assert.equal(exported.dependencies.react, dependencies.react)
const beforeCheck = (await stat(join(host, 'evenform-adoption.json'))).mtimeMs
execFileSync(process.execPath, [join(source, "scripts/adopt-source.mjs"), "--to", host, "--check"], { stdio: "inherit" })
assert.equal((await stat(join(host, 'evenform-adoption.json'))).mtimeMs, beforeCheck)
await writeFile(join(host, 'src/private-product.ts'), '// Product-owned; outside the adopted snapshot.\n')
assert(!exported.files.includes('src/private-product.ts'))
assert(exported.styleEntries.includes('src/styles/workflow-aids.css'))
const repeated = await mkdtemp(join(tmpdir(), "evenform-repeat-"))
execFileSync(process.execPath, [join(source, "scripts/adopt-source.mjs"), "--to", repeated, ...selectedEntries.flatMap(name => ["--entry", name])], { stdio: "pipe" })
assert.equal(await readFile(join(repeated, 'evenform-adoption.json'), 'utf8'), await readFile(join(host, 'evenform-adoption.json'), 'utf8'))
assert(exported.files.includes("src/lib/cn-tables.ts"))
assert(exported.files.includes("src/styles/motion.css"))
assert(exported.files.includes("src/styles/workflow-aids.css"))
assert(!exported.dependencies["@fullcalendar/react"])
assert(await readFile(join(host, "licenses/evenform/LICENSE"), "utf8"))
// A consumer-edited file must survive an accidental second export.
const buttonPath = join(host, "src/components/ui/button.tsx")
const originalButton = await readFile(buttonPath, "utf8")
await writeFile(buttonPath, `${originalButton}\n// consumer customization\n`)
assert.throws(() => execFileSync(process.execPath, [join(source, "scripts/adopt-source.mjs"), "--to", host, "--check"], { stdio: "pipe" }))
assert.throws(() => execFileSync(process.execPath, [join(source, "scripts/adopt-source.mjs"), "--to", host, "--entry", "src/components/ui/button.tsx"], { stdio: "pipe" }))
assert((await readFile(buttonPath, "utf8")).includes("consumer customization"))
await writeFile(buttonPath, originalButton)
console.log("PASS deterministic manifests, exact direct versions, read-only integrity and tamper detection")
console.log("PASS source exporter resolves imports, CSS and notices, and refuses overwriting consumer changes")
await writeFile(join(host, "index.html"), '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>')
const baseMain = `import React from 'react'; import {createRoot} from 'react-dom/client'; import './core.css';
import {HeaderShell} from './components/patterns/header-layout'; import './styles/workflow-aids.css'; import {OptionSelect} from './components/ui/option-select';
import {Button} from './components/ui/button'; import {Badge} from './components/ui/badge'; import {Input} from './components/ui/input';
import {Tabs,TabsList,TabsTrigger} from './components/ui/tabs'; import {Select,SelectTrigger,SelectValue} from './components/ui/select';
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from './components/ui/accordion';
import {Sheet,SheetTrigger,SheetContent,SheetHeader,SheetTitle,SheetBody} from './components/ui/sheet';
const content=<HeaderShell header="Host"><OptionSelect defaultValue="fields" options={[{value:"fields",label:"Fields"}]} triggerProps={{"aria-label":"Field mode"}}/><Input aria-label="Search"/><Select defaultValue="all"><SelectTrigger><SelectValue/></SelectTrigger></Select><Tabs defaultValue="all"><TabsList size="control"><TabsTrigger value="all">All</TabsTrigger></TabsList></Tabs><Badge className="text-label">Ready</Badge><Accordion defaultValue={['report']}><AccordionItem value="report"><AccordionTrigger>Report</AccordionTrigger><AccordionContent>Readable text</AccordionContent></AccordionItem></Accordion><Sheet><SheetTrigger render={<Button/>}>Details</SheetTrigger><SheetContent><SheetHeader><SheetTitle>Record</SheetTitle></SheetHeader><SheetBody>Details</SheetBody></SheetContent></Sheet></HeaderShell>;
createRoot(document.getElementById('root')).render(content);`
await writeFile(join(host, "src/main.tsx"), baseMain)
const { default: tailwind } = await import("@tailwindcss/vite")
const { default: react } = await import("@vitejs/plugin-react")
let calendar = false
const run = () => build({
  root: host, configFile: false, logLevel: "error",
  plugins: [react(), tailwind(), {
    name: "verify-calendar-boundary",
    resolveId(id) { if (!calendar && id.includes("fullcalendar")) throw new Error(`Unexpected optional dependency: ${id}`) },
    generateBundle(_, bundle) {
      const modules = Object.values(bundle).flatMap(output => output.type === "chunk" ? Object.keys(output.modules) : [])
      assert.equal(modules.some(id => id.includes("@fullcalendar")), calendar)
    },
  }],
  resolve: { alias: { "@": resolve(host, "src") } },
  build: { license: { fileName: "third-party-licenses.json" }, outDir: calendar ? "dist-calendar" : "dist-core" },
})
await run()
assert(!dependencies["@fullcalendar/react"])
console.log("PASS copied core host builds without FullCalendar in its node_modules or bundle")
calendar = true
execFileSync(process.execPath, [join(source, "scripts/adopt-source.mjs"), "--to", host, ...selectedEntries.concat('src/components/ui/event-calendar.tsx').flatMap(name => ['--entry', name])], { stdio: 'inherit' })
const withCalendar = JSON.parse(await readFile(join(host, 'evenform-adoption.json'), 'utf8'))
assert(withCalendar.files.includes('src/components/ui/event-calendar.css'))
assert(withCalendar.styleEntries.includes('src/styles/design-tools.css'))
assert(withCalendar.dependencies['@fullcalendar/react'])
await mkdir(join(host, "node_modules/@fullcalendar"), { recursive: true })
await symlink(join(source, "node_modules/@fullcalendar/react"), join(host, "node_modules/@fullcalendar/react"))
dependencies["@fullcalendar/react"] = JSON.parse(await readFile(join(source, "node_modules/@fullcalendar/react/package.json"), "utf8")).version
await writeFile(join(host, "package.json"), JSON.stringify({ private: true, type: "module", dependencies }, null, 2))
await writeFile(join(host, "src/main.tsx"), baseMain.replace("createRoot(document", "import {EventCalendar} from './components/ui/event-calendar'; import './styles/design-tools.css';\ncreateRoot(document").replace(".render(content)", ".render(<>{content}<EventCalendar events={[]}/></>)"))
await run()
const notices = await readFile(join(host, "dist-calendar/third-party-licenses.json"), "utf8")
assert(notices.includes("@fullcalendar"))
console.log("PASS adding calendar supplies package CSS and includes its license metadata")
console.log(`Fixture retained at ${host}`)

const legacyHost = await mkdtemp(join(tmpdir(), 'evenform-legacy-'))
execFileSync(process.execPath, [join(source, 'scripts/adopt-source.mjs'), '--to', legacyHost, '--entry', 'src/components/ui/button.tsx', '--legacy-node-resolution'], { stdio: 'pipe' })
const legacyManifest = JSON.parse(await readFile(join(legacyHost, 'evenform-adoption.json'), 'utf8'))
assert.equal(legacyManifest.transformations['src/lib/utils.ts'].kind, 'extensionless-cn-import')
assert(legacyManifest.transformations['src/lib/utils.ts'].sourceHash)
assert(!(await readFile(join(legacyHost, 'src/lib/utils.ts'), 'utf8')).includes('./cn-tables.ts'))
execFileSync(process.execPath, [join(source, 'scripts/adopt-source.mjs'), '--to', legacyHost, '--check'], { stdio: 'pipe' })
await symlink(join(source, 'node_modules'), join(legacyHost, 'node_modules'))
await writeFile(join(legacyHost, 'tsconfig.json'), JSON.stringify({compilerOptions:{target:'ES2022',module:'CommonJS',moduleResolution:'node',ignoreDeprecations:'6.0',jsx:'react-jsx',strict:true,skipLibCheck:true,esModuleInterop:true,noEmit:true,baseUrl:'.',paths:{'@/*':['src/*']}},include:['src/**/*.ts','src/**/*.tsx']},null,2))
execFileSync(process.execPath,[join(source,'node_modules/typescript/bin/tsc'),'-p',join(legacyHost,'tsconfig.json')],{stdio:'inherit'})
console.log('PASS legacy node-resolution host typecheck using upstream cn type bridge')
const originalLicense = await readFile(join(host, 'licenses/evenform/LICENSE'), 'utf8')
await writeFile(join(host, 'licenses/evenform/LICENSE'), originalLicense + '\n// host note\n')
const beforeConflict = await readFile(buttonPath, 'utf8')
assert.throws(() => execFileSync(process.execPath, [join(source, 'scripts/adopt-source.mjs'), '--to', host, '--entry', 'src/components/ui/button.tsx'], { stdio: 'pipe' }))
assert.equal(await readFile(buttonPath, 'utf8'), beforeConflict)
console.log('PASS compatibility provenance, product ownership exclusion, read-only check and notice conflict preflight')
