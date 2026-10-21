import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field"
import { cn } from "cn"
function OTPFieldRoot({ className, ...props }: OTPFieldPrimitive.Root.Props) {
  return <OTPFieldPrimitive.Root data-slot="OTPFieldRoot" className={(state) => cn("evenform-otp-field", typeof className === "function" ? className(state) : className)} {...props} />
}
function OTPFieldInput({ className, ...props }: OTPFieldPrimitive.Input.Props) {
  return <OTPFieldPrimitive.Input data-slot="OTPFieldInput" className={(state) => cn("evenform-otp-input", typeof className === "function" ? className(state) : className)} {...props} />
}
function OTPFieldSeparator({ className, ...props }: OTPFieldPrimitive.Separator.Props) {
  return <OTPFieldPrimitive.Separator data-slot="OTPFieldSeparator" className={(state) => cn("evenform-otp-separator", typeof className === "function" ? className(state) : className)} {...props} />
}

/* Base UI owns paste, autofill, focus, normalization and form validation.
   Use composed parts to insert group separators or per-slot overrides. */
function OTPField({children, length, ...props}: OTPFieldPrimitive.Root.Props) {
 return <OTPFieldRoot length={length} {...props}>{children ?? Array.from({length}, (_, index) => <OTPFieldInput key={index} />)}</OTPFieldRoot>
}
export { OTPField, OTPFieldRoot, OTPFieldInput, OTPFieldSeparator }
