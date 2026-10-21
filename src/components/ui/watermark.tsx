import { useEffect, useId, useRef, useState, type ComponentProps } from "react"
import { cn } from "cn"

type WatermarkProps = ComponentProps<"div"> &
  ({ text: string | string[]; image?: never } | { image: string; text?: never })

/** A visual repeated mark only. Identity and permissions belong to the application. */
function Watermark({
  text,
  image,
  children,
  className,
  ...props
}: WatermarkProps) {
  const id = useId()
  const measure = useRef<HTMLSpanElement>(null)
  const [tile, setTile] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const element = measure.current
    if (!element || typeof window === "undefined") return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      setTile((current) =>
        current.width === rect.width && current.height === rect.height
          ? current
          : { width: rect.width, height: rect.height }
      )
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(schedule)
    observer?.observe(element)
    window.addEventListener("resize", schedule)
    schedule()
    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", schedule)
      window.cancelAnimationFrame(frame)
    }
  }, [])
  const lines = typeof text === "string" ? [text] : (text ?? [])
  return (
    <div
      data-slot="watermark"
      className={cn("evenform-watermark", className)}
      {...props}
    >
      <div className="evenform-watermark-content">{children}</div>
      <div className="evenform-watermark-layer" aria-hidden="true">
        <span ref={measure} className="evenform-watermark-measure" />
        {tile.width > 0 && tile.height > 0 && (
          <svg width="100%" height="100%" focusable="false">
            <defs>
              <pattern
                id={id}
                width={tile.width}
                height={tile.height}
                patternUnits="userSpaceOnUse"
              >
                <g className="evenform-watermark-mark">
                  {image ? (
                    <image
                      href={image}
                      x={tile.width / 4}
                      y={tile.height / 4}
                      width={tile.width / 2}
                      height={tile.height / 2}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  ) : (
                    <text
                      x={tile.width / 2}
                      y={tile.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {lines.map((line, index) => (
                        <tspan
                          x={tile.width / 2}
                          dy={
                            index === 0
                              ? `${-(lines.length - 1) * 0.65}em`
                              : "1.3em"
                          }
                          key={index}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>
                  )}
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${id})`} />
          </svg>
        )}
      </div>
    </div>
  )
}

export { Watermark, type WatermarkProps }
