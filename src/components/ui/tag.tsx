import type { ComponentProps, ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Tag({ children, onRemove, removeLabel, disabled = false, className, ...props }: ComponentProps<"span"> & { onRemove?: () => void; removeLabel?: string; disabled?: boolean; children: ReactNode }) {
  return <span data-slot="tag" data-disabled={disabled || undefined} className={cn("ds-tag", className)} {...props}>{children}{onRemove && <button type="button" disabled={disabled} aria-label={removeLabel ?? `Remove ${typeof children === "string" ? children : "tag"}`} onClick={onRemove}><X size={12} aria-hidden="true" /></button>}</span>
}
