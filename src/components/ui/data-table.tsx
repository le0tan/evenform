import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react"
import {
  useTable,
  tableFeatures,
  columnFilteringFeature,
  globalFilteringFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowExpandingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnResizingFeature,
  createFilteredRowModel,
  createSortedRowModel,
  createPaginatedRowModel,
  createExpandedRowModel,
  filterFns,
  sortFns,
  type ColumnDef,
  type ReactTable,
  type TableOptions,
  type Column,
  type Header,
  type Row,
  type RowData,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  TableCaption,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Stable v9 registry: consumers retain controlled state and manual row-model options.
const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowExpandingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnResizingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns,
  sortFns,
})
type DataTableFeatures = typeof dataTableFeatures
type DataTableInstance<TData extends RowData> = ReactTable<
  DataTableFeatures,
  TData
>
type DataTableColumnDef<TData extends RowData> = ColumnDef<
  DataTableFeatures,
  TData
>
type DataTableOptions<TData extends RowData> = Omit<
  TableOptions<DataTableFeatures, TData>,
  "features"
>

/** Keep data and columns stable, and use getRowId for persistent selection across server pages. */
function useDataTable<TData extends RowData>(options: DataTableOptions<TData>) {
  return useTable({ ...options, features: dataTableFeatures })
}

type DataTableProps<TData extends RowData> = ComponentProps<typeof Table> & {
  table: DataTableInstance<TData>
  caption?: ReactNode
  loading?: boolean
  error?: ReactNode
  loadingContent?: ReactNode
  emptyContent?: ReactNode
  /** Render resize handles and use exact column widths. Pinning also enables exact widths. */
  resizableColumns?: boolean
  rowProps?: (
    row: Row<DataTableFeatures, TData>
  ) => ComponentProps<typeof TableRow>
}

/** Semantic table renderer; toolbar, fetching and row actions remain compositions. */
function DataTable<TData extends RowData>({
  table,
  caption,
  loading = false,
  error,
  loadingContent = "Loading records…",
  emptyContent = "No matching records.",
  rowProps,
  resizableColumns = false,
  className,
  style,
  ...props
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows
  const pinned = table.getIsSomeColumnsPinned()
  const sized =
    resizableColumns ||
    pinned ||
    Object.keys(table.state.columnSizing).length > 0
  // Build each region separately so grouped headers can span only their own region.
  const headerRegions = pinned
    ? [
        { position: "start" as const, groups: table.getStartHeaderGroups() },
        { position: false as const, groups: table.getCenterHeaderGroups() },
        { position: "end" as const, groups: table.getEndHeaderGroups() },
      ]
    : [{ position: false as const, groups: table.getHeaderGroups() }]
  const columnCount = Math.max(table.getVisibleLeafColumns().length, 1)
  const hasError = error !== undefined && error !== null && error !== false
  const stateContent = hasError
    ? error
    : loading && !rows.length
      ? loadingContent
      : !rows.length
        ? emptyContent
        : null
  return (
    <Table
      {...props}
      aria-busy={loading || undefined}
      className={cn("evenform-data-table", className)}
      data-column-sizing={sized || undefined}
      style={{ ...(sized ? { width: table.getTotalSize() } : {}), ...style }}
    >
      {caption && <TableCaption>{caption}</TableCaption>}
      {sized && (
        <colgroup>
          {table.getVisibleLeafColumns().map((column) => (
            <col key={column.id} style={{ width: column.getSize() }} />
          ))}
        </colgroup>
      )}
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {headerRegions.flatMap(({ position, groups }) =>
              (groups[group.depth]?.headers ?? []).map((header) => {
                const leaves = header
                  .getLeafHeaders()
                  .filter((leaf) => !leaf.subHeaders.length)
                const first = leaves[0]?.column
                const last = leaves.at(-1)?.column
                return (
                  <TableHead
                    key={`${position}-${header.id}`}
                    className="evenform-data-table-head"
                    data-pinned={position || undefined}
                    style={
                      position && first && last
                        ? {
                            insetInlineStart:
                              position === "start"
                                ? first.getStart("start")
                                : undefined,
                            insetInlineEnd:
                              position === "end"
                                ? last.getAfter("end")
                                : undefined,
                          }
                        : undefined
                    }
                    colSpan={header.colSpan}
                    scope={header.colSpan > 1 ? "colgroup" : "col"}
                    aria-sort={
                      header.column.getCanSort()
                        ? header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                    {resizableColumns &&
                      !header.isPlaceholder &&
                      !header.subHeaders.length && (
                        <DataTableResizeHandle header={header} />
                      )}
                  </TableHead>
                )
              })
            )}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {stateContent !== null ? (
          <TableRow>
            <TableCell colSpan={columnCount} className="evenform-data-table-state">
              <div role={hasError ? "alert" : "status"}>{stateContent}</div>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
              {...rowProps?.(row)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  data-pinned={cell.column.getIsPinned() || undefined}
                  style={getDataTablePinningStyle(cell.column)}
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

/** Sticky offsets use the same resolved widths as the table's colgroup. */
function getDataTablePinningStyle<TData extends RowData>(
  column: Column<DataTableFeatures, TData>
): CSSProperties | undefined {
  const position = column.getIsPinned()
  if (!position) return undefined
  return position === "start"
    ? { insetInlineStart: column.getStart("start") }
    : { insetInlineEnd: column.getAfter("end") }
}

/** Compose into a cell for tree data from getSubRows, or a consumer-owned expansion. */
function DataTableTreeCell<TData extends RowData>({
  row,
  children,
  expandLabel = "Expand row",
  collapseLabel = "Collapse row",
  className,
  style,
  ...props
}: ComponentProps<"div"> & {
  row: Row<DataTableFeatures, TData>
  expandLabel?: string
  collapseLabel?: string
}) {
  return (
    <div
      {...props}
      className={cn("evenform-data-table-tree-cell", className)}
      style={{ "--_data-table-depth": row.depth, ...style } as CSSProperties}
    >
      {row.getCanExpand() ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={row.getIsExpanded() ? collapseLabel : expandLabel}
          aria-expanded={row.getIsExpanded()}
          onClick={row.getToggleExpandedHandler()}
        >
          {row.getIsExpanded() ? (
            <ChevronDownIcon aria-hidden="true" />
          ) : (
            <ChevronRightIcon aria-hidden="true" />
          )}
        </Button>
      ) : (
        <span className="evenform-data-table-tree-spacer" aria-hidden="true" />
      )}
      <span className="evenform-data-table-tree-content">{children}</span>
    </div>
  )
}

/** Keyboard and pointer resizing share the actual TanStack column-sizing state. */
function DataTableResizeHandle<TData extends RowData>({
  header,
  label = `Resize ${header.column.id} column`,
}: {
  header: Header<DataTableFeatures, TData>
  label?: string
}) {
  const column = header.column
  if (!column.getCanResize()) return null
  const table = column.table
  const size = column.getSize()
  const min = column.columnDef.minSize ?? 20
  const max = column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER
  const isResizing = column.getIsResizing()
  const direction = table.options.columnResizeDirection === "rtl" ? -1 : 1
  const pendingOffset =
    isResizing && table.options.columnResizeMode !== "onChange"
      ? (table.atoms.columnResizing.get().deltaOffset ?? 0) * direction
      : 0
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(size)}
      aria-valuetext={`${Math.round(size)} pixels; arrow keys resize, Enter resets`}
      className="evenform-data-table-resize"
      data-resizing={isResizing || undefined}
      style={
        pendingOffset
          ? { transform: `translateX(${pendingOffset}px)` }
          : undefined
      }
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      onDoubleClick={() => column.resetSize()}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          column.resetSize()
        } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault()
          const delta =
            (event.key === "ArrowRight" ? 1 : -1) *
            direction *
            (event.shiftKey ? 50 : 10)
          table.setColumnSizing((old) => ({
            ...old,
            [column.id]: Math.min(max, Math.max(min, size + delta)),
          }))
        }
      }}
    />
  )
}

function DataTableColumnHeader<TData extends RowData>({
  column,
  children,
  className,
  ...props
}: Omit<ComponentProps<typeof Button>, "children" | "className"> & {
  className?: string
  column: Column<DataTableFeatures, TData>
  children: ReactNode
}) {
  if (!column.getCanSort()) return <span className={className}>{children}</span>
  const sorted = column.getIsSorted()
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      {...props}
      className={cn("evenform-data-table-sort", className)}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) column.getToggleSortingHandler()?.(event)
      }}
    >
      {children}
      {sorted === "asc" ? (
        <ArrowUpIcon aria-hidden="true" />
      ) : sorted === "desc" ? (
        <ArrowDownIcon aria-hidden="true" />
      ) : (
        <ArrowUpDownIcon aria-hidden="true" />
      )}
      <span className="sr-only">
        {sorted
          ? `Sorted ${sorted === "asc" ? "ascending" : "descending"}; activate to change sorting`
          : "Sort column"}
      </span>
    </Button>
  )
}

/** Native checkbox supports mixed state without making table rows interactive. */
function setInputRef(
  ref: Ref<HTMLInputElement> | undefined,
  node: HTMLInputElement | null
) {
  if (typeof ref === "function") return ref(node)
  if (ref) ref.current = node
}

function DataTableCheckbox({
  indeterminate,
  className,
  ref,
  ...props
}: ComponentProps<"input"> & { indeterminate?: boolean }) {
  const element = useRef<HTMLInputElement>(null)
  // Native activation clears indeterminate even when the controlled prop stays
  // true. Restore it after every render, as React does for the checked value.
  useLayoutEffect(() => {
    if (element.current) element.current.indeterminate = !!indeterminate
  })
  const mergedRef = useCallback(
    (node: HTMLInputElement | null) => {
      element.current = node
      const cleanup = setInputRef(ref, node)
      return () => {
        element.current = null
        if (typeof cleanup === "function") cleanup()
        else setInputRef(ref, null)
      }
    },
    [ref]
  )
  return (
    <input
      {...props}
      type="checkbox"
      ref={mergedRef}
      className={cn("evenform-data-table-checkbox", className)}
    />
  )
}

type DataTablePaginationProps<TData extends RowData> = ComponentProps<"nav"> & {
  table: DataTableInstance<TData>
  pageSizes?: number[]
  pageSizeLabel?: string
  allRowsLabel?: string
  previousLabel?: string
  nextLabel?: string
  formatPage?: (page: number, pageCount: number) => ReactNode
}
function DataTablePagination<TData extends RowData>({
  table,
  pageSizes = [10, 20, 50],
  pageSizeLabel = "Rows per page",
  allRowsLabel = "All rows",
  previousLabel = "Previous page",
  nextLabel = "Next page",
  formatPage = (page, pageCount) =>
    pageCount < 0
      ? `Page ${page}`
      : pageCount === 0
        ? "No pages"
        : `Page ${page} of ${pageCount}`,
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const pageSizeId = useId()
  const { pageIndex, pageSize } = table.state.pagination
  const sizes = [...new Set([...pageSizes, pageSize])].filter(
    (size) => size > 0 && (Number.isFinite(size) || size === Infinity)
  )
  return (
    <nav
      aria-label="Table pagination"
      {...props}
      className={cn("evenform-data-table-pagination", className)}
    >
      <div className="evenform-data-table-page-size">
        <Label htmlFor={pageSizeId}>{pageSizeLabel}</Label>
        <Select value={String(pageSize)} onValueChange={(value) => { if (value !== null) table.setPageSize(Number(value)) }}>
          <SelectTrigger id={pageSizeId}><SelectValue>{pageSize === Infinity ? allRowsLabel : pageSize}</SelectValue></SelectTrigger>
          <SelectContent>{sizes.map(size => <SelectItem key={size} value={String(size)}>{size === Infinity ? allRowsLabel : size}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <span className="evenform-data-table-page-status" aria-live="polite">
        {formatPage(pageIndex + 1, table.getPageCount())}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={previousLabel}
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      >
        <ChevronLeftIcon aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={nextLabel}
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
      >
        <ChevronRightIcon aria-hidden="true" />
      </Button>
    </nav>
  )
}

export {
  useDataTable,
  dataTableFeatures,
  DataTable,
  DataTableColumnHeader,
  DataTableTreeCell,
  DataTableResizeHandle,
  DataTableCheckbox,
  DataTablePagination,
}
export type {
  DataTableFeatures,
  DataTableInstance,
  DataTableColumnDef,
  DataTableOptions,
  DataTableProps,
  DataTablePaginationProps,
}
