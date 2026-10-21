// Adapted from shadcn/ui (MIT), Copyright (c) 2023 shadcn.
// See THIRD_PARTY_NOTICES.md and licenses/shadcn-ui.txt for the full license.
import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
