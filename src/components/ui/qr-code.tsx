import { QRCodeSVG } from "qrcode.react"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

type QRCodeProps = Omit<
  ComponentProps<typeof QRCodeSVG>,
  "title" | "aria-label" | "aria-labelledby"
> & { label: string }

/** Real SVG encoding. Keep a quiet zone and a readable dark-on-light surface. */
function QRCode({ label, className, marginSize = 4, ...props }: QRCodeProps) {
  return (
    <QRCodeSVG
      {...props}
      marginSize={marginSize}
      role="img"
      aria-label={label}
      title={label}
      className={cn("evenform-qr-code", className)}
    />
  )
}

export { QRCode, type QRCodeProps }
