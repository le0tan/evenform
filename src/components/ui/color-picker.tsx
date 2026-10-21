import type { ComponentProps, ReactNode, RefAttributes } from "react"
import { ColorPicker as AriaColorPicker, ColorArea as AriaColorArea, ColorSlider as AriaColorSlider, ColorThumb as AriaColorThumb, ColorField as AriaColorField, ColorSwatch as AriaColorSwatch, SliderTrack, Input, Label, FieldError, composeRenderProps, type ColorPickerProps, type ColorAreaProps, type ColorSliderProps, type ColorFieldProps, type ColorThumbProps, type ColorSwatchProps } from "react-aria-components"
import { cn } from "@/lib/utils"

export function ColorArea({ className, children, ...props }: ColorAreaProps & RefAttributes<HTMLDivElement>) {
  return <AriaColorArea {...props} className={composeRenderProps(className, value => cn("evenform-color-area", value))}>{children ?? <ColorThumb />}</AriaColorArea>
}
export function ColorThumb({ className, ...props }: ColorThumbProps & RefAttributes<HTMLDivElement>) {
  return <AriaColorThumb {...props} className={composeRenderProps(className, value => cn("evenform-color-thumb", value))} />
}
export function ColorSlider({ className, label, children, ...props }: ColorSliderProps & RefAttributes<HTMLDivElement> & { label?: ReactNode }) {
  return <AriaColorSlider {...props} className={composeRenderProps(className, value => cn("evenform-color-slider", value))}>{children ?? <>{label && <Label className="evenform-field-label">{label}</Label>}<SliderTrack className="evenform-color-track"><ColorThumb /></SliderTrack></>}</AriaColorSlider>
}
export function ColorField({ className, label, errorMessage, children, ...props }: ColorFieldProps & RefAttributes<HTMLDivElement> & {label?: ReactNode; errorMessage?: ComponentProps<typeof FieldError>["children"]}) {
  return <AriaColorField {...props} className={composeRenderProps(className, value => cn("evenform-date-field evenform-color-field", value))}>{children ?? <>{label && <Label className="evenform-field-label">{label}</Label>}<Input className="evenform-color-input" /><FieldError className="evenform-field-error">{errorMessage}</FieldError></>}</AriaColorField>
}
export function ColorSwatch({ className, ...props }: ColorSwatchProps & RefAttributes<HTMLDivElement>) {
  return <AriaColorSwatch {...props} className={composeRenderProps(className, value => cn("evenform-color-swatch", value))} />
}
export type EvenformColorPickerProps = Omit<ColorPickerProps, "children"> & {label: ReactNode; children?: ColorPickerProps["children"]; showAlpha?: boolean; isDisabled?: boolean; className?: string; hueLabel?: string; alphaLabel?: string; valueLabel?: string}
export function ColorPicker({ label, className, children, showAlpha = false, isDisabled = false, hueLabel = "Hue", alphaLabel = "Opacity", valueLabel = "Hex color", ...props }: EvenformColorPickerProps) {
  return <AriaColorPicker {...props}>{children ?? <fieldset disabled={isDisabled} className={cn("evenform-color-picker", className)}><legend className="evenform-field-label">{label}</legend><ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" isDisabled={isDisabled} aria-label={typeof label === "string" ? label : undefined} /><ColorSlider channel="hue" colorSpace="hsb" label={hueLabel} isDisabled={isDisabled} />{showAlpha && <ColorSlider channel="alpha" label={alphaLabel} isDisabled={isDisabled} />}<div className="evenform-color-value"><ColorSwatch /><ColorField label={valueLabel} isDisabled={isDisabled} /></div></fieldset>}</AriaColorPicker>
}
export { AriaColorPicker as ColorPickerRoot, SliderTrack as ColorSliderTrack, Label as ColorLabel }
export { parseColor, getColorChannels } from "react-aria-components"
export type { Color, ColorSpace, ColorChannel } from "react-aria-components"
