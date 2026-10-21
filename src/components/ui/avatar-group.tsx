import type { ComponentProps } from "react"
import {
  AvatarGroup as AvatarGroupPrimitive,
  AvatarGroupCount,
} from "@/components/ui/avatar"

/** Composes the existing Avatar sizes and fallback behavior. */
function AvatarGroup({
  children,
  overflow = 0,
  overflowLabel,
  ...props
}: ComponentProps<typeof AvatarGroupPrimitive> & {
  overflow?: number
  overflowLabel?: string
}) {
  return (
    <AvatarGroupPrimitive role="group" {...props}>
      {children}
      {overflow > 0 && (
        <AvatarGroupCount
          role="img"
          aria-label={overflowLabel ?? `${overflow} more people`}
        >
          <span aria-hidden="true">+{overflow}</span>
        </AvatarGroupCount>
      )}
    </AvatarGroupPrimitive>
  )
}

export { AvatarGroup }
