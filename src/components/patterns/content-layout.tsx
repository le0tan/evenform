import { type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Reading layout for use within a main landmark.
 * --ds-content-measure and --ds-content-aside-width are local layout parameters. */
export function ContentLayout({ navigation, aside, children, className, ...props }: ComponentProps<"div"> & {
  navigation?: ReactNode
  aside?: ReactNode
}) {
  return <div data-slot="content-layout" className={cn(className)} {...props}>
    <div data-slot="content-layout-columns" data-has-aside={Boolean(navigation || aside) || undefined}>
      <article data-slot="content-layout-body">{children}</article>
      {(navigation || aside) && <div data-slot="content-layout-support">{navigation}{aside}</div>}
    </div>
  </div>
}
