import { useState } from "react"
import { Check, Copy, RotateCcw, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TokenPlayground } from "./use-tokens"
import { tokenControls, advancedTokenGroups, type TokenControl } from "./token-controls"

export function TokenPanel({ tokens, onClose }: { tokens: TokenPlayground; onClose: () => void }) {
  const [copyStatus, setCopyStatus] = useState("")
  async function copy() {
    try { await navigator.clipboard.writeText(tokens.css); setCopyStatus("Copied CSS") }
    catch { setCopyStatus("Select and copy the CSS below.") }
  }
  return <div className="token-panel-inner">
    <div className="inspector-heading"><div className="toolbar"><SlidersHorizontal size={15} /><h2>Design tokens</h2></div><Button variant="ghost" size="icon-sm" aria-label="Close token panel" onClick={onClose}><X /></Button></div>
    <p className="inspector-description">Small changes. A consistent system.</p>
    <div className="inspector-section">
      <div className="inspector-label"><span>Density</span><span className="css-label">Preset</span></div>
      <Tabs value={tokens.density} onValueChange={(value) => tokens.setDensity(value as "compact" | "comfortable")}>
        <TabsList aria-label="UI density" className="density-tabs w-full"><TabsTrigger className="text-[length:var(--pg-font-size)]" value="compact">Compact</TabsTrigger><TabsTrigger className="text-[length:var(--pg-font-size)]" value="comfortable">Comfortable</TabsTrigger></TabsList>
      </Tabs>
      <p className="inspector-help">Switching presets clears custom overrides.</p>
    </div>
    <div className="token-controls">
      {tokenControls.map(control => <TokenEditor key={control.name} control={control} tokens={tokens} onEdit={() => setCopyStatus("")} />)}
    </div>
    <details className="advanced-tokens">
      <summary>Advanced Tokens</summary>
      <p className="inspector-help">Values come from CSS. Advanced overrides can pin derived sizes; reset to restore shared scaling.</p>
      {advancedTokenGroups.map(group => <details className="advanced-token-group" key={group.label}>
        <summary>{group.label}</summary>
        <div className="token-controls">{group.controls.map(control => <TokenEditor key={control.name} control={control} tokens={tokens} onEdit={() => setCopyStatus("")} />)}</div>
      </details>)}
    </details>
    <div className="token-export">
      <div className="inspector-label"><span>Make it yours</span><span className="css-label">CSS</span></div>
      <p className="inspector-help">Copy your overrides into the next app.</p>
      <Button className="w-full text-[length:var(--pg-font-size)]" onClick={copy}>{copyStatus === "Copied CSS" ? <Check /> : <Copy />}{copyStatus === "Copied CSS" ? "Copied CSS" : "Copy token overrides"}</Button>
      <Button className="w-full text-[length:var(--pg-font-size)]" variant="ghost" onClick={() => { tokens.reset(); setCopyStatus("") }}><RotateCcw />Reset to Evenform defaults</Button>
      <details className="css-details"><summary>View CSS overrides</summary><pre tabIndex={0} aria-label="Current token overrides">{tokens.css}</pre></details>
      <span className="sr-only" role="status">{copyStatus}</span>
    </div>
    <div className="inspector-footnote"><span className="live-dot" />Live across all previews<span>Local only</span></div>
  </div>
}

function TokenEditor({ control: { name, label, min, max, step, note, unit = "px" }, tokens, onEdit }: { control: TokenControl; tokens: TokenPlayground; onEdit: () => void }) {
  const value = tokens.overrides[name] ?? tokens.values[name]
  return <div className="token-control">
    <div className="inspector-label"><label htmlFor={`token-${name}`}>{label}{tokens.overrides[name] !== undefined && <span className="override-dot" aria-label="Custom override" />}</label><output htmlFor={`token-${name}`}>{value === undefined ? "–" : Number(value.toFixed(2))}<span>{unit && ` ${unit}`}</span></output></div>
    <input id={`token-${name}`} aria-label={label} title={note} type="range" min={min} max={max} step={step} disabled={value === undefined} value={value ?? min} onChange={event => { tokens.setToken(name, Number(event.target.value)); onEdit() }} />
  </div>
}
