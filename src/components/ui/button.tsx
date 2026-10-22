// Adapted from shadcn/ui (MIT), Copyright (c) 2023 shadcn.
// See THIRD_PARTY_NOTICES.md and licenses/shadcn-ui.txt for the full license.
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-[length:var(--ds-text-control)] font-medium whitespace-nowrap outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--ds-control-icon-size)]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[var(--ds-primary-hover,color-mix(in_srgb,var(--primary)_80%,transparent))]",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "",
        xs: "text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "text-[length:var(--ds-text-control-small)] [&_svg:not([class*='size-'])]:size-[var(--ds-control-icon-size-small)]",
        lg: "",
        icon: "",
        "icon-xs": "[&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "",
        "icon-lg": "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-size={size}
      className={(state) => cn(buttonVariants({ variant, size }), typeof className === "function" ? className(state) : className)}
      {...props}
      data-ds-component="button"
      data-ds-size={size}
    />
  )
}

export { Button, buttonVariants }
