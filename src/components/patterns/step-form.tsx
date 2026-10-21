import {
  useEffect,
  useId,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"
import { Step, Steps } from "@/components/patterns/steps"
import { Button } from "@/components/ui/button"

export interface StepFormStep {
  id: string
  title: string
  description?: ReactNode
  status?: "upcoming" | "current" | "complete" | "error"
}
export interface StepFormProps extends Omit<
  ComponentProps<"section">,
  "children"
> {
  steps: StepFormStep[]
  /** Zero-based index. State and navigation validation belong to the caller. */
  currentStep: number
  onStepChange: (nextStep: number, direction: "next" | "previous") => void
  onComplete?: () => void
  children: ReactNode | ((step: StepFormStep, index: number) => ReactNode)
  busy?: boolean
  disabled?: boolean
  previousDisabled?: boolean
  nextDisabled?: boolean
  previousLabel?: string
  nextLabel?: string
  completeLabel?: string
  busyLabel?: string
  status?: ReactNode
  actions?: ReactNode
  focusOnStepChange?: boolean
}
/** A controlled workflow frame. Navigation requests never auto-submit a form,
 * run validation, or advance state; the application approves every transition. */
export function StepForm({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  children,
  busy,
  disabled,
  previousDisabled,
  nextDisabled,
  previousLabel = "Back",
  nextLabel = "Continue",
  completeLabel = "Complete",
  busyLabel = "Working…",
  status,
  actions,
  focusOnStepChange = true,
  className,
  ...props
}: StepFormProps) {
  const id = useId()
  const heading = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(currentStep)
  useEffect(() => {
    if (previousStep.current !== currentStep && focusOnStepChange)
      heading.current?.focus()
    previousStep.current = currentStep
  }, [currentStep, focusOnStepChange])
  const step = steps[currentStep]
  if (!step)
    return (
      <section data-slot="step-form" className={className} {...props}>
        <p role="alert">This step is unavailable.</p>
      </section>
    )
  const last = currentStep === steps.length - 1
  return (
    <section
      data-slot="step-form"
      aria-labelledby={`${id}-title`}
      aria-busy={busy || undefined}
      aria-disabled={disabled || undefined}
      className={cn("evenform-step-form", className)}
      {...props}
    >
      <Steps aria-label="Form progress">
        {steps.map((item, index) => (
          <Step
            key={item.id}
            title={item.title}
            status={
              item.status ??
              (index === currentStep
                ? "current"
                : index < currentStep
                  ? "complete"
                  : "upcoming")
            }
            aria-current={index === currentStep ? "step" : undefined}
          />
        ))}
      </Steps>
      <div data-slot="step-form-content">
        <header>
          <h2 id={`${id}-title`} ref={heading} tabIndex={-1}>
            {step.title}
          </h2>
          <p data-slot="step-form-count">
            Step {currentStep + 1} of {steps.length}
          </p>
          {step.description && (
            <div data-slot="step-form-description">{step.description}</div>
          )}
        </header>
        <fieldset
          data-slot="step-form-fields"
          disabled={disabled || busy}
          aria-labelledby={`${id}-title`}
        >
          {typeof children === "function"
            ? children(step, currentStep)
            : children}
        </fieldset>
      </div>
      <footer data-slot="step-form-navigation">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || busy || previousDisabled || currentStep === 0}
          onClick={() => onStepChange(currentStep - 1, "previous")}
        >
          {previousLabel}
        </Button>
        {last ? (
          onComplete && (
            <Button
              type="button"
              disabled={disabled || busy || nextDisabled}
              onClick={onComplete}
            >
              {busy ? busyLabel : completeLabel}
            </Button>
          )
        ) : (
          <Button
            type="button"
            disabled={disabled || busy || nextDisabled}
            onClick={() => onStepChange(currentStep + 1, "next")}
          >
            {busy ? busyLabel : nextLabel}
          </Button>
        )}
        {actions}
        {status && <div data-slot="step-form-status">{status}</div>}
      </footer>
    </section>
  )
}
