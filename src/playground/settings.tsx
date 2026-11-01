import { useState } from "react"
import { Bell, Check, Monitor, Settings2, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "@/components/theme-provider"
import { LabeledField, PageHeader, SettingsGroup, SettingsLayout } from "@/components/patterns/layouts"
import type { TokenPlayground } from "./use-tokens"

type Preferences = { name: string; url: string; description: string; timezone: string; notifications: boolean; digest: boolean }
const initial: Preferences = { name: "Acme Studio", url: "acme-studio", description: "Design reviews and project decisions.", timezone: "Asia/Singapore", notifications: true, digest: false }
const timezoneOptions = [
  { value: "Asia/Singapore", label: "Singapore (GMT+08:00)" },
  { value: "Europe/London", label: "London (Europe/London)" },
  { value: "America/New_York", label: "New York (America/New_York)" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)" },
]
function load(): Preferences {
  try { const stored = JSON.parse(localStorage.getItem("evenform-workspace") ?? "null"); return stored && typeof stored.name === "string" && typeof stored.url === "string" ? { ...initial, ...stored } : initial }
  catch { return initial }
}
export function Settings({ tokens }: { tokens: TokenPlayground }) {
  const [section, setSection] = useState("General")
  const [preferences, setPreferences] = useState(load)
  const [message, setMessage] = useState("")
  const { theme, setTheme } = useTheme()
  function update<K extends keyof Preferences>(name: K, value: Preferences[K]) { setPreferences((current) => ({ ...current, [name]: value })); setMessage("") }
  function save(event: React.FormEvent) {
    event.preventDefault()
    try { localStorage.setItem("evenform-workspace", JSON.stringify(preferences)); setMessage("Workspace preferences saved locally.") }
    catch { setMessage("Browser storage is unavailable. Your changes are kept for this session.") }
  }
  return <><PageHeader title="Settings" />
    <SettingsLayout navigation={<>{[{ name: "General", icon: Settings2 }, { name: "Notifications", icon: Bell }, { name: "Appearance", icon: Monitor }].map(({ name, icon: Icon }) => <Button className="justify-start" key={name} variant={name === section ? "secondary" : "ghost"} aria-current={name === section ? "page" : undefined} onClick={() => { setSection(name); setMessage("") }}><Icon />{name}</Button>)}</>}>
      <form className="form-stack" onSubmit={save}>
        {section === "General" && <>
          <SettingsGroup title="Workspace details">
            <div className="workspace-identity"><span className="workspace-avatar">A</span><div><strong>Workspace icon</strong></div></div>
            <LabeledField id="workspace-name" label="Workspace name"><Input id="workspace-name" value={preferences.name} onChange={(event) => update("name", event.target.value)} required maxLength={80} /></LabeledField>
            <LabeledField id="workspace-url" label="Workspace URL" description="Use lowercase words or numbers separated by hyphens."><InputGroup><InputGroupAddon>example.com/</InputGroupAddon><InputGroupInput id="workspace-url" value={preferences.url} onChange={(event) => update("url", event.target.value)} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={60} aria-describedby="workspace-url-description" /></InputGroup></LabeledField>
            <LabeledField id="workspace-about" label="Description"><Textarea id="workspace-about" value={preferences.description} onChange={(event) => update("description", event.target.value)} maxLength={240} /></LabeledField>
          </SettingsGroup>
          <SettingsGroup title="Regional preferences"><LabeledField id="timezone" label="Timezone"><Select items={timezoneOptions} value={preferences.timezone} onValueChange={(value) => { if (value) update("timezone", value) }}><SelectTrigger id="timezone" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{timezoneOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></LabeledField></SettingsGroup>
        </>}
        {section === "Notifications" && <SettingsGroup title="Notifications"><div className="preference-row"><div><label htmlFor="project-updates">Project updates</label><p>Get notified when a project you follow changes.</p></div><Switch id="project-updates" checked={preferences.notifications} onCheckedChange={(value) => update("notifications", value)} /></div><div className="preference-row"><div><label htmlFor="weekly-digest">Weekly digest</label></div><Switch id="weekly-digest" checked={preferences.digest} onCheckedChange={(value) => update("digest", value)} /></div></SettingsGroup>}
        {section === "Appearance" && <><SettingsGroup title="Theme" ><RadioGroup aria-label="Theme" className="settings-choices" value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>{[{ value: "light", label: "Light", icon: Sun }, { value: "dark", label: "Dark", icon: Moon }, { value: "system", label: "System", icon: Monitor }].map(({ value, label, icon: Icon }) => <Label key={value} className="settings-choice"><RadioGroupItem value={value} /><Icon aria-hidden="true" />{label}</Label>)}</RadioGroup></SettingsGroup><SettingsGroup title="Interface density"><RadioGroup aria-label="Interface density" className="settings-choices" value={tokens.density} onValueChange={(value) => tokens.setDensity(value as "compact" | "comfortable")}>{[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }].map(({ value, label }) => <Label key={value} className="settings-choice"><RadioGroupItem value={value} />{label}</Label>)}</RadioGroup>{Object.keys(tokens.overrides).length > 0 && <p className="field-description">Changing density clears numeric overrides.</p>}</SettingsGroup></>}
        {section !== "Appearance" && <div className="settings-save"><p className="field-description">Changes are saved in this browser.</p><Button type="submit">Save changes</Button></div>}
        {message && <p role="status" className="inline-notice"><Check size={15} />{message}</p>}
      </form>
    </SettingsLayout>
  </>
}
