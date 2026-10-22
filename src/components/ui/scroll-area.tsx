import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import { cn } from "@/lib/utils"
function ScrollAreaRoot({ className, ...props }: ScrollAreaPrimitive.Root.Props) {
  return <ScrollAreaPrimitive.Root data-slot="ScrollAreaRoot" className={(state) => cn("evenform-scroll-area", typeof className === "function" ? className(state) : className)} {...props} />
}
function ScrollAreaViewport({ className, ...props }: ScrollAreaPrimitive.Viewport.Props) {
  return <ScrollAreaPrimitive.Viewport data-slot="ScrollAreaViewport" className={(state) => cn("evenform-scroll-viewport", typeof className === "function" ? className(state) : className)} {...props} />
}
function ScrollAreaContent({ className, ...props }: ScrollAreaPrimitive.Content.Props) {
  return <ScrollAreaPrimitive.Content data-slot="ScrollAreaContent" className={(state) => cn("evenform-scroll-content", typeof className === "function" ? className(state) : className)} {...props} />
}
function ScrollAreaThumb({ className, ...props }: ScrollAreaPrimitive.Thumb.Props) {
  return <ScrollAreaPrimitive.Thumb data-slot="ScrollAreaThumb" className={(state) => cn("evenform-scroll-thumb", typeof className === "function" ? className(state) : className)} {...props} />
}
function ScrollAreaCorner({ className, ...props }: ScrollAreaPrimitive.Corner.Props) {
  return <ScrollAreaPrimitive.Corner data-slot="ScrollAreaCorner" className={(state) => cn("evenform-scroll-corner", typeof className === "function" ? className(state) : className)} {...props} />
}

function ScrollBar({className, children, orientation = "vertical", ...props}: ScrollAreaPrimitive.Scrollbar.Props) {
 return <ScrollAreaPrimitive.Scrollbar orientation={orientation} data-slot="scroll-area-scrollbar" className={(state) => cn("evenform-scrollbar", typeof className === "function" ? className(state) : className)} {...props}>{children ?? <ScrollAreaThumb />}</ScrollAreaPrimitive.Scrollbar>
}
type ScrollAreaProps = ScrollAreaPrimitive.Root.Props & { viewportProps?: ScrollAreaPrimitive.Viewport.Props; orientation?: "vertical" | "horizontal" | "both" }
function ScrollArea({children, viewportProps, orientation = "vertical", ...props}: ScrollAreaProps) {
 return <ScrollAreaRoot {...props}><ScrollAreaViewport {...viewportProps}><ScrollAreaContent>{children}</ScrollAreaContent></ScrollAreaViewport>{orientation !== "horizontal" && <ScrollBar />}{orientation !== "vertical" && <ScrollBar orientation="horizontal" />}<ScrollAreaCorner /></ScrollAreaRoot>
}
export { ScrollArea, ScrollAreaRoot, ScrollAreaViewport, ScrollAreaContent, ScrollBar, ScrollAreaThumb, ScrollAreaCorner }
export type { ScrollAreaProps }
