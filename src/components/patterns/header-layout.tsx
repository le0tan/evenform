import { useId, type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface HeaderShellProps extends Omit<
  ComponentProps<"div">,
  "children"
> {
  header: ReactNode
  children: ReactNode
  secondaryNavigation?: ReactNode
  secondaryNavigationLabel?: string
  footer?: ReactNode
  mainId?: string
  skipLabel?: string
  /** Use div when embedding in an existing main landmark.
   * The default main wraps page content. */
  contentAs?: "main" | "div"
  variant?: "page" | "workspace"
  headerClassName?: string
  footerClassName?: string
  contentClassName?: string
}
/** Header-based page shell with one main landmark. */
export function HeaderShell({
  header,
  children,
  secondaryNavigation,
  secondaryNavigationLabel = "Section navigation",
  footer,
  mainId,
  skipLabel = "Skip to content",
  contentAs: Content = "main",
  variant = "page",
  headerClassName,
  footerClassName,
  contentClassName,
  className,
  ...props
}: HeaderShellProps) {
  const id = useId()
  const contentId = mainId ?? `header-shell-${id}`
  return (
    <div
      data-slot="header-shell"
      data-variant={variant}
      className={cn("evenform-header-shell", className)}
      {...props}
    >
      <a className="skip-link" href={`#${contentId}`}>
        {skipLabel}
      </a>
      <header data-slot="header-shell-header">
        <div
          data-slot="header-shell-header-content"
          className={headerClassName}
        >
          {header}
        </div>
      </header>
      {secondaryNavigation && (
        <nav
          data-slot="header-shell-secondary-navigation"
          aria-label={secondaryNavigationLabel}
        >
          <div>{secondaryNavigation}</div>
        </nav>
      )}
      <Content
        id={contentId}
        tabIndex={-1}
        data-slot="header-shell-content"
        className={contentClassName}
      >
        {children}
      </Content>
      {footer && (
        <footer data-slot="header-shell-footer">
          <div className={footerClassName}>{footer}</div>
        </footer>
      )}
    </div>
  )
}
