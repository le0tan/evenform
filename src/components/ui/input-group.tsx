import type { ComponentProps } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function InputGroup({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="input-group" className={cn("ds-input-group", className)} {...props} />
}
export function InputGroupAddon({ className, align = "start", ...props }: ComponentProps<"div"> & { align?: "start" | "end" }) {
  return <div data-align={align} className={cn("ds-input-group-addon", className)} {...props} />
}
export function InputGroupInput({ className, ...props }: ComponentProps<typeof Input>) {
  return <Input className={cn("ds-input-group-input rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent", className)} {...props} />
}
export function InputGroupTextarea({ className, ...props }: ComponentProps<typeof Textarea>) {
  return <Textarea className={cn("ds-input-group-input rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent", className)} {...props} />
}
