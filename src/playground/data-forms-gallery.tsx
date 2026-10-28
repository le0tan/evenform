import { useId, useState } from "react"
import type {
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  ColumnVisibilityState,
  PaginationState,
  ExpandedState,
  ColumnPinningState,
  ColumnSizingState,
} from "@tanstack/react-table"
import { PageSection } from "@/components/patterns/layouts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckboxGroup } from "@/components/ui/checkbox-group"
import { Fieldset, FieldsetLegend } from "@/components/ui/fieldset"
import {
  Form,
  FormField,
  FormFieldLabel,
  FormFieldDescription,
  FormFieldError,
  FormFieldItem,
} from "@/components/ui/form"
import { SearchField } from "@/components/ui/search-field"
import { PasswordInput } from "@/components/ui/password-input"
import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteList,
  AutocompleteItem,
  AutocompleteEmpty,
} from "@/components/ui/autocomplete"
import {
  useDataTable,
  DataTable,
  DataTableColumnHeader,
  DataTableTreeCell,
  DataTableCheckbox,
  DataTablePagination,
  type DataTableColumnDef,
} from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

function DemoSelect({ label, accessibleLabel, value, onValueChange, options }: {
  label: string
  accessibleLabel: string
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  const id = useId()
  return <div className="evenform-data-forms-select">
    <Label htmlFor={id}>{label}</Label>
    <Select value={value} onValueChange={value => { if (value !== null) onValueChange(value) }}>
      <SelectTrigger id={id} aria-label={accessibleLabel}><SelectValue>{options.find(option => option.value === value)?.label}</SelectValue></SelectTrigger>
      <SelectContent>{options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
    </Select>
  </div>
}

type RecordItem = {
  id: string
  name: string
  owner: string
  status: string
  updated: string
}
const records: RecordItem[] = [
  {
    id: "project-01",
    name: "Component library",
    owner: "Ada Chen",
    status: "Active",
    updated: "2026-10-20",
  },
  {
    id: "project-02",
    name: "Workspace settings",
    owner: "Jules Park",
    status: "In review",
    updated: "2026-10-19",
  },
  {
    id: "project-03",
    name: "Account onboarding",
    owner: "Sam Lee",
    status: "Active",
    updated: "2026-10-17",
  },
  {
    id: "project-04",
    name: "Usage reports",
    owner: "Ada Chen",
    status: "Paused",
    updated: "2026-10-16",
  },
  {
    id: "project-05",
    name: "Notification center",
    owner: "Maya Tan",
    status: "In review",
    updated: "2026-10-15",
  },
  {
    id: "project-06",
    name: "Audit history",
    owner: "Jules Park",
    status: "Active",
    updated: "2026-10-14",
  },
  {
    id: "project-07",
    name: "Team permissions",
    owner: "Maya Tan",
    status: "Paused",
    updated: "2026-10-13",
  },
  {
    id: "project-08",
    name: "Search experience",
    owner: "Sam Lee",
    status: "Active",
    updated: "2026-10-12",
  },
]
const columns: DataTableColumnDef<RecordItem>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <DataTableCheckbox
        aria-label="Select all records on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={(event) =>
          table.toggleAllPageRowsSelected(event.target.checked)
        }
      />
    ),
    cell: ({ row }) => (
      <DataTableCheckbox
        aria-label={`Select ${row.original.name}`}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={(event) => row.toggleSelected(event.target.checked)}
      />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column}>Project</DataTableColumnHeader>
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    enableHiding: false,
  },
  {
    accessorKey: "owner",
    header: ({ column }) => (
      <DataTableColumnHeader column={column}>Owner</DataTableColumnHeader>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: "equalsString",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
  {
    accessorKey: "updated",
    header: ({ column }) => (
      <DataTableColumnHeader column={column}>Updated</DataTableColumnHeader>
    ),
  },
]
type WorkItem = {
  id: string
  name: string
  owner: string
  status: string
  due: string
  children?: WorkItem[]
}
const workItems: WorkItem[] = [
  {
    id: "foundation",
    name: "Design foundations",
    owner: "Ada Chen",
    status: "Active",
    due: "Oct 28",
    children: [
      {
        id: "color",
        name: "Color and contrast",
        owner: "Maya Tan",
        status: "In review",
        due: "Oct 23",
      },
      {
        id: "density",
        name: "Density presets",
        owner: "Jules Park",
        status: "Active",
        due: "Oct 26",
      },
    ],
  },
  {
    id: "workspace",
    name: "Workspace experience",
    owner: "Sam Lee",
    status: "Active",
    due: "Nov 04",
    children: [
      {
        id: "navigation",
        name: "Navigation and search",
        owner: "Sam Lee",
        status: "Active",
        due: "Oct 30",
      },
      {
        id: "permissions",
        name: "Roles and permissions",
        owner: "Jules Park",
        status: "Paused",
        due: "Nov 04",
      },
    ],
  },
]
const workColumns: DataTableColumnDef<WorkItem>[] = [
  {
    accessorKey: "name",
    header: "Work item",
    size: 280,
    minSize: 210,
    maxSize: 420,
    enableHiding: false,
    cell: ({ row }) => (
      <DataTableTreeCell
        row={row}
        expandLabel={`Expand ${row.original.name}`}
        collapseLabel={`Collapse ${row.original.name}`}
      >
        <span className="font-medium">{row.original.name}</span>
      </DataTableTreeCell>
    ),
  },
  {
    accessorKey: "owner",
    header: "Owner",
    size: 180,
    minSize: 120,
    maxSize: 300,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 160,
    minSize: 110,
    maxSize: 240,
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
  {
    accessorKey: "due",
    header: "Due date",
    size: 140,
    minSize: 100,
    maxSize: 220,
  },
]

function HierarchicalTableExample() {
  const [expanded, setExpanded] = useState<ExpandedState>({ foundation: true })
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    start: ["name"],
    end: [],
  })
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const table = useDataTable({
    data: workItems,
    columns: workColumns,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.children,
    state: { expanded, columnPinning, columnSizing },
    onExpandedChange: setExpanded,
    onColumnPinningChange: setColumnPinning,
    onColumnSizingChange: setColumnSizing,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    initialState: { pagination: { pageIndex: 0, pageSize: 20 } },
  })
  return (
    <PageSection id="example-tree-table"
      title="Tree rows and column sizing"
    >
      <div className="evenform-data-table-example">
        <div className="evenform-data-forms-toolbar">
          <Button
            variant="outline"
            onClick={() =>
              table.toggleAllRowsExpanded(!table.getIsAllRowsExpanded())
            }
          >
            {table.getIsAllRowsExpanded() ? "Collapse all" : "Expand all"}
          </Button>
          <DemoSelect label="Work item column" accessibleLabel="Pin work item column"
            value={table.getColumn("name")?.getIsPinned() || "none"}
            onValueChange={value => table.getColumn("name")?.pin(value === "none" ? false : value === "start" ? "start" : "end")}
            options={[{value:"start",label:"Pin to start"},{value:"end",label:"Pin to end"},{value:"none",label:"Unpinned"}]} />
          <Button
            variant="ghost"
            onClick={() => table.resetColumnSizing(true)}
            disabled={!Object.keys(columnSizing).length}
          >
            Reset widths
          </Button>
        </div>
        <DataTable table={table} resizableColumns aria-label="Work streams" />
        <p className="evenform-data-forms-caption">
          Drag a column divider to resize, or focus it and use arrow keys. Enter resets the width.
        </p>
      </div>
    </PageSection>
  )
}

const suggestions = [
  "Design systems",
  "Frontend development",
  "Product research",
  "Accessibility",
  "Data visualization",
]

export function DataFormsGallery() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const [tableState, setTableState] = useState("ready")
  const [saved, setSaved] = useState(false)
  const [interest, setInterest] = useState("")
  const table = useDataTable({
    data: records,
    columns,
    getRowId: (row) => row.id,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    enableRowSelection: true,
  })
  return (
    <div className="evenform-data-forms-gallery">
      <PageSection id="example-data-table"
        title="Data table"

      >
        <div className="evenform-data-table-example">
          <div className="evenform-data-forms-toolbar">
            <div role="group" aria-label="Search field example" id="example-search-field" className="showcase-example"><SearchField
              aria-label="Search projects"
              placeholder="Search projects and owners…"
              value={globalFilter}
              onValueChange={setGlobalFilter}
            /></div>
            <DemoSelect label="Status" accessibleLabel="Filter project status"
              value={String(table.getColumn("status")?.getFilterValue() || "all")}
              onValueChange={value => table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)}
              options={[{value:"all",label:"All statuses"},...["Active","In review","Paused"].map(value=>({value,label:value}))]} />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                Columns
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                  {table
                    .getAllLeafColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(checked) =>
                          column.toggleVisibility(checked)
                        }
                      >
                        {column.id[0].toUpperCase() + column.id.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="evenform-data-forms-toolbar evenform-data-forms-summary">
            <span className="evenform-data-forms-caption" role="status">
              {Object.keys(rowSelection).length} selected ·{" "}
              {table.getFilteredRowModel().rows.length} matching projects
            </span>
            {Object.keys(rowSelection).length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => table.resetRowSelection()}
              >
                Clear selection
              </Button>
            )}
            <DemoSelect label="Preview state" accessibleLabel="Preview table state" value={tableState} onValueChange={setTableState}
              options={[{value:"ready",label:"Ready"},{value:"loading",label:"Refreshing"},{value:"error",label:"Error"}]} />
          </div>
          <DataTable
            table={table}
            aria-label="Projects"
            loading={tableState === "loading"}
            error={
              tableState === "error" ? (
                <span>
                  Projects could not be loaded.{" "}
                  <Button variant="link" onClick={() => setTableState("ready")}>
                    Try again
                  </Button>
                </span>
              ) : undefined
            }
            emptyContent={
              <span>
                No projects match your filters.{" "}
                <Button
                  variant="link"
                  onClick={() => {
                    setGlobalFilter("")
                    setColumnFilters([])
                  }}
                >
                  Clear filters
                </Button>
              </span>
            }
          />
          <DataTablePagination table={table} pageSizes={[5, 10, 20]} />
        </div>
      </PageSection>
      <HierarchicalTableExample />
      <div className="evenform-data-forms-columns">
        <PageSection id="example-form"
          title="Grouped validation"
          description="Submit an empty form to see linked field errors."
        >
          <Form
            onFormSubmit={() => setSaved(true)}
            onChange={() => setSaved(false)}
          >
            <Fieldset>
              <FieldsetLegend>Workspace access</FieldsetLegend>
              <FormField name="email">
                <FormFieldLabel>Work email</FormFieldLabel>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                <FormFieldDescription>
                  Used for account and security notifications.
                </FormFieldDescription>
                <FormFieldError />
              </FormField>
              <div role="group" aria-label="Password input example" id="example-password-input" className="showcase-example"><FormField name="password">
                <FormFieldLabel>Password</FormFieldLabel>
                <PasswordInput
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <FormFieldDescription>
                  Use at least 8 characters.
                </FormFieldDescription>
                <FormFieldError />
              </FormField></div>
              <div role="group" aria-label="Checkbox group example" id="example-checkbox-group" className="showcase-example"><FormField
                name="channels"
                validate={(value) =>
                  Array.isArray(value) && value.length
                    ? null
                    : "Choose at least one notification channel."
                }
              >
                <FormFieldLabel
                  id="notification-channels-label"
                  nativeLabel={false}
                  render={<div />}
                >
                  Notification channels
                </FormFieldLabel>
                <CheckboxGroup
                  aria-labelledby="notification-channels-label"
                  defaultValue={[]}
                >
                  <FormFieldItem>
                    <FormFieldLabel className="evenform-data-forms-choice">
                      <Checkbox value="email" />
                      Email updates
                    </FormFieldLabel>
                  </FormFieldItem>
                  <FormFieldItem>
                    <FormFieldLabel className="evenform-data-forms-choice">
                      <Checkbox value="desktop" />
                      Desktop notifications
                    </FormFieldLabel>
                  </FormFieldItem>
                  <FormFieldItem disabled>
                    <FormFieldLabel className="evenform-data-forms-choice">
                      <Checkbox value="sms" />
                      SMS — unavailable
                    </FormFieldLabel>
                  </FormFieldItem>
                </CheckboxGroup>
                <FormFieldError />
              </FormField></div>
            </Fieldset>
            <div>
              <Button type="submit">Save preferences</Button>
            </div>
            {saved && (
              <p className="evenform-data-forms-caption" role="status">
                Preferences saved locally.
              </p>
            )}
          </Form>
        </PageSection>
        <PageSection id="example-autocomplete"
          title="Free text suggestions"

        >
          <div className="evenform-form">
            <div className="evenform-form-field">
              <Label htmlFor="interest-input">Area of interest</Label>
              <Autocomplete
                items={suggestions}
                value={interest}
                onValueChange={setInterest}
              >
                <AutocompleteInputGroup>
                  <AutocompleteInput
                    id="interest-input"
                    placeholder="Search or enter your own…"
                  />
                  <AutocompleteClear />
                </AutocompleteInputGroup>
                <AutocompleteContent>
                  <AutocompleteEmpty>
                    No suggestions. Your text is still accepted.
                  </AutocompleteEmpty>
                  <AutocompleteList>
                    {(item: string) => (
                      <AutocompleteItem key={item} value={item}>
                        {item}
                      </AutocompleteItem>
                    )}
                  </AutocompleteList>
                </AutocompleteContent>
              </Autocomplete>
              <p className="evenform-data-forms-caption">
                Entered value: {interest || "None yet"}
              </p>
            </div>
            <Fieldset disabled>
              <FieldsetLegend>Managed settings</FieldsetLegend>
              <FormField>
                <FormFieldLabel>Recovery password</FormFieldLabel>
                <PasswordInput
                  defaultValue="managed-credential"
                  autoComplete="off"
                  disabled
                />
                <FormFieldDescription>
                  Managed by your workspace administrator.
                </FormFieldDescription>
              </FormField>
            </Fieldset>
          </div>
        </PageSection>
      </div>
    </div>
  )
}
