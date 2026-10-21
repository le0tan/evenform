import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "cn"

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverClose = PopoverPrimitive.Close

type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "side" | "sideOffset" | "align" | "alignOffset" | "anchor"
  >

function PopoverContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  anchor,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={(state) =>
            cn(
              "evenform-floating-panel evenform-popover",
              typeof className === "function" ? className(state) : className
            )
          }
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={(state) =>
        cn(
          "text-sm font-medium",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={(state) =>
        cn(
          "text-label text-muted-foreground",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
}
export type { PopoverContentProps }
