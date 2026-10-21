import { useId, useState, type ComponentProps, type ReactNode } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "cn"
import { Button } from "./button"
import { Input } from "./input"

export interface TransferItem {
  id: string
  label: string
  description?: string
  disabled?: boolean
}

export interface TransferProps<T extends TransferItem> extends Omit<
  ComponentProps<"div">,
  "children" | "onChange"
> {
  items: readonly T[]
  targetKeys: readonly string[]
  onTargetKeysChange: (keys: string[]) => void
  selectedKeys?: readonly string[]
  onSelectedKeysChange?: (keys: string[]) => void
  sourceLabel?: string
  targetLabel?: string
  addLabel?: string
  removeLabel?: string
  emptyLabel?: string
  searchPlaceholder?: string
  searchable?: boolean
  disabled?: boolean
  renderItem?: (item: T) => ReactNode
}

/** A controlled partition of a caller-owned list. Checkboxes retain native keyboard semantics. */
export function Transfer<T extends TransferItem>({
  items,
  targetKeys,
  onTargetKeysChange,
  selectedKeys,
  onSelectedKeysChange,
  sourceLabel = "Available",
  targetLabel = "Selected",
  addLabel = "Add selected",
  removeLabel = "Remove selected",
  emptyLabel = "No items",
  searchPlaceholder = "Search…",
  searchable = true,
  disabled = false,
  renderItem,
  className,
  ...props
}: TransferProps<T>) {
  const id = useId()
  const [localSelection, setLocalSelection] = useState<string[]>([])
  const [queries, setQueries] = useState(["", ""])
  const selection = new Set(selectedKeys ?? localSelection)
  const targets = new Set(targetKeys)
  const panes = [
    items.filter((item) => !targets.has(item.id)),
    items.filter((item) => targets.has(item.id)),
  ]
  const updateSelection = (next: Set<string>) => {
    const keys = [...next]
    if (selectedKeys === undefined) setLocalSelection(keys)
    onSelectedKeysChange?.(keys)
  }
  const move = (toTarget: boolean) => {
    const eligible = items.filter(
      (item) =>
        selection.has(item.id) &&
        !item.disabled &&
        targets.has(item.id) !== toTarget
    )
    const next = new Set(targetKeys)
    const nextSelection = new Set(selection)
    for (const item of eligible) {
      if (toTarget) next.add(item.id)
      else next.delete(item.id)
      nextSelection.delete(item.id)
    }
    onTargetKeysChange([...next])
    updateSelection(nextSelection)
  }
  const canMove = (toTarget: boolean) =>
    !disabled &&
    items.some(
      (item) =>
        !item.disabled &&
        selection.has(item.id) &&
        targets.has(item.id) !== toTarget
    )
  return (
    <div
      className={cn("evenform-transfer", className)}
      data-slot="transfer"
      aria-disabled={disabled || undefined}
      {...props}
    >
      <div className="evenform-transfer-grid">
        {panes.map((pane, index) => {
          const label = index === 0 ? sourceLabel : targetLabel
          const visible = pane.filter((item) =>
            item.label
              .toLocaleLowerCase()
              .includes(queries[index].toLocaleLowerCase())
          )
          const eligible = visible.filter((item) => !item.disabled)
          const selected = eligible.filter((item) =>
            selection.has(item.id)
          ).length
          const checked = eligible.length > 0 && selected === eligible.length
          return (
            <fieldset
              key={index}
              className="evenform-transfer-pane"
              disabled={disabled}
            >
              <legend>
                {label} <span className="evenform-data-caption">{pane.length}</span>
              </legend>
              {searchable && (
                <>
                  <label htmlFor={`${id}-search-${index}`} className="sr-only">
                    Search {label.toLocaleLowerCase()}
                  </label>
                  <Input
                    id={`${id}-search-${index}`}
                    value={queries[index]}
                    placeholder={searchPlaceholder}
                    onChange={(event) =>
                      setQueries((previous) =>
                        previous.map((query, position) =>
                          position === index ? event.target.value : query
                        )
                      )
                    }
                  />
                </>
              )}
              <label className="evenform-transfer-check-all">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={eligible.length === 0}
                  ref={(node) => {
                    if (node) node.indeterminate = selected > 0 && !checked
                  }}
                  onChange={(event) => {
                    const next = new Set(selection)
                    for (const item of eligible) {
                      if (event.target.checked) next.add(item.id)
                      else next.delete(item.id)
                    }
                    updateSelection(next)
                  }}
                />
                <span>Select all shown</span>
                <span className="evenform-data-caption">
                  {selected}/{eligible.length}
                </span>
              </label>
              <ul className="evenform-transfer-list" aria-label={label}>
                {visible.map((item) => (
                  <li key={item.id}>
                    <label
                      className="evenform-transfer-item"
                      data-disabled={item.disabled || undefined}
                    >
                      <input
                        type="checkbox"
                        checked={selection.has(item.id)}
                        disabled={item.disabled}
                        onChange={(event) => {
                          const next = new Set(selection)
                          if (event.target.checked) next.add(item.id)
                          else next.delete(item.id)
                          updateSelection(next)
                        }}
                      />
                      <span>
                        {renderItem ? (
                          renderItem(item)
                        ) : (
                          <>
                            {item.label}
                            {item.description && (
                              <small>{item.description}</small>
                            )}
                          </>
                        )}
                      </span>
                    </label>
                  </li>
                ))}
                {visible.length === 0 && (
                  <li className="evenform-data-empty">{emptyLabel}</li>
                )}
              </ul>
            </fieldset>
          )
        })}
        <div className="evenform-transfer-actions">
          <Button
            variant="outline"
            disabled={!canMove(true)}
            onClick={() => move(true)}
          >
            <ArrowRight aria-hidden="true" />
            {addLabel}
          </Button>
          <Button
            variant="outline"
            disabled={!canMove(false)}
            onClick={() => move(false)}
          >
            <ArrowLeft aria-hidden="true" />
            {removeLabel}
          </Button>
        </div>
      </div>
      <span role="status" className="sr-only">
        {panes[1].length} items in {targetLabel.toLocaleLowerCase()}.
      </span>
    </div>
  )
}
