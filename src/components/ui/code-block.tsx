import { useId, type ComponentProps, type ReactNode } from "react"
import { cn } from "cn"
import { CopyButton } from "@/components/ui/copy-button"

type CodeBlockProps = Omit<ComponentProps<"figure">, "children"> & {
  code: string
  language?: string
  filename?: string
  caption?: ReactNode
  copyable?: boolean
  copyLabel?: string
  codeProps?: ComponentProps<"code">
}

function CodeBlock({
  code,
  language,
  filename,
  caption,
  copyable = true,
  copyLabel = "Copy code",
  codeProps,
  className,
  ...props
}: CodeBlockProps) {
  const id = useId()
  const hasCaption = !!(filename || language || caption)
  return (
    <figure
      data-slot="code-block"
      className={cn("evenform-code-block", className)}
      {...props}
    >
      {(hasCaption || copyable) && (
        <figcaption className="evenform-code-block-header">
          {hasCaption && (
            <span id={id}>
              {caption ?? filename ?? language}
              {filename && language && (
                <span className="evenform-code-language">{language}</span>
              )}
            </span>
          )}
          {copyable && (
            <CopyButton
              value={code}
              label={copyLabel}
              size="sm"
              variant="ghost"
            />
          )}
        </figcaption>
      )}
      <pre
        tabIndex={0}
        aria-labelledby={hasCaption ? id : undefined}
        aria-label={!hasCaption ? "Code sample" : undefined}
      >
        <code
          {...codeProps}
          className={cn(
            language && `language-${language}`,
            codeProps?.className
          )}
        >
          {code}
        </code>
      </pre>
    </figure>
  )
}

export { CodeBlock, type CodeBlockProps }
