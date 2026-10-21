import { useId, type ComponentProps } from "react"
import { Plus, Trash2, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  ColorField,
  ColorSwatch,
  parseColor,
} from "@/components/ui/color-picker"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

export interface GradientStop {
  id: string
  color: string
  /** Offset from 0 to 100. */ offset: number
}
export interface GradientValue {
  type: "linear" | "radial"
  angle: number
  /** At least two stops. Colors use React Aria's CSS color syntax. */ stops: GradientStop[]
}
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min))
}
/** Structured user colors stay local to the gradient and never become global tokens. */
export function gradientToCss(value: GradientValue) {
  const stops = [...value.stops]
    .sort((a, b) => a.offset - b.offset)
    .map((stop) => {
      let color = "transparent"
      try {
        color = parseColor(stop.color).toString("css")
      } catch {
        /* Invalid caller colors get a safe visual fallback. */
      }
      return `${color} ${clamp(stop.offset, 0, 100)}%`
    })
    .join(", ")
  return value.type === "radial"
    ? `radial-gradient(ellipse at center, ${stops})`
    : `linear-gradient(${clamp(value.angle, 0, 360)}deg, ${stops})`
}
export interface GradientPickerProps extends Omit<
  ComponentProps<"fieldset">,
  "onChange" | "defaultValue" | "children"
> {
  value: GradientValue
  onValueChange: (value: GradientValue) => void
  label?: string
}
export function GradientPicker({
  value,
  onValueChange,
  label = "Gradient",
  disabled,
  className,
  ...props
}: GradientPickerProps) {
  const id = useId()
  function updateStop(stopId: string, patch: Partial<GradientStop>) {
    onValueChange({
      ...value,
      stops: value.stops.map((stop) =>
        stop.id === stopId ? { ...stop, ...patch } : stop
      ),
    })
  }
  function addStop() {
    const ordered = [...value.stops].sort((a, b) => a.offset - b.offset)
    let offset = 50
    let color = ordered[0]?.color ?? "#808080"
    let gap = -1
    for (let i = 1; i < ordered.length; i++) {
      const size = ordered[i].offset - ordered[i - 1].offset
      if (size > gap) {
        gap = size
        offset = Math.round((ordered[i].offset + ordered[i - 1].offset) / 2)
        color = ordered[i - 1].color
      }
    }
    onValueChange({
      ...value,
      stops: [
        ...value.stops,
        { id: `${id}-stop-${crypto.randomUUID()}`, color, offset },
      ],
    })
  }
  return (
    <fieldset
      data-slot="gradient-picker"
      className={cn("evenform-gradient-picker", className)}
      disabled={disabled}
      {...props}
    >
      <legend>{label}</legend>
      <div
        data-slot="gradient-preview"
        role="img"
        aria-label={`${value.type} gradient with ${value.stops.length} color stops`}
        style={{ backgroundImage: gradientToCss(value) }}
      />
      <div data-slot="design-tool-toolbar">
        <RadioGroup
          value={value.type}
          disabled={disabled}
          onValueChange={(type) => {
            if (type) onValueChange({ ...value, type })
          }}
          aria-label="Gradient type"
          className="flex flex-wrap gap-field"
        >
          <label className="flex items-center gap-2">
            <RadioGroupItem value="linear" />
            Linear
          </label>
          <label className="flex items-center gap-2">
            <RadioGroupItem value="radial" />
            Radial
          </label>
        </RadioGroup>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() =>
            onValueChange({
              ...value,
              stops: value.stops.map((stop) => ({
                ...stop,
                offset: 100 - stop.offset,
              })),
            })
          }
        >
          <ArrowLeftRight />
          Reverse stops
        </Button>
      </div>
      {value.type === "linear" && (
        <div data-slot="design-tool-control">
          <label htmlFor={`${id}-angle`}>Angle</label>
          <Slider
            value={value.angle}
            min={0}
            max={360}
            step={1}
            disabled={disabled}
            getAriaLabel={() => "Gradient angle"}
            getAriaValueText={(angle) => `${angle} degrees`}
            onValueChange={(angle) => onValueChange({ ...value, angle })}
          />
          <Input
            id={`${id}-angle`}
            type="number"
            min={0}
            max={360}
            step={1}
            value={value.angle}
            disabled={disabled}
            onChange={(event) =>
              onValueChange({
                ...value,
                angle: clamp(event.target.valueAsNumber, 0, 360),
              })
            }
          />
          <span data-slot="design-tool-unit">°</span>
        </div>
      )}
      <div data-slot="design-tool-toolbar">
        <h3>Color stops</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={addStop}
        >
          <Plus />
          Add stop
        </Button>
      </div>
      <ol data-slot="gradient-stops">
        {value.stops.map((stop, index) => (
          <li key={stop.id} data-slot="gradient-stop">
            <ColorSwatch
              color={stop.color}
              aria-label={`Stop ${index + 1} color`}
            />
            <ColorField
              label={`Stop ${index + 1} color`}
              value={stop.color}
              isDisabled={disabled}
              onChange={(color) => {
                if (color)
                  updateStop(stop.id, { color: color.toString("hexa") })
              }}
            />
            <div data-slot="gradient-stop-offset">
              <label htmlFor={`${id}-${stop.id}-offset`}>Position</label>
              <div className="flex items-center gap-2">
                <Input
                  id={`${id}-${stop.id}-offset`}
                  aria-label={`Stop ${index + 1} position`}
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={stop.offset}
                  disabled={disabled}
                  onChange={(event) =>
                    updateStop(stop.id, {
                      offset: clamp(event.target.valueAsNumber, 0, 100),
                    })
                  }
                />
                <span data-slot="design-tool-unit">%</span>
              </div>
            </div>
            <Slider
              className="evenform-gradient-stop-slider"
              value={stop.offset}
              min={0}
              max={100}
              step={1}
              disabled={disabled}
              getAriaLabel={() => `Stop ${index + 1} position slider`}
              getAriaValueText={(offset) => `${offset} percent`}
              onValueChange={(offset) => updateStop(stop.id, { offset })}
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`Remove stop ${index + 1}`}
              disabled={disabled || value.stops.length <= 2}
              onClick={() =>
                onValueChange({
                  ...value,
                  stops: value.stops.filter((item) => item.id !== stop.id),
                })
              }
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ol>
      <p data-slot="design-tool-description">
        Use arrow keys to adjust positions by 1%. At least two color stops are
        required.
      </p>
    </fieldset>
  )
}
