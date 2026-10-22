import type { Ref } from "react"
import {
  Button as AriaButton,
  Checkbox as AriaCheckbox,
  Collection,
  Tree as AriaTree,
  TreeItem as AriaTreeItem,
  TreeItemContent,
  type TreeProps,
  type TreeItemProps,
  type TreeItemContentRenderProps,
  type CheckboxProps,
} from "react-aria-components"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Tree<T extends object>({
  className,
  ...props
}: TreeProps<T> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <AriaTree
      className={(state) =>
        cn(
          "evenform-tree",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

export function TreeItem<T extends object>({
  className,
  ...props
}: TreeItemProps<T> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <AriaTreeItem
      className={(state) =>
        cn(
          "evenform-tree-item",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

export function TreeSelectionCheckbox({
  className,
  children,
  ...props
}: CheckboxProps & { ref?: Ref<HTMLLabelElement> }) {
  return (
    <AriaCheckbox
      slot="selection"
      className={(state) =>
        cn(
          "evenform-tree-checkbox",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    >
      {(state) => (
        <>
          <span className="evenform-tree-checkbox-box" aria-hidden="true">
            {state.isSelected && <Check size={12} />}
          </span>
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </AriaCheckbox>
  )
}

/** Used inside TreeItemContent. Chevron and selection slots receive React Aria's behavior. */
export function TreeRow({
  children,
  selectionMode,
  ...state
}: Pick<TreeItemContentRenderProps, "hasChildItems" | "isExpanded"> & {
  children: React.ReactNode
  selectionMode?: "none" | "single" | "multiple"
}) {
  return (
    <>
      <AriaButton
        slot="chevron"
        className="evenform-tree-chevron"
        aria-label={state.isExpanded ? "Collapse" : "Expand"}
      >
        {state.hasChildItems && <ChevronRight size={14} aria-hidden="true" />}
      </AriaButton>
      {selectionMode === "multiple" && <TreeSelectionCheckbox />}
      <span className="evenform-tree-label">{children}</span>
    </>
  )
}

export { Collection, TreeItemContent }
export type { TreeProps, TreeItemProps, TreeItemContentRenderProps }
