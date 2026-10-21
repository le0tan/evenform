import type { ComponentProps, ReactNode } from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) { return <CommandPrimitive className={cn("evenform-command", className)} {...props} /> }
export function CommandInput({ className, ...props }: ComponentProps<typeof CommandPrimitive.Input>) { return <div className="evenform-command-search"><Search size={16} aria-hidden="true" /><CommandPrimitive.Input className={cn("evenform-command-input", className)} {...props} /></div> }
export function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) { return <CommandPrimitive.List className={cn("evenform-command-list", className)} {...props} /> }
export function CommandEmpty({ className, ...props }: ComponentProps<typeof CommandPrimitive.Empty>) { return <CommandPrimitive.Empty className={cn("evenform-command-empty", className)} {...props} /> }
export function CommandGroup({ className, ...props }: ComponentProps<typeof CommandPrimitive.Group>) { return <CommandPrimitive.Group className={cn("evenform-command-group", className)} {...props} /> }
export function CommandItem({ className, ...props }: ComponentProps<typeof CommandPrimitive.Item>) { return <CommandPrimitive.Item className={cn("evenform-command-item", className)} {...props} /> }
export function CommandSeparator({ className, ...props }: ComponentProps<typeof CommandPrimitive.Separator>) { return <CommandPrimitive.Separator className={cn("evenform-command-separator", className)} {...props} /> }
export function CommandLoading({ className, ...props }: ComponentProps<typeof CommandPrimitive.Loading>) { return <CommandPrimitive.Loading className={cn("evenform-command-empty", className)} {...props} /> }
export function CommandShortcut({ className, ...props }: ComponentProps<"span">) { return <span className={cn("evenform-command-shortcut", className)} {...props} /> }
export function CommandDialog({ title = "Search commands", description = "Type to find an action. Use the arrow keys to choose and Enter to run it.", commandProps, finalFocus, children, ...props }: Omit<ComponentProps<typeof Dialog>, "children"> & { children?: ReactNode; title?: ReactNode; description?: ReactNode; commandProps?: ComponentProps<typeof Command>; finalFocus?: ComponentProps<typeof DialogContent>["finalFocus"] }) {
  return <Dialog {...props}><DialogContent finalFocus={finalFocus} className="p-0 overflow-hidden" showCloseButton={false}><DialogHeader className="sr-only"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><Command label={typeof title === "string" ? title : undefined} {...commandProps}>{children}</Command></DialogContent></Dialog>
}
export { useCommandState } from "cmdk"
