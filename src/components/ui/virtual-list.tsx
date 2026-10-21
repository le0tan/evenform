import {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
  type Key,
  type ReactNode,
  type Ref,
} from "react"
import {
  defaultRangeExtractor,
  useVirtualizer,
  type Range,
} from "@tanstack/react-virtual"
import { cn } from "@/lib/utils"

export type VirtualListHandle = {
  readonly scrollElement: HTMLDivElement | null
  /** Dynamic rows use immediate scrolling so measurements can settle correctly. */
  scrollToIndex: (
    index: number,
    options?: { align?: "auto" | "start" | "center" | "end" }
  ) => void
  measure: () => void
}

export type VirtualListProps<T> = Omit<
  ComponentProps<"div">,
  "children" | "ref" | "role"
> & {
  items: readonly T[]
  /** Stable identities are required when items can be filtered or reordered. */
  getItemKey: (item: T, index: number) => Key
  renderItem: (item: T, index: number) => ReactNode
  label: string
  /** Estimate in pixels; ResizeObserver measures each mounted row's actual height. */
  estimateSize: number | ((index: number) => number)
  overscan?: number
  virtualized?: boolean
  emptyContent?: ReactNode
  itemClassName?: string | ((item: T, index: number) => string)
  ref?: Ref<VirtualListHandle>
}

/** A vertical semantic list. It does not impose selection or listbox keyboard behavior.
 * The row containing focus stays mounted while scrolling; removing that data row is
 * the consumer's responsibility. Set virtualized=false for small lists or full DOM access.
 */
export function VirtualList<T>({
  items,
  getItemKey,
  renderItem,
  label,
  estimateSize,
  overscan = 4,
  virtualized = true,
  emptyContent = "No items.",
  itemClassName,
  className,
  ref,
  tabIndex = 0,
  ...props
}: VirtualListProps<T>) {
  "use no memo" // TanStack exposes a mutable virtualizer instance; do not compiler-memoize its methods.
  const scrollRef = useRef<HTMLDivElement>(null)
  const [focusedKey, setFocusedKey] = useState<Key | null>(null)
  const focusedIndex =
    focusedKey === null
      ? -1
      : items.findIndex((item, index) => getItemKey(item, index) === focusedKey)
  const rangeExtractor = useCallback(
    (range: Range) => {
      const indexes = defaultRangeExtractor(range)
      if (focusedIndex >= 0 && !indexes.includes(focusedIndex)) {
        indexes.push(focusedIndex)
        indexes.sort((a, b) => a - b)
      }
      return indexes
    },
    [focusedIndex]
  )
  const itemKey = useCallback(
    (index: number) => getItemKey(items[index], index),
    [items, getItemKey]
  )
  // The instance stays local; its mutable methods are deliberately read each render.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLLIElement>({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    getItemKey: itemKey,
    estimateSize:
      typeof estimateSize === "number" ? () => estimateSize : estimateSize,
    overscan,
    rangeExtractor,
    enabled: virtualized,
  })
  useImperativeHandle(
    ref,
    () => ({
      get scrollElement() {
        return scrollRef.current
      },
      scrollToIndex(index, options) {
        if (!items.length) return
        const target = Math.max(
          0,
          Math.min(items.length - 1, Math.trunc(index))
        )
        if (!Number.isFinite(target)) return
        if (virtualized) virtualizer.scrollToIndex(target, options)
        else {
          const container = scrollRef.current
          const element = container?.querySelector<HTMLElement>(
            `[data-virtual-index="${target}"]`
          )
          if (!container || !element) return
          const top =
            element.getBoundingClientRect().top -
            container.getBoundingClientRect().top -
            container.clientTop +
            container.scrollTop
          const bottom = top + element.offsetHeight
          const align = options?.align ?? "auto"
          const offset =
            align === "center"
              ? top - (container.clientHeight - element.offsetHeight) / 2
              : align === "end"
                ? bottom - container.clientHeight
                : align === "start" || top < container.scrollTop
                  ? top
                  : bottom > container.scrollTop + container.clientHeight
                    ? bottom - container.clientHeight
                    : container.scrollTop
          container.scrollTo({ top: offset })
        }
      },
      measure: () => virtualizer.measure(),
    }),
    [items.length, virtualized, virtualizer]
  )

  function row(index: number, start?: number) {
    const item = items[index]
    return (
      <li
        key={getItemKey(item, index)}
        ref={virtualized ? virtualizer.measureElement : undefined}
        data-index={index}
        data-virtual-index={index}
        data-slot="virtual-list-item"
        className={cn(
          "evenform-virtual-list-item",
          typeof itemClassName === "function"
            ? itemClassName(item, index)
            : itemClassName
        )}
        aria-posinset={index + 1}
        aria-setsize={items.length}
        style={
          virtualized
            ? {
                position: "absolute",
                top: 0,
                insetInlineStart: 0,
                width: "100%",
                transform: `translateY(${start}px)`,
              }
            : undefined
        }
        onFocusCapture={() => setFocusedKey(getItemKey(item, index))}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocusedKey(null)
        }}
      >
        {renderItem(item, index)}
      </li>
    )
  }

  return (
    <div
      {...props}
      ref={scrollRef}
      role="region"
      aria-label={label}
      tabIndex={tabIndex}
      data-slot="virtual-list"
      data-virtualized={virtualized || undefined}
      className={cn("evenform-virtual-list", className)}
    >
      {items.length === 0 ? (
        <div className="evenform-virtual-list-empty" role="status">
          {emptyContent}
        </div>
      ) : (
        <ul
          role="list"
          aria-label={label}
          className="evenform-virtual-list-content"
          style={
            virtualized
              ? { height: virtualizer.getTotalSize(), position: "relative" }
              : undefined
          }
        >
          {virtualized
            ? virtualizer
                .getVirtualItems()
                .map((item) => row(item.index, item.start))
            : items.map((_, index) => row(index))}
        </ul>
      )}
    </div>
  )
}
