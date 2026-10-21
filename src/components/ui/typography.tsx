import {
  createElement,
  type ComponentPropsWithRef,
  type ComponentProps,
  type ElementType,
  type ReactNode,
} from "react"
import { cn } from "cn"

type PolymorphicProps<Element extends ElementType, Props> = Props & {
  as?: Element
} & Omit<ComponentPropsWithRef<Element>, keyof Props | "as">
type TitleProps<
  Element extends "h1" | "h2" | "h3" | "h4" | "h5" | "h6" = "h2",
> = PolymorphicProps<Element, { size?: "page" | "section" | "label" }>

/** Heading semantics and visual size are independent choices. */
function Title<Element extends "h1" | "h2" | "h3" | "h4" | "h5" | "h6" = "h2">({
  as,
  size = "section",
  className,
  ...props
}: TitleProps<Element>) {
  return createElement(as ?? "h2", {
    ...props,
    "data-slot": "title",
    "data-size": size,
    className: cn("evenform-title", className),
  })
}

type TextProps<Element extends "p" | "span" | "div" | "label" = "p"> =
  PolymorphicProps<
    Element,
    {
      size?: "body" | "label" | "caption"
      tone?:
        "default" | "muted" | "success" | "info" | "warning" | "destructive"
      weight?: "normal" | "medium" | "semibold"
    }
  >
function Text<Element extends "p" | "span" | "div" | "label" = "p">({
  as,
  size = "body",
  tone = "default",
  weight = "normal",
  className,
  ...props
}: TextProps<Element>) {
  return createElement(as ?? "p", {
    ...props,
    "data-slot": "text",
    "data-size": size,
    "data-tone": tone,
    "data-weight": weight,
    className: cn("evenform-text", className),
  })
}

type ProseProps<Element extends "div" | "article" | "section" = "div"> =
  PolymorphicProps<Element, { measure?: "reading" | "full" }>
function Prose<Element extends "div" | "article" | "section" = "div">({
  as,
  measure = "reading",
  className,
  ...props
}: ProseProps<Element>) {
  return createElement(as ?? "div", {
    ...props,
    "data-slot": "prose",
    "data-measure": measure,
    className: cn("evenform-prose", className),
  })
}

function Blockquote({
  attribution,
  children,
  className,
  ...props
}: ComponentProps<"blockquote"> & { attribution?: ReactNode }) {
  return (
    <blockquote
      data-slot="blockquote"
      className={cn("evenform-blockquote", className)}
      {...props}
    >
      {children}
      {attribution && (
        <footer className="evenform-blockquote-attribution">{attribution}</footer>
      )}
    </blockquote>
  )
}

function InlineCode({ className, ...props }: ComponentProps<"code">) {
  return (
    <code
      data-slot="inline-code"
      className={cn("evenform-inline-code", className)}
      {...props}
    />
  )
}

export {
  Title,
  Text,
  Prose,
  Blockquote,
  InlineCode,
  type TitleProps,
  type TextProps,
  type ProseProps,
}
