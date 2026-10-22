import { Meter as MeterPrimitive } from "@base-ui/react/meter"
import { cn } from "@/lib/utils"
function MeterRoot({ className, ...props }: MeterPrimitive.Root.Props) {
  return <MeterPrimitive.Root data-slot="MeterRoot" className={(state) => cn("evenform-meter", typeof className === "function" ? className(state) : className)} {...props} />
}
function MeterLabel({ className, ...props }: MeterPrimitive.Label.Props) {
  return <MeterPrimitive.Label data-slot="MeterLabel" className={(state) => cn("evenform-meter-label", typeof className === "function" ? className(state) : className)} {...props} />
}
function MeterValue({ className, ...props }: MeterPrimitive.Value.Props) {
  return <MeterPrimitive.Value data-slot="MeterValue" className={(state) => cn("evenform-meter-value", typeof className === "function" ? className(state) : className)} {...props} />
}
function MeterTrack({ className, ...props }: MeterPrimitive.Track.Props) {
  return <MeterPrimitive.Track data-slot="MeterTrack" className={(state) => cn("evenform-meter-track", typeof className === "function" ? className(state) : className)} {...props} />
}
function MeterIndicator({ className, ...props }: MeterPrimitive.Indicator.Props) {
  return <MeterPrimitive.Indicator data-slot="MeterIndicator" className={(state) => cn("evenform-meter-indicator", typeof className === "function" ? className(state) : className)} {...props} />
}

function Meter({children, ...props}: MeterPrimitive.Root.Props) {
 return <MeterRoot {...props}>{children ?? <MeterTrack><MeterIndicator /></MeterTrack>}</MeterRoot>
}
export { Meter, MeterRoot, MeterLabel, MeterValue, MeterTrack, MeterIndicator }
