import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0]
type CarouselPlugins = Parameters<typeof useEmblaCarousel>[1]
type CarouselProps = React.ComponentProps<"div"> & {
  opts?: CarouselOptions
  plugins?: CarouselPlugins
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}
type CarouselContextValue = {
  viewportRef: UseEmblaCarouselType[0]
  api: CarouselApi
  orientation: "horizontal" | "vertical"
  previous: () => void
  next: () => void
  canPrevious: boolean
  canNext: boolean
  selectedIndex: number
  slideCount: number
  direction: "ltr" | "rtl"
}
const CarouselContext = React.createContext<CarouselContextValue | null>(null)
function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error("Carousel parts must be inside Carousel")
  return context
}

/** Embla supplies drag, touch, focus tracking and snap positions. No autoplay is installed. */
function Carousel({
  orientation = "horizontal",
  opts,
  plugins,
  setApi,
  className,
  children,
  onKeyDown,
  ...props
}: CarouselProps) {
  const [viewportRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
    plugins
  )
  const [canPrevious, setCanPrevious] = React.useState(false)
  const [canNext, setCanNext] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [slideCount, setSlideCount] = React.useState(0)
  const previous = React.useCallback(() => api?.scrollPrev(), [api])
  const next = React.useCallback(() => api?.scrollNext(), [api])
  React.useEffect(() => {
    if (!api) return
    const sync = () => {
      setCanPrevious(api.canScrollPrev())
      setCanNext(api.canScrollNext())
      setSelectedIndex(api.selectedScrollSnap())
      setSlideCount(api.scrollSnapList().length)
    }
    sync()
    api.on("select", sync).on("reInit", sync)
    setApi?.(api)
    return () => {
      api.off("select", sync).off("reInit", sync)
      setApi?.(undefined)
    }
  }, [api, setApi])
  return (
    <CarouselContext.Provider
      value={{
        viewportRef,
        api,
        orientation,
        previous,
        next,
        canPrevious,
        canNext,
        selectedIndex,
        slideCount,
        direction: opts?.direction ?? "ltr",
      }}
    >
      <div
        data-slot="carousel"
        data-orientation={orientation}
        dir={opts?.direction}
        role="region"
        aria-roledescription="carousel"
        className={cn("evenform-carousel", className)}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.target !==
              event.currentTarget.querySelector(
                '[data-slot="carousel-viewport"]'
              )
          )
            return
          const backward =
            orientation === "horizontal"
              ? opts?.direction === "rtl"
                ? "ArrowRight"
                : "ArrowLeft"
              : "ArrowUp"
          const forward =
            orientation === "horizontal"
              ? opts?.direction === "rtl"
                ? "ArrowLeft"
                : "ArrowRight"
              : "ArrowDown"
          if (event.key === backward) {
            event.preventDefault()
            previous()
          }
          if (event.key === forward) {
            event.preventDefault()
            next()
          }
        }}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({
  className,
  viewportProps,
  ...props
}: React.ComponentProps<"div"> & {
  viewportProps?: Omit<React.ComponentProps<"div">, "ref" | "children">
}) {
  const { viewportRef } = useCarousel()
  return (
    <div
      {...viewportProps}
      ref={viewportRef}
      data-slot="carousel-viewport"
      tabIndex={viewportProps?.tabIndex ?? 0}
      className={cn("evenform-carousel-viewport", viewportProps?.className)}
    >
      <div
        data-slot="carousel-content"
        className={cn("evenform-carousel-content", className)}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      className={cn("evenform-carousel-item", className)}
      {...props}
    />
  )
}

function CarouselPrevious({
  children,
  onClick,
  disabled,
  variant = "outline",
  size = "icon",
  "aria-label": label = "Previous slide",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, previous, canPrevious, direction } = useCarousel()
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      data-slot="carousel-previous"
      aria-label={label}
      disabled={disabled || !canPrevious}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) previous()
      }}
    >
      {children ??
        (orientation === "horizontal" ? (
          direction === "rtl" ? (
            <ArrowRightIcon aria-hidden="true" />
          ) : (
            <ArrowLeftIcon aria-hidden="true" />
          )
        ) : (
          <ArrowUpIcon aria-hidden="true" />
        ))}
    </Button>
  )
}

function CarouselNext({
  children,
  onClick,
  disabled,
  variant = "outline",
  size = "icon",
  "aria-label": label = "Next slide",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, next, canNext, direction } = useCarousel()
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      data-slot="carousel-next"
      aria-label={label}
      disabled={disabled || !canNext}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) next()
      }}
    >
      {children ??
        (orientation === "horizontal" ? (
          direction === "rtl" ? (
            <ArrowLeftIcon aria-hidden="true" />
          ) : (
            <ArrowRightIcon aria-hidden="true" />
          )
        ) : (
          <ArrowDownIcon aria-hidden="true" />
        ))}
    </Button>
  )
}

/** Counts snap positions, including grouped or multi-item views. */
function CarouselPosition({
  formatPosition = (current, count) => `${current} of ${count}`,
  ...props
}: React.ComponentProps<"span"> & {
  formatPosition?: (current: number, count: number) => React.ReactNode
}) {
  const { selectedIndex, slideCount } = useCarousel()
  return (
    <span
      data-slot="carousel-position"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      {...props}
    >
      {slideCount ? formatPosition(selectedIndex + 1, slideCount) : ""}
    </span>
  )
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselPosition,
  type CarouselApi,
  type CarouselOptions,
  type CarouselProps,
}
