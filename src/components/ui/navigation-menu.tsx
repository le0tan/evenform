import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { cn } from "cn"
const NavigationMenu = NavigationMenuPrimitive.Root
const NavigationMenuItem = NavigationMenuPrimitive.Item
const NavigationMenuIcon = NavigationMenuPrimitive.Icon
const NavigationMenuPortal = NavigationMenuPrimitive.Portal
const NavigationMenuPositioner = NavigationMenuPrimitive.Positioner
function NavigationMenuList({ className, ...props }: NavigationMenuPrimitive.List.Props) {
  return <NavigationMenuPrimitive.List data-slot="NavigationMenuList" className={(state) => cn("evenform-navigation-list", typeof className === "function" ? className(state) : className)} {...props} />
}
function NavigationMenuTrigger({ className, ...props }: NavigationMenuPrimitive.Trigger.Props) {
  return <NavigationMenuPrimitive.Trigger data-slot="NavigationMenuTrigger" className={(state) => cn("evenform-menu-bar-trigger", typeof className === "function" ? className(state) : className)} {...props} />
}
function NavigationMenuContent({ className, ...props }: NavigationMenuPrimitive.Content.Props) {
  return <NavigationMenuPrimitive.Content data-slot="NavigationMenuContent" className={(state) => cn("evenform-navigation-content", typeof className === "function" ? className(state) : className)} {...props} />
}
function NavigationMenuLink({ className, ...props }: NavigationMenuPrimitive.Link.Props) {
  return <NavigationMenuPrimitive.Link data-slot="NavigationMenuLink" className={(state) => cn("evenform-navigation-link", typeof className === "function" ? className(state) : className)} {...props} />
}
function NavigationMenuPopup({ className, ...props }: NavigationMenuPrimitive.Popup.Props) {
  return <NavigationMenuPrimitive.Popup data-slot="NavigationMenuPopup" className={(state) => cn("evenform-floating-panel evenform-navigation-popup", typeof className === "function" ? className(state) : className)} {...props} />
}
function NavigationMenuViewport({ className, ...props }: NavigationMenuPrimitive.Viewport.Props) {
  return <NavigationMenuPrimitive.Viewport data-slot="NavigationMenuViewport" className={(state) => cn("evenform-navigation-viewport", typeof className === "function" ? className(state) : className)} {...props} />
}

type NavigationMenuOverlayProps = NavigationMenuPrimitive.Popup.Props & Pick<NavigationMenuPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset">
function NavigationMenuOverlay({side = "bottom", sideOffset = 8, align = "start", alignOffset = 0, children, ...props}: NavigationMenuOverlayProps) {
 return <NavigationMenuPortal><NavigationMenuPositioner side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset} className="isolate z-50"><NavigationMenuPopup {...props}>{children ?? <NavigationMenuViewport />}</NavigationMenuPopup></NavigationMenuPositioner></NavigationMenuPortal>
}
export { NavigationMenu, NavigationMenuItem, NavigationMenuIcon, NavigationMenuList, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuOverlay, NavigationMenuPopup, NavigationMenuViewport, NavigationMenuPortal, NavigationMenuPositioner }
export type { NavigationMenuOverlayProps }
