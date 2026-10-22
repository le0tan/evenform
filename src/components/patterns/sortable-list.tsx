import {
  Button as AriaButton,
  DropIndicator,
  GridList,
  GridListItem,
  useDragAndDrop,
  type Key,
} from "react-aria-components"
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react"
import { useRef, type ReactNode } from "react"
import { useListMotion } from "@/hooks/use-list-motion"
import { Button } from "@/components/ui/button"
export interface SortableItem {
  id: Key
  textValue: string
}
export interface SortableListProps<T extends SortableItem> {
  items: T[]
  onReorder: (items: T[]) => void
  children: (item: T) => ReactNode
  label: string
  disabled?: boolean
  empty?: ReactNode
  className?: string
  moveButtons?: boolean
  /** Optional layout continuity for this non-virtual list, after a reorder. */
  motion?: boolean
}
/** React Aria owns pointer/touch/keyboard drag behavior. The caller owns item order. */
export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  children,
  label,
  disabled,
  empty = "No items to reorder.",
  className,
  moveButtons = true,
  motion = false,
}: SortableListProps<T>) {
  const list = useRef<HTMLDivElement>(null)
  useListMotion(list, motion)
  function move(
    keys: Set<Key>,
    target: Key,
    position: "before" | "after" | "on"
  ) {
    if (disabled || keys.has(target) || position === "on") return
    const moving = items.filter((item) => keys.has(item.id))
    const remaining = items.filter((item) => !keys.has(item.id))
    const index = remaining.findIndex((item) => item.id === target)
    if (index < 0) return
    remaining.splice(index + (position === "after" ? 1 : 0), 0, ...moving)
    onReorder(remaining)
  }
  const { dragAndDropHooks } = useDragAndDrop<T>({
    isDisabled: disabled,
    getItems: (keys) =>
      items
        .filter((item) => keys.has(item.id))
        .map((item) => ({ "text/plain": item.textValue })),
    getAllowedDropOperations: () => ["move"],
    onReorder: (event) =>
      move(event.keys, event.target.key, event.target.dropPosition),
    renderDropIndicator: (target) => (
      <DropIndicator target={target} className="evenform-sortable-drop" />
    ),
  })
  return (
    <GridList
      ref={list}
      data-slot="sortable-list"
      className={
        className ? `evenform-sortable-list ${className}` : "evenform-sortable-list"
      }
      aria-label={label}
      items={items}
      dependencies={[items, disabled, moveButtons, children]}
      selectionMode="none"
      dragAndDropHooks={dragAndDropHooks}
      renderEmptyState={() => <p data-slot="product-content">{empty}</p>}
    >
      {(item) => {
        const index = items.findIndex((candidate) => candidate.id === item.id)
        return (
          <GridListItem
            id={item.id}
            textValue={item.textValue}
            data-slot="sortable-item"
            className="evenform-sortable-item"
          >
            <AriaButton
              slot="drag"
              className="evenform-sortable-handle"
              aria-label={`Reorder ${item.textValue}`}
              isDisabled={disabled}
            >
              <GripVertical size={16} />
            </AriaButton>
            <div data-slot="sortable-content">{children(item)}</div>
            {moveButtons && (
              <div data-slot="product-actions">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Move ${item.textValue} up`}
                  disabled={disabled || index === 0}
                  onClick={() =>
                    move(new Set([item.id]), items[index - 1].id, "before")
                  }
                >
                  <ArrowUp />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Move ${item.textValue} down`}
                  disabled={disabled || index === items.length - 1}
                  onClick={() =>
                    move(new Set([item.id]), items[index + 1].id, "after")
                  }
                >
                  <ArrowDown />
                </Button>
              </div>
            )}
          </GridListItem>
        )
      }}
    </GridList>
  )
}
