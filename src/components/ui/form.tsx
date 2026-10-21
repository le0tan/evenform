import { Form as FormPrimitive } from "@base-ui/react/form"
import { Field as FieldPrimitive } from "@base-ui/react/field"
import { cn } from "@/lib/utils"

function Form<
  Values extends Record<string, unknown> = Record<string, unknown>,
>({ className, ...props }: FormPrimitive.Props<Values>) {
  return (
    <FormPrimitive<Values>
      data-slot="form"
      {...props}
      className={(state) =>
        cn(
          "evenform-form",
          typeof className === "function" ? className(state) : className
        )
      }
    />
  )
}

function FormField({ className, ...props }: FieldPrimitive.Root.Props) {
  return (
    <FieldPrimitive.Root
      data-slot="form-field"
      {...props}
      className={(state) =>
        cn(
          "evenform-form-field",
          typeof className === "function" ? className(state) : className
        )
      }
    />
  )
}

function FormFieldLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      data-slot="form-field-label"
      {...props}
      className={(state) =>
        cn(
          "evenform-form-field-label",
          typeof className === "function" ? className(state) : className
        )
      }
    />
  )
}

function FormFieldDescription({
  className,
  ...props
}: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      data-slot="form-field-description"
      {...props}
      className={(state) =>
        cn(
          "evenform-form-field-description",
          typeof className === "function" ? className(state) : className
        )
      }
    />
  )
}

function FormFieldError({ className, ...props }: FieldPrimitive.Error.Props) {
  return (
    <FieldPrimitive.Error
      data-slot="form-field-error"
      {...props}
      className={(state) =>
        cn(
          "evenform-form-field-error",
          typeof className === "function" ? className(state) : className
        )
      }
    />
  )
}

// Native constraints, custom validation, render composition and refs are Base UI's.
const FormFieldControl = FieldPrimitive.Control
const FormFieldValidity = FieldPrimitive.Validity
const FormFieldItem = FieldPrimitive.Item

export {
  Form,
  FormField,
  FormFieldLabel,
  FormFieldDescription,
  FormFieldError,
  FormFieldControl,
  FormFieldValidity,
  FormFieldItem,
}
