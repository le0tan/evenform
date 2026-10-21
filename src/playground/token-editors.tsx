import { useId, useState } from "react"
import { Check, Copy, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TokenPlayground } from "./use-tokens"
import {
  tokenControls,
  advancedTokenGroups,
  type TokenControl,
} from "./token-controls"

export function TokenAdjustments({ tokens }: { tokens: TokenPlayground }) {
  return (
    <>
      <div className="token-controls">
        {tokenControls.map((control) => (
          <TokenEditor key={control.name} control={control} tokens={tokens} />
        ))}
      </div>
      <details className="advanced-tokens">
        <summary>Advanced tokens</summary>
        {advancedTokenGroups.map((group) => (
          <details className="advanced-token-group" key={group.label}>
            <summary>{group.label}</summary>
            <div className="token-controls">
              {group.controls.map((control) => (
                <TokenEditor
                  key={control.name}
                  control={control}
                  tokens={tokens}
                />
              ))}
            </div>
          </details>
        ))}
      </details>
    </>
  )
}

export function TokenExport({ tokens }: { tokens: TokenPlayground }) {
  const [copiedCss, setCopiedCss] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [showCss, setShowCss] = useState(false)
  const copied = copiedCss === tokens.css
  async function copy() {
    try {
      await navigator.clipboard.writeText(tokens.css)
      setCopiedCss(tokens.css)
      setError("")
    } catch {
      setError("Select and copy the CSS below.")
      setShowCss(true)
    }
  }
  return (
    <div className="token-export">
      <div className="inspector-label">
        <span>Export</span>
        <span className="css-label">CSS</span>
      </div>
      <Button className="w-full" onClick={copy}>
        {copied ? <Check /> : <Copy />}
        {copied ? "Copied CSS" : "Copy token overrides"}
      </Button>
      <Button
        className="w-full"
        variant="ghost"
        onClick={() => {
          tokens.reset()
          setCopiedCss(null)
          setError("")
        }}
      >
        <RotateCcw />
        Reset to Evenform defaults
      </Button>
      <details
        className="css-details"
        open={showCss}
        onToggle={(event) => setShowCss(event.currentTarget.open)}
      >
        <summary>View CSS overrides</summary>
        <pre tabIndex={0} aria-label="Current token overrides">
          {tokens.css}
        </pre>
      </details>
      <span className={error ? "inspector-help" : "sr-only"} role="status">
        {error || (copied ? "Copied CSS" : "")}
      </span>
    </div>
  )
}

function TokenEditor({
  control: { name, label, min, max, step, note, unit = "px" },
  tokens,
}: {
  control: TokenControl
  tokens: TokenPlayground
}) {
  const id = useId()
  const value = tokens.overrides[name] ?? tokens.values[name]
  return (
    <div className="token-control">
      <div className="inspector-label">
        <label htmlFor={id}>
          {label}
          {tokens.overrides[name] !== undefined && (
            <span className="override-dot" aria-label="Custom override" />
          )}
        </label>
        <output htmlFor={id}>
          {value === undefined ? "–" : Number(value.toFixed(2))}
          <span>{unit && ` ${unit}`}</span>
        </output>
      </div>
      <input
        id={id}
        aria-label={label}
        title={note}
        type="range"
        min={min}
        max={max}
        step={step}
        disabled={value === undefined}
        value={value ?? min}
        onChange={(event) => tokens.setToken(name, Number(event.target.value))}
      />
    </div>
  )
}
