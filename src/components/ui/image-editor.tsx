import { useEffect, useId, useRef, useState, type ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { Image } from "@/components/ui/image"
import { FileUpload, type FileRejection } from "@/components/ui/file-upload"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

export interface ImageEditorValue {
  mode: "fill" | "fit" | "crop" | "tile"
  /** Degrees in [-180, 180]. */
  rotation: number
  /** Multipliers in [0, 2], where 1 is unchanged. */
  brightness: number
  contrast: number
  saturation: number
  /** CSS blur radius in pixels, from 0 to 20. */
  blur: number
  /** Source-relative normalized crop rectangle. Width/height are at least .05. */
  crop: { x: number; y: number; width: number; height: number }
  /** Normalized object/background position. */
  position: { x: number; y: number }
  /** Width of each repeated tile as a percent of the preview width. */
  tileSize: number
}
export interface ImageEditorProps extends Omit<
  ComponentProps<"fieldset">,
  "children" | "onChange" | "defaultValue"
> {
  value: ImageEditorValue
  onValueChange: (value: ImageEditorValue) => void
  src?: string
  alt: string
  label?: string
  onFileSelect?: (file: File) => void
  onFilesRejected?: (rejections: FileRejection[]) => void
  maxFileSize?: number
}
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min))
}
/** Converts configuration to CSS filters; this is a rendering model, not a pixel export. */
export function imageEditorFilter(value: ImageEditorValue) {
  return `brightness(${clamp(value.brightness, 0, 2)}) contrast(${clamp(value.contrast, 0, 2)}) saturate(${clamp(value.saturation, 0, 2)}) blur(${clamp(value.blur, 0, 20)}px)`
}
export function ImageEditor({
  value,
  onValueChange,
  src,
  alt,
  label = "Image adjustments",
  onFileSelect,
  onFilesRejected,
  maxFileSize,
  disabled,
  className,
  ...props
}: ImageEditorProps) {
  const id = useId()
  const stage = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [natural, setNatural] = useState({ width: 1, height: 1 })
  useEffect(() => {
    const element = stage.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const crop = {
    width: clamp(value.crop.width, 0.05, 1),
    height: clamp(value.crop.height, 0.05, 1),
    x: clamp(value.crop.x, 0, 1 - clamp(value.crop.width, 0.05, 1)),
    y: clamp(value.crop.y, 0, 1 - clamp(value.crop.height, 0.05, 1)),
  }
  const ratio = (natural.width * crop.width) / (natural.height * crop.height)
  const cropWidth = Math.min(size.width, size.height * ratio)
  const cropHeight = cropWidth / ratio
  function changeCrop(key: keyof ImageEditorValue["crop"], amount: number) {
    const next = { ...crop, [key]: amount }
    next.width = clamp(next.width, 0.05, 1)
    next.height = clamp(next.height, 0.05, 1)
    next.x = clamp(next.x, 0, 1 - next.width)
    next.y = clamp(next.y, 0, 1 - next.height)
    onValueChange({ ...value, crop: next })
  }
  const adjustments = [
    {
      key: "rotation",
      label: "Rotation",
      min: -180,
      max: 180,
      step: 1,
      factor: 1,
      unit: "°",
    },
    {
      key: "brightness",
      label: "Brightness",
      min: 0,
      max: 200,
      step: 1,
      factor: 100,
      unit: "%",
    },
    {
      key: "contrast",
      label: "Contrast",
      min: 0,
      max: 200,
      step: 1,
      factor: 100,
      unit: "%",
    },
    {
      key: "saturation",
      label: "Saturation",
      min: 0,
      max: 200,
      step: 1,
      factor: 100,
      unit: "%",
    },
    {
      key: "blur",
      label: "Blur",
      min: 0,
      max: 20,
      step: 0.1,
      factor: 1,
      unit: "px",
    },
  ] as const
  return (
    <fieldset
      data-slot="image-editor"
      className={cn("evenform-image-editor", className)}
      disabled={disabled}
      {...props}
    >
      <legend>{label}</legend>
      {onFileSelect && (
        <FileUpload
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          multiple={false}
          maxFiles={1}
          maxSize={maxFileSize}
          disabled={disabled}
          buttonLabel="Choose image"
          label="Drop an image here"
          description="Image selection stays in your application."
          onFilesAccepted={(files) => {
            if (files[0]) onFileSelect(files[0])
          }}
          onFilesRejected={onFilesRejected}
        />
      )}
      <div data-slot="image-editor-preview" ref={stage}>
        {src ? (
          value.mode === "crop" ? (
            <div
              data-slot="image-editor-crop"
              style={{
                width: cropWidth || "100%",
                height: cropHeight || "100%",
                transform: `rotate(${value.rotation}deg)`,
                filter: imageEditorFilter(value),
              }}
            >
              <Image
                src={src}
                alt={alt}
                onLoad={(event) =>
                  setNatural({
                    width: event.currentTarget.naturalWidth || 1,
                    height: event.currentTarget.naturalHeight || 1,
                  })
                }
                containerProps={{
                  style: {
                    position: "absolute",
                    width: `${100 / crop.width}%`,
                    height: `${100 / crop.height}%`,
                    left: `${(-crop.x / crop.width) * 100}%`,
                    top: `${(-crop.y / crop.height) * 100}%`,
                    borderRadius: 0,
                  },
                }}
                style={{ objectFit: "fill" }}
              />
            </div>
          ) : (
            <Image
              src={src}
              alt={alt}
              onLoad={(event) =>
                setNatural({
                  width: event.currentTarget.naturalWidth || 1,
                  height: event.currentTarget.naturalHeight || 1,
                })
              }
              containerProps={{
                style: {
                  width: "100%",
                  height: "100%",
                  filter: imageEditorFilter(value),
                  transform: `rotate(${value.rotation}deg)`,
                  borderRadius: 0,
                  ...(value.mode === "tile"
                    ? {
                        backgroundImage: `url(${JSON.stringify(src)})`,
                        backgroundRepeat: "repeat",
                        backgroundSize: `${clamp(value.tileSize, 5, 100)}% auto`,
                        backgroundPosition: `${clamp(value.position.x, 0, 1) * 100}% ${clamp(value.position.y, 0, 1) * 100}%`,
                      }
                    : {}),
                },
              }}
              style={{
                objectFit: value.mode === "fit" ? "contain" : "cover",
                objectPosition: `${clamp(value.position.x, 0, 1) * 100}% ${clamp(value.position.y, 0, 1) * 100}%`,
                ...(value.mode === "tile" ? { opacity: 0 } : {}),
              }}
            />
          )
        ) : (
          <p data-slot="design-tool-description">
            Choose an image to preview adjustments.
          </p>
        )}
      </div>
      <RadioGroup
        aria-label="Image fit mode"
        value={value.mode}
        disabled={disabled}
        onValueChange={(mode) => {
          if (mode) onValueChange({ ...value, mode })
        }}
        className="flex flex-wrap gap-field"
      >
        {(["fill", "fit", "crop", "tile"] as const).map((mode) => (
          <label key={mode} className="flex items-center gap-2">
            <RadioGroupItem value={mode} />
            {mode[0].toUpperCase() + mode.slice(1)}
          </label>
        ))}
      </RadioGroup>
      {adjustments.map(
        ({ key, label: controlLabel, min, max, step, factor, unit }) => (
          <div key={key} data-slot="design-tool-control">
            <label htmlFor={`${id}-${key}`}>{controlLabel}</label>
            <Slider
              value={value[key] * factor}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              getAriaLabel={() => controlLabel}
              getAriaValueText={(_formatted, amount) =>
                `${Math.round(amount * 10) / 10} ${unit}`
              }
              onValueChange={(amount) =>
                onValueChange({ ...value, [key]: amount / factor })
              }
            />
            <Input
              id={`${id}-${key}`}
              type="number"
              min={min}
              max={max}
              step={step}
              value={Math.round(value[key] * factor * 10) / 10}
              disabled={disabled}
              onChange={(event) =>
                onValueChange({
                  ...value,
                  [key]: clamp(event.target.valueAsNumber, min, max) / factor,
                })
              }
            />
            <span data-slot="design-tool-unit">{unit}</span>
          </div>
        )
      )}
      {value.mode === "crop" ? (
        <div data-slot="image-editor-position">
          <h3>Source crop rectangle</h3>
          {(["x", "y", "width", "height"] as const).map((key) => (
            <div key={key} data-slot="design-tool-control">
              <label htmlFor={`${id}-crop-${key}`}>Crop {key}</label>
              <Slider
                value={crop[key] * 100}
                min={key === "width" || key === "height" ? 5 : 0}
                max={
                  key === "x"
                    ? Math.max(1, (1 - crop.width) * 100)
                    : key === "y"
                      ? Math.max(1, (1 - crop.height) * 100)
                      : 100
                }
                step={1}
                disabled={
                  disabled ||
                  (key === "x" && crop.width === 1) ||
                  (key === "y" && crop.height === 1)
                }
                getAriaLabel={() => `Crop ${key}`}
                onValueChange={(amount) => changeCrop(key, amount / 100)}
              />
              <Input
                id={`${id}-crop-${key}`}
                aria-label={`Crop ${key} percent`}
                type="number"
                min={key === "width" || key === "height" ? 5 : 0}
                max={
                  key === "x"
                    ? (1 - crop.width) * 100
                    : key === "y"
                      ? (1 - crop.height) * 100
                      : 100
                }
                step={1}
                value={Math.round(crop[key] * 100)}
                disabled={disabled}
                onChange={(event) =>
                  changeCrop(key, event.target.valueAsNumber / 100)
                }
              />
              <span data-slot="design-tool-unit">%</span>
            </div>
          ))}
        </div>
      ) : (
        <div data-slot="image-editor-position">
          <h3>Image position</h3>
          {(["x", "y"] as const).map((key) => (
            <div key={key} data-slot="design-tool-control">
              <label htmlFor={`${id}-position-${key}`}>Position {key}</label>
              <Slider
                value={value.position[key] * 100}
                min={0}
                max={100}
                step={1}
                disabled={disabled}
                getAriaLabel={() => `Image position ${key}`}
                onValueChange={(amount) =>
                  onValueChange({
                    ...value,
                    position: { ...value.position, [key]: amount / 100 },
                  })
                }
              />
              <Input
                id={`${id}-position-${key}`}
                type="number"
                min={0}
                max={100}
                step={1}
                value={Math.round(value.position[key] * 100)}
                disabled={disabled}
                onChange={(event) =>
                  onValueChange({
                    ...value,
                    position: {
                      ...value.position,
                      [key]: clamp(event.target.valueAsNumber, 0, 100) / 100,
                    },
                  })
                }
              />
              <span data-slot="design-tool-unit">%</span>
            </div>
          ))}
        </div>
      )}
      {value.mode === "tile" && (
        <div data-slot="design-tool-control">
          <label htmlFor={`${id}-tile`}>Tile width</label>
          <Slider
            value={value.tileSize}
            min={5}
            max={100}
            step={1}
            disabled={disabled}
            getAriaLabel={() => "Tile width"}
            onValueChange={(tileSize) => onValueChange({ ...value, tileSize })}
          />
          <Input
            id={`${id}-tile`}
            type="number"
            min={5}
            max={100}
            step={1}
            value={value.tileSize}
            disabled={disabled}
            onChange={(event) =>
              onValueChange({
                ...value,
                tileSize: clamp(event.target.valueAsNumber, 5, 100),
              })
            }
          />
          <span data-slot="design-tool-unit">%</span>
        </div>
      )}
      <p data-slot="design-tool-description">
        Configuration updates the CSS preview. Source files, object URLs,
        persistence, and pixel export belong to your application.
      </p>
    </fieldset>
  )
}
