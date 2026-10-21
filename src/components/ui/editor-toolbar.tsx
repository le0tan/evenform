import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar"
import { cn } from "cn"
/* Roving focus belongs to this toolbar; the layout-only Toolbar pattern remains
   suitable for ordinary groups of independent page actions. Compose Toggle into
   EditorToolbarButton via render for pressed state without nested buttons. */
function EditorToolbar({ className, ...props }: ToolbarPrimitive.Root.Props) {
  return <ToolbarPrimitive.Root data-slot="EditorToolbar" className={(state) => cn("evenform-editor-toolbar", typeof className === "function" ? className(state) : className)} {...props} />
}
function EditorToolbarGroup({ className, ...props }: ToolbarPrimitive.Group.Props) {
  return <ToolbarPrimitive.Group data-slot="EditorToolbarGroup" className={(state) => cn("evenform-editor-toolbar-group", typeof className === "function" ? className(state) : className)} {...props} />
}
function EditorToolbarButton({ className, ...props }: ToolbarPrimitive.Button.Props) {
  return <ToolbarPrimitive.Button data-slot="EditorToolbarButton" className={(state) => cn("evenform-editor-toolbar-button", typeof className === "function" ? className(state) : className)} {...props} />
}
function EditorToolbarLink({ className, ...props }: ToolbarPrimitive.Link.Props) {
  return <ToolbarPrimitive.Link data-slot="EditorToolbarLink" className={(state) => cn("evenform-editor-toolbar-button", typeof className === "function" ? className(state) : className)} {...props} />
}
function EditorToolbarInput({ className, ...props }: ToolbarPrimitive.Input.Props) {
  return <ToolbarPrimitive.Input data-slot="EditorToolbarInput" className={(state) => cn("evenform-editor-toolbar-input", typeof className === "function" ? className(state) : className)} {...props} />
}
function EditorToolbarSeparator({ className, ...props }: ToolbarPrimitive.Separator.Props) {
  return <ToolbarPrimitive.Separator data-slot="EditorToolbarSeparator" className={(state) => cn("evenform-editor-toolbar-separator", typeof className === "function" ? className(state) : className)} {...props} />
}

export { EditorToolbar, EditorToolbarGroup, EditorToolbarButton, EditorToolbarLink, EditorToolbarInput, EditorToolbarSeparator }
