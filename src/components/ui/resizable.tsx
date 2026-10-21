import { type ComponentProps } from "react"
import { GripVertical } from "lucide-react"
import { Group, Panel, Separator } from "react-resizable-panels"
import { cn } from "@/lib/utils"

/** Thin visual wrappers over react-resizable-panels. The primitive retains
 * pointer/keyboard constraints, elementRef/panelRef/groupRef and persistence APIs. */
export function ResizablePanelGroup({ className, resizeTargetMinimumSize = { coarse: 44, fine: 12 }, ...props }: ComponentProps<typeof Group>) {
  return <Group data-slot="resizable-group" className={cn(className)} resizeTargetMinimumSize={resizeTargetMinimumSize} {...props} />
}

export function ResizablePanel({ className, ...props }: ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" className={cn(className)} {...props} />
}

export function ResizableHandle({ className, withHandle = false, children, ...props }: ComponentProps<typeof Separator> & { withHandle?: boolean }) {
  return <Separator data-slot="resizable-handle" className={cn(className)} {...props}>
    {children ?? (withHandle && <span data-slot="resizable-handle-grip" aria-hidden="true"><GripVertical /></span>)}
  </Separator>
}

export { useDefaultLayout, useGroupRef, useGroupCallbackRef, usePanelRef, usePanelCallbackRef } from "react-resizable-panels"
