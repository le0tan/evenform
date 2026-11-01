import type { ComponentProps } from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return <nav aria-label="Pagination" className={cn("ds-pagination", className)} {...props} />
}
export function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("ds-pagination-content", className)} {...props} />
}
export function PaginationItem(props: ComponentProps<"li">) { return <li {...props} /> }
export function PaginationLink({ active = false, className, ...props }: ComponentProps<"a"> & { active?: boolean }) {
  return <a aria-current={active ? "page" : undefined} className={cn("ds-pagination-link", className)} {...props} />
}
export function PaginationEllipsis({ label = "More pages" }: { label?: string }) { return <li className="ds-pagination-ellipsis"><MoreHorizontal size={16} aria-hidden="true" /><span className="sr-only">{label}</span></li> }
export type PaginationControlsProps = Omit<ComponentProps<typeof Pagination>, "children" | "onChange"> & {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  disabled?: boolean
  previousLabel?: string
  nextLabel?: string
  moreLabel?: string
  pageLabel?: (page: number) => string
}
/** Controlled pagination for client state; link primitives support URL-based routing. */
export function PaginationControls({ page, pageCount, onPageChange, disabled = false, previousLabel = "Previous page", nextLabel = "Next page", moreLabel = "More pages", pageLabel = (n) => `Page ${n}`, ...props }: PaginationControlsProps) {
  const count = Number.isFinite(pageCount) ? Math.max(1, Math.trunc(pageCount)) : 1
  const current = Number.isFinite(page) ? Math.min(count, Math.max(1, Math.trunc(page))) : 1
  const pages = [...new Set([1, current - 1, current, current + 1, count])].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b)
  return <Pagination {...props}><PaginationContent>
    <li><Button variant="outline" size="icon" aria-label={previousLabel} disabled={disabled || current === 1} onClick={() => onPageChange(current - 1)}><ChevronLeft /></Button></li>
    {pages.flatMap((n, index) => [index > 0 && n - pages[index - 1] > 1 ? <PaginationEllipsis key={`gap-${n}`} label={moreLabel} /> : null,
      <li key={n}><Button variant={n === current ? "outline" : "ghost"} className={n === current ? "border-primary text-primary font-semibold hover:bg-background hover:text-primary" : undefined} size="icon" aria-label={pageLabel(n)} aria-current={n === current ? "page" : undefined} disabled={disabled} onClick={() => onPageChange(n)}>{n}</Button></li>])}
    <li><Button variant="outline" size="icon" aria-label={nextLabel} disabled={disabled || current === count} onClick={() => onPageChange(current + 1)}><ChevronRight /></Button></li>
  </PaginationContent></Pagination>
}
