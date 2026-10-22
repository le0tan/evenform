import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { useEffect, type CSSProperties } from "react"
import { XIcon } from "lucide-react"
import { cn } from "cn"
const ToastProvider = ToastPrimitive.Provider
const ToastPortal = ToastPrimitive.Portal
const useToastManager = ToastPrimitive.useToastManager
const createToastManager = ToastPrimitive.createToastManager
function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return <ToastPrimitive.Root data-slot="Toast" className={(state) => cn("evenform-toast", typeof className === "function" ? className(state) : className)} {...props} />
}
function ToastViewport({ className, style, ...props }: ToastPrimitive.Viewport.Props) {
  const { toasts } = useToastManager()
  const visible = toasts.filter(toast => !toast.limited)
  const height = visible.reduce((sum, toast) => sum + (toast.height ?? 0), 0)
  return <ToastPrimitive.Viewport data-slot="ToastViewport" className={(state) => cn("evenform-toast-viewport", typeof className === "function" ? className(state) : className)} style={(state) => ({
    "--_toast-stack-height": `calc(${height}px + ${Math.max(0, visible.length - 1)} * var(--ds-space-2))`,
    ...(typeof style === "function" ? style(state) : style),
  } as CSSProperties)} {...props} />
}
function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return <ToastPrimitive.Content data-slot="ToastContent" className={(state) => cn("evenform-toast-content", typeof className === "function" ? className(state) : className)} {...props} />
}
function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return <ToastPrimitive.Title data-slot="ToastTitle" className={(state) => cn("evenform-toast-title", typeof className === "function" ? className(state) : className)} {...props} />
}
function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return <ToastPrimitive.Description data-slot="ToastDescription" className={(state) => cn("evenform-toast-description", typeof className === "function" ? className(state) : className)} {...props} />
}
function ToastAction({ className, ...props }: ToastPrimitive.Action.Props) {
  return <ToastPrimitive.Action data-slot="ToastAction" className={(state) => cn("evenform-toast-action", typeof className === "function" ? className(state) : className)} {...props} />
}

function ToastClose({className, children, "aria-label": ariaLabel = "Dismiss notification", ...props}: ToastPrimitive.Close.Props) {
 return <ToastPrimitive.Close aria-label={ariaLabel} data-slot="toast-close" className={(state) => cn("evenform-toast-close", typeof className === "function" ? className(state) : className)} {...props}>{children ?? <XIcon size={16} aria-hidden="true" />}</ToastPrimitive.Close>
}
/* Render one Toaster inside one Provider. Provider's native limit (default 3),
   timers, pointer/focus pause, live announcements and swipe dismissal stay intact.
   The composed renderer closes overflow instead of retaining an unbounded hidden
   backlog; set dismissOverflow=false to opt into Base UI's queued behavior.
   Compose the parts instead for application-specific toast presentation. */
type ToasterProps = ToastPrimitive.Viewport.Props & { dismissOverflow?: boolean; closeLabel?: string }
function Toaster({dismissOverflow = true, closeLabel = "Dismiss notification", ...props}: ToasterProps) {
 const {toasts, close} = useToastManager()
 useEffect(() => {
  if (dismissOverflow) toasts.filter(toast => toast.limited && toast.transitionStatus !== "ending").forEach(toast => close(toast.id))
 }, [toasts, close, dismissOverflow])
 return <ToastPortal><ToastViewport {...props}>{toasts.map(toast => <Toast key={toast.id} toast={toast}><ToastContent><div className="evenform-toast-copy">{toast.title != null && <ToastTitle>{toast.title}</ToastTitle>}{toast.description != null && <ToastDescription>{toast.description}</ToastDescription>}{toast.actionProps && <ToastAction {...toast.actionProps} />}</div><ToastClose aria-label={closeLabel} /></ToastContent></Toast>)}</ToastViewport></ToastPortal>
}
export { ToastProvider, ToastPortal, Toast, ToastViewport, ToastContent, ToastTitle, ToastDescription, ToastAction, ToastClose, Toaster, useToastManager, createToastManager }
export type { ToastObject, ToastManagerAddOptions, ToastManagerUpdateOptions, ToastManagerPromiseOptions } from "@base-ui/react/toast"

export type { ToasterProps }
