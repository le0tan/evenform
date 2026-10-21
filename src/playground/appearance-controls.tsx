import { Input } from "@/components/ui/input"
import { normalizeHex } from "@/lib/theme-palette"
import { useId, useState } from "react"
import {
  palettes,
  elevations,
  controlSizes,
  type TokenPlayground,
} from "./use-tokens"
import "./appearance-lab.css"

export function AppearanceControls({
  tokens,
  onEdit = () => {},
}: {
  tokens: TokenPlayground
  onEdit?: () => void
}) {
  const groupId = useId()
  const [colorDraft, setColorDraft] = useState<string | null>(null)
  const [colorError, setColorError] = useState(false)
  return (
    <div className="appearance-controls">
      <fieldset>
        <legend>Control size</legend>
        <div className="appearance-options">
          {controlSizes.map((value) => (
            <label key={value} className="appearance-choice">
              <input
                type="radio"
                name={`${groupId}-control-size`}
                value={value}
                aria-label={value === "auto" ? "Follow density" : undefined}
                title={value === "auto" ? "Follow density" : undefined}
                checked={tokens.controlSize === value}
                onChange={() => {
                  tokens.setControlSize(value)
                  onEdit()
                }}
              />
              <span>
                {value === "auto"
                  ? "Auto"
                  : value[0].toUpperCase() + value.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Theme color</legend>
        <div className="appearance-options">
          {palettes
            .filter((value) => value !== "custom")
            .map((value) => (
              <label key={value} className="appearance-choice">
                <input
                  type="radio"
                  name={`${groupId}-palette`}
                  value={value}
                  checked={tokens.palette === value}
                  onChange={() => {
                    tokens.setPalette(value)
                    onEdit()
                  }}
                />
                <span className="appearance-swatch" data-palette={value} />
                <span>{value[0].toUpperCase() + value.slice(1)}</span>
              </label>
            ))}
        </div>
        <div className="appearance-custom-color">
          <label className="appearance-choice">
            <input
              type="radio"
              name={`${groupId}-palette`}
              value="custom"
              checked={tokens.palette === "custom"}
              onChange={() => {
                tokens.setPalette("custom")
                setColorDraft(null)
                setColorError(false)
              }}
            />
            <span>Custom</span>
          </label>
          <input
            type="color"
            aria-label="Custom theme color"
            value={tokens.customColor}
            onChange={(event) => {
              tokens.setCustomColor(event.target.value)
              setColorDraft(null)
              setColorError(false)
              onEdit()
            }}
          />
          <Input
            aria-label="Theme color hex"
            aria-invalid={colorError || undefined}
            aria-describedby={colorError ? `${groupId}-color-error` : undefined}
            spellCheck={false}
            value={colorDraft ?? tokens.customColor}
            onChange={(event) => {
              setColorDraft(event.target.value)
              setColorError(false)
              if (
                normalizeHex(event.target.value) &&
                event.target.value.replace("#", "").length === 6
              ) {
                tokens.setCustomColor(event.target.value)
                onEdit()
              }
            }}
            onBlur={() => {
              if (colorDraft === null) return
              const color = normalizeHex(colorDraft)
              if (color) {
                tokens.setCustomColor(color)
                setColorDraft(null)
                onEdit()
              } else setColorError(true)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur()
            }}
          />
        </div>
        {colorError && (
          <p
            id={`${groupId}-color-error`}
            role="alert"
            className="appearance-color-error"
          >
            Enter a 3- or 6-digit hex color.
          </p>
        )}
        {tokens.palette === "custom" && (
          <>
            <div
              className="appearance-generated-shades"
              role="img"
              aria-label="Generated theme palette, shades 50 to 950"
            >
              {Object.entries(tokens.customPalette.shades).map(
                ([shade, color]) => (
                  <span
                    key={shade}
                    title={`${shade}: ${color}`}
                    style={{ background: color }}
                  />
                )
              )}
            </div>
            <p className="appearance-contrast">
              Button text · Light{" "}
              {tokens.customPalette.textContrast.light.toFixed(2)}:1 · Dark{" "}
              {tokens.customPalette.textContrast.dark.toFixed(2)}:1
            </p>
          </>
        )}
      </fieldset>
      <fieldset>
        <legend>Elevation</legend>
        <div className="appearance-options">
          {elevations.map((value) => (
            <label key={value} className="appearance-choice">
              <input
                type="radio"
                name={`${groupId}-elevation`}
                value={value}
                checked={tokens.elevation === value}
                onChange={() => {
                  tokens.setElevation(value)
                  onEdit()
                }}
              />
              <span>{value[0].toUpperCase() + value.slice(1)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
