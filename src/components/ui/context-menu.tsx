import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { cn } from "@/lib/utils"
export {
  DropdownMenuItem as ContextMenuItem, DropdownMenuGroup as ContextMenuGroup,
  DropdownMenuLabel as ContextMenuLabel, DropdownMenuSeparator as ContextMenuSeparator,
  DropdownMenuCheckboxItem as ContextMenuCheckboxItem, DropdownMenuRadioGroup as ContextMenuRadioGroup,
  DropdownMenuRadioItem as ContextMenuRadioItem, DropdownMenuSub as ContextMenuSub,
  DropdownMenuSubTrigger as ContextMenuSubTrigger, DropdownMenuSubContent as ContextMenuSubContent,
  DropdownMenuShortcut as ContextMenuShortcut,
} from "./dropdown-menu"
const ContextMenu = ContextMenuPrimitive.Root
function ContextMenuTrigger({ onKeyDown, ...props }: ContextMenuPrimitive.Trigger.Props) {
  return <ContextMenuPrimitive.Trigger {...props} onKeyDown={(event) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.nativeEvent.isComposing || !(event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey))) return
    // macOS browsers do not generate a contextmenu event for Shift+F10.
    // Route the keyboard request through the primitive's normal opening path.
    event.preventDefault()
    const trigger = event.currentTarget
    const rect = trigger.getBoundingClientRect()
    const MouseEventConstructor = trigger.ownerDocument.defaultView?.MouseEvent
    if (MouseEventConstructor) trigger.dispatchEvent(new MouseEventConstructor("contextmenu", {
      bubbles: true, cancelable: true, clientX: rect.left, clientY: rect.bottom,
    }))
  }} />
}
const ContextMenuLinkItem = ContextMenuPrimitive.LinkItem

type ContextMenuContentProps = ContextMenuPrimitive.Popup.Props & Pick<ContextMenuPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset">
function ContextMenuContent({className, side, align, sideOffset, alignOffset, ...props}: ContextMenuContentProps) {
  return <ContextMenuPrimitive.Portal><ContextMenuPrimitive.Positioner side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} className="isolate z-50"><ContextMenuPrimitive.Popup data-slot="context-menu-content" className={(state) => cn("evenform-floating-panel evenform-menu", typeof className === "function" ? className(state) : className)} {...props} /></ContextMenuPrimitive.Positioner></ContextMenuPrimitive.Portal>
}
export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuLinkItem }
export type { ContextMenuContentProps }
