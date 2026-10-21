import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset"
import { cn } from "@/lib/utils"

function Fieldset({ className, ...props }: FieldsetPrimitive.Root.Props) {
  return (
    <FieldsetPrimitive.Root
      data-slot="fieldset"
      {...props}
      className={(state) =>
        cn(
          "evenform-fieldset",
          typeof className === "function" ? className(state) : className
        )
      }
    />
  )
}

function FieldsetLegend({
  className,
  ...props
}: FieldsetPrimitive.Legend.Props) {
  return (
    <FieldsetPrimitive.Legend
      data-slot="fieldset-legend"
      {...props}
      className={(state) =>
        cn(
          "evenform-fieldset-legend",
          typeof className === "function" ? className(state) : className
        )
      }
    />
  )
}

export { Fieldset, FieldsetLegend }
