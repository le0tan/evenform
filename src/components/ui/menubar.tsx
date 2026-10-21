import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "cn"
export {
  DropdownMenu as MenubarMenu, DropdownMenuContent as MenubarContent,
  DropdownMenuItem as MenubarItem, DropdownMenuGroup as MenubarGroup,
  DropdownMenuLabel as MenubarLabel, DropdownMenuSeparator as MenubarSeparator,
  DropdownMenuCheckboxItem as MenubarCheckboxItem, DropdownMenuRadioGroup as MenubarRadioGroup,
  DropdownMenuRadioItem as MenubarRadioItem, DropdownMenuSub as MenubarSub,
  DropdownMenuSubTrigger as MenubarSubTrigger, DropdownMenuSubContent as MenubarSubContent,
  DropdownMenuShortcut as MenubarShortcut,
} from "./dropdown-menu"
function Menubar({className, ...props}: MenubarPrimitive.Props) {
 return <MenubarPrimitive data-slot="menubar" className={(state) => cn("evenform-menubar", typeof className === "function" ? className(state) : className)} {...props} />
}
function MenubarTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="MenubarTrigger" className={(state) => cn("evenform-menu-bar-trigger", typeof className === "function" ? className(state) : className)} {...props} />
}
export { Menubar, MenubarTrigger }
