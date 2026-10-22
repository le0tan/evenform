// Adapted from shadcn/ui (MIT), Copyright (c) 2023 shadcn.
// See THIRD_PARTY_NOTICES.md and licenses/shadcn-ui.txt for the full license.
"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={(state) => cn(
        "group/tabs flex data-horizontal:flex-col",
        typeof className === "function" ? className(state) : className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg text-muted-foreground data-vertical:h-fit data-vertical:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  motion = "none",
  size = "default",
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants> & {
  /** An interruptible indicator; Base UI still owns selection and geometry. */
  motion?: "none" | "slide"
  /** Control fits the outer horizontal list to the shared control height.
   * Touch targets and tall content may expand it. Default keeps navigation spacing. */
  size?: "default" | "control"
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-motion={motion}
      data-size={size}
      className={(state) => cn(tabsListVariants({ variant }), typeof className === "function" ? className(state) : className)}
      {...props}
    >
      {children}
      {motion === "slide" && <TabsPrimitive.Indicator data-slot="tabs-indicator" />}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={(state) => cn(
        "relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border font-medium whitespace-nowrap text-foreground/60 transition-colors data-vertical:w-full data-vertical:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-active:text-primary dark:data-active:text-primary",
        typeof className === "function" ? className(state) : className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={(state) => cn("flex-1 text-sm outline-none", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
