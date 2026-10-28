import { useId, type ComponentProps, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Comments({ className, ...props }: ComponentProps<"ol">) {
  return (
    <ol
      role="list"
      data-slot="comments"
      className={cn("evenform-comments", className)}
      {...props}
    />
  )
}
export interface CommentProps extends Omit<ComponentProps<"li">, "content"> {
  author: ReactNode
  avatar?: ReactNode
  time?: ReactNode
  actions?: ReactNode
  replies?: ReactNode
  edited?: boolean
  editedLabel?: string
}
/** Content, reply and edit forms belong to the caller; this component supplies structure. */
export function Comment({
  author,
  avatar,
  time,
  actions,
  replies,
  edited,
  editedLabel = "Edited",
  children,
  className,
  ...props
}: CommentProps) {
  const authorId = useId()
  return (
    <li
      data-slot="comment"
      className={cn("evenform-comment", className)}
      {...props}
    >
      <article aria-labelledby={authorId}>
        {avatar && <div data-slot="product-avatar">{avatar}</div>}
        <div data-slot="comment-body">
          <header data-slot="product-meta">
            <span id={authorId} data-slot="product-author">
              {author}
            </span>
            {time && <span data-slot="product-time">{time}</span>}
            {edited && <span data-slot="product-time">{editedLabel}</span>}
          </header>
          <div data-slot="product-content">{children}</div>
          {actions && <div data-slot="product-actions">{actions}</div>}
          {replies && <div data-slot="comment-replies">{replies}</div>}
        </div>
      </article>
    </li>
  )
}
