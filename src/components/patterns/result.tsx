import { CircleCheck, CircleHelp, LockKeyhole, TriangleAlert } from "lucide-react"
import { type ComponentProps, type ReactNode } from "react"
import { EmptyState } from "@/components/patterns/empty-state"

const resultIcons = { success: CircleCheck, error: TriangleAlert, forbidden: LockKeyhole, "not-found": CircleHelp }

/** The caller supplies result copy and recovery actions. */
export function Result({ status = "success", icon, ...props }: ComponentProps<typeof EmptyState> & {
  status?: keyof typeof resultIcons
  icon?: ReactNode
}) {
  const Icon = resultIcons[status]
  return <div data-slot="result" data-status={status}><EmptyState icon={icon ?? <Icon />} {...props} /></div>
}
