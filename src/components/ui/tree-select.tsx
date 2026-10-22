import {
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Key } from "react-aria-components"
import { Button } from "./button"
import { Popover, PopoverTrigger, PopoverContent } from "./popover"
import { Collection, Tree, TreeItem, TreeItemContent, TreeRow } from "./tree"

export interface TreeSelectNode {
  id: string
  label: string
  children?: TreeSelectNode[]
  disabled?: boolean
  icon?: ReactNode
}

export interface TreeSelectProps extends Omit<
  ComponentProps<"div">,
  "children" | "onChange" | "defaultValue"
> {
  items: readonly TreeSelectNode[]
  selectedKeys: readonly string[]
  onSelectionChange: (keys: string[]) => void
  selectionMode?: "single" | "multiple"
  placeholder?: string
  label: string
  name?: string
  disabled?: boolean
  invalid?: boolean
  description?: ReactNode
  error?: ReactNode
  expandedKeys?: Iterable<Key>
  defaultExpandedKeys?: Iterable<Key>
  onExpandedChange?: (keys: Set<Key>) => void
  clearLabel?: string
  emptyLabel?: string
  triggerProps?: Omit<
    ComponentProps<typeof Button>,
    "children" | "disabled" | "aria-invalid"
  >
}

/** Parent and child selection are independent; no implicit cascade or partial selection. */
export function TreeSelect({
  items,
  selectedKeys,
  onSelectionChange,
  selectionMode = "single",
  placeholder = "Choose…",
  label,
  name,
  disabled,
  invalid,
  description,
  error,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  clearLabel = "Clear selection",
  emptyLabel = "No options",
  triggerProps,
  className,
  ...props
}: TreeSelectProps) {
  const id = useId()
  const treeRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const labels = new Map<string, string>()
  const collect = (nodes: readonly TreeSelectNode[]) => {
    for (const node of nodes) {
      labels.set(node.id, node.label)
      if (node.children) collect(node.children)
    }
  }
  collect(items)
  const renderItem = (item: TreeSelectNode): ReactNode => (
    <TreeItem id={item.id} textValue={item.label} isDisabled={disabled || item.disabled}>
      <TreeItemContent>
        {(state) => (
          <TreeRow {...state} selectionMode={selectionMode}>
            {item.icon}
            {item.label}
          </TreeRow>
        )}
      </TreeItemContent>
      <Collection items={item.children ?? []}>{renderItem}</Collection>
    </TreeItem>
  )
  return (
    <div
      className={cn("evenform-tree-select", className)}
      data-slot="tree-select"
      {...props}
    >
      <span id={`${id}-label`} className="evenform-tree-select-label">
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              {...triggerProps}
              disabled={disabled}
              className={(state) => cn(
                "evenform-tree-select-trigger",
                typeof triggerProps?.className === "function" ? triggerProps.className(state) : triggerProps?.className
              )}
              aria-labelledby={`${id}-label ${id}-value`}
              aria-invalid={invalid || undefined}
              aria-describedby={
                [
                  description ? `${id}-description` : undefined,
                  error ? `${id}-error` : undefined,
                  triggerProps?.["aria-describedby"],
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
            />
          }
        >
          <span
            id={`${id}-value`}
            data-placeholder={selectedKeys.length === 0 || undefined}
          >
            {selectedKeys.length
              ? selectedKeys.map((key) => labels.get(key) ?? key).join(", ")
              : placeholder}
          </span>
          <ChevronDown size={14} aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="evenform-tree-select-popup"
          initialFocus={() =>
            treeRef.current?.querySelector<HTMLElement>('[tabindex="0"]') ??
            treeRef.current
          }
          aria-label={label}
        >
          <Tree
            ref={treeRef}
            aria-label={label}
            items={items}
            selectionMode={selectionMode}
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            defaultExpandedKeys={defaultExpandedKeys}
            onExpandedChange={onExpandedChange}
            escapeKeyBehavior="none"
            onSelectionChange={(keys) => {
              if (disabled) return
              onSelectionChange(
                keys === "all" ? [...labels.keys()] : [...keys].map(String)
              )
              if (selectionMode === "single") setOpen(false)
            }}
            renderEmptyState={() => (
              <div className="evenform-data-empty">{emptyLabel}</div>
            )}
          >
            {renderItem}
          </Tree>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || selectedKeys.length === 0}
            onClick={() => onSelectionChange([])}
          >
            {clearLabel}
          </Button>
        </PopoverContent>
      </Popover>
      {name &&
        selectedKeys.map((key) => (
          <input
            key={key}
            type="hidden"
            name={name}
            value={key}
            disabled={disabled}
          />
        ))}
      {description && (
        <p id={`${id}-description`} className="evenform-data-caption">
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="evenform-data-error">
          {error}
        </p>
      )}
    </div>
  )
}
