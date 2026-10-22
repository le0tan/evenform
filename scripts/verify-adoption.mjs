import assert from "node:assert/strict"
import { cp, mkdir, mkdtemp, readFile, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "vite"

const source = fileURLToPath(new URL("../", import.meta.url))
const host = await mkdtemp(join(tmpdir(), "evenform-adoption-"))
const copy = async name => {
  await mkdir(dirname(join(host, name)), { recursive: true })
  await cp(join(source, name), join(host, name), { recursive: true })
}
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
await copy("src/core.css")
const css = await readFile(join(host, "src/core.css"), "utf8")
for (const [, path] of css.matchAll(/@import "\.\/(styles\/[^";]+)"/g)) await copy(`src/${path}`)
for (const file of ["lib/utils.ts", "lib/cn-tables.ts", "components/ui/button.tsx", "components/ui/badge.tsx", "components/ui/input.tsx", "components/ui/tabs.tsx", "components/ui/accordion.tsx", "components/ui/select.tsx", "components/ui/sheet.tsx"]) await copy(`src/${file}`)
await writeFile(join(host, "index.html"), '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>')
const baseMain = `import React from 'react'; import {createRoot} from 'react-dom/client'; import './core.css';
import {Button} from './components/ui/button'; import {Badge} from './components/ui/badge'; import {Input} from './components/ui/input';
import {Tabs,TabsList,TabsTrigger} from './components/ui/tabs'; import {Select,SelectTrigger,SelectValue} from './components/ui/select';
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from './components/ui/accordion';
import {Sheet,SheetTrigger,SheetContent,SheetHeader,SheetTitle,SheetBody} from './components/ui/sheet';
const content=<><Input aria-label="Search"/><Select defaultValue="all"><SelectTrigger><SelectValue/></SelectTrigger></Select><Tabs defaultValue="all"><TabsList size="control"><TabsTrigger value="all">All</TabsTrigger></TabsList></Tabs><Badge className="text-label">Ready</Badge><Accordion defaultValue={['report']}><AccordionItem value="report"><AccordionTrigger>Report</AccordionTrigger><AccordionContent>Readable text</AccordionContent></AccordionItem></Accordion><Sheet><SheetTrigger render={<Button/>}>Details</SheetTrigger><SheetContent><SheetHeader><SheetTitle>Record</SheetTitle></SheetHeader><SheetBody>Details</SheetBody></SheetContent></Sheet></>;
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
await copy("src/components/ui/event-calendar.tsx")
await copy("src/components/ui/event-calendar.css")
await copy("src/styles/design-tools.css")
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
