import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card"
import { cn } from "cn"
const PreviewCard = PreviewCardPrimitive.Root
const PreviewCardTrigger = PreviewCardPrimitive.Trigger
const PreviewCardViewport = PreviewCardPrimitive.Viewport
const createPreviewCardHandle = PreviewCardPrimitive.createHandle

type PreviewCardContentProps = PreviewCardPrimitive.Popup.Props & Pick<PreviewCardPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset">
function PreviewCardContent({className, side = "bottom", align = "start", sideOffset = 8, alignOffset = 0, ...props}: PreviewCardContentProps) {
 return <PreviewCardPrimitive.Portal><PreviewCardPrimitive.Positioner side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} className="isolate z-50"><PreviewCardPrimitive.Popup data-slot="preview-card-content" className={(state) => cn("evenform-floating-panel evenform-preview-card", typeof className === "function" ? className(state) : className)} {...props} /></PreviewCardPrimitive.Positioner></PreviewCardPrimitive.Portal>
}
export { PreviewCard, PreviewCardTrigger, PreviewCardContent, PreviewCardViewport, createPreviewCardHandle }
export type { PreviewCardContentProps }
