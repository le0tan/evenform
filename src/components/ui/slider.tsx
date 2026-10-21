import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "cn"

const SliderRoot = SliderPrimitive.Root
const SliderLabel = SliderPrimitive.Label
const SliderValue = SliderPrimitive.Value

function SliderControl({ className, ...props }: SliderPrimitive.Control.Props) {
  return (
    <SliderPrimitive.Control
      data-slot="slider-control"
      className={(state) =>
        cn(
          "evenform-slider-control",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function SliderTrack({ className, ...props }: SliderPrimitive.Track.Props) {
  return (
    <SliderPrimitive.Track
      data-slot="slider-track"
      className={(state) =>
        cn(
          "evenform-slider-track",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function SliderRange({ className, ...props }: SliderPrimitive.Indicator.Props) {
  return (
    <SliderPrimitive.Indicator
      data-slot="slider-range"
      className={(state) =>
        cn(
          "evenform-slider-range",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function SliderThumb({ className, ...props }: SliderPrimitive.Thumb.Props) {
  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      className={(state) =>
        cn(
          "evenform-slider-thumb",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

type SliderProps<
  Value extends number | readonly number[] = number | readonly number[],
> = Omit<SliderPrimitive.Root.Props<Value>, "children"> &
  Pick<SliderPrimitive.Thumb.Props, "getAriaLabel" | "getAriaValueText">

// Value count determines thumb count. Base UI owns all pointer/keyboard state.
// Use the exported parts when a label, output, or custom thumb layout is needed.
function Slider<Value extends number | readonly number[]>({
  className,
  value,
  defaultValue,
  getAriaLabel,
  getAriaValueText,
  ...props
}: SliderProps<Value>) {
  const values = value ?? defaultValue
  const thumbCount = Array.isArray(values) ? values.length : 1
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={(state) =>
        cn(
          "evenform-slider",
          typeof className === "function" ? className(state) : className
        )
      }
      value={value}
      defaultValue={defaultValue}
      {...props}
    >
      <SliderControl>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        {Array.from({ length: thumbCount }, (_, index) => (
          <SliderThumb
            key={index}
            index={index}
            getAriaLabel={getAriaLabel}
            getAriaValueText={getAriaValueText}
          />
        ))}
      </SliderControl>
    </SliderPrimitive.Root>
  )
}

export {
  Slider,
  SliderRoot,
  SliderControl,
  SliderTrack,
  SliderRange,
  SliderThumb,
  SliderLabel,
  SliderValue,
}
export type { SliderProps }
