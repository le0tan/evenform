import { useEffect, useState } from "react"
import { BellIcon, ExternalLinkIcon } from "lucide-react"
import { PageSection } from "@/components/patterns/layouts"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AvatarGroup } from "@/components/ui/avatar-group"
import { Badge } from "@/components/ui/badge"
import { BadgeGroup } from "@/components/ui/badge-group"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselPosition,
} from "@/components/ui/carousel"
import { CodeBlock } from "@/components/ui/code-block"
import { CopyButton } from "@/components/ui/copy-button"
import { Image } from "@/components/ui/image"
import { ImagePreview } from "@/components/ui/image-preview"
import { Indicator } from "@/components/ui/indicator"
import { Input } from "@/components/ui/input"
import { QRCode } from "@/components/ui/qr-code"
import { Rating } from "@/components/ui/rating"
import { Video } from "@/components/ui/video"

// Exact vector diagrams encoded locally; these are media samples, not decorative illustrations.
function diagram(title: string, stages: string[]) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="white"/><g font-family="sans-serif" fill="#18181b"><text x="48" y="75" font-size="28" font-weight="600">${title}</text><text x="48" y="110" font-size="16" fill="#52525b">Illustrative workspace process</text>${stages.map((stage, index) => `<rect x="${48 + index * 248}" y="185" width="208" height="100" rx="8" fill="#f4f4f5" stroke="#71717a"/><text x="${152 + index * 248}" y="241" font-size="20" text-anchor="middle">${stage}</text>${index < stages.length - 1 ? `<path d="M ${266 + index * 248} 235 h 20 m -7 -7 7 7 -7 7" fill="none" stroke="#71717a" stroke-width="2"/>` : ""}`).join("")}<text x="48" y="385" font-size="16" fill="#52525b">Evenform component library / Process reference</text></g></svg>`)}`
}
const media = [
  {
    src: diagram("Design review", ["Draft", "Review", "Publish"]),
    alt: "Design review process: Draft, Review, Publish",
    caption: "Review sequence · three stages",
  },
  {
    src: diagram("Asset handover", ["Collect", "Validate", "Deliver"]),
    alt: "Asset handover process: Collect, Validate, Deliver",
    caption: "Asset handover · three stages",
  },
  {
    src: diagram("Feedback cycle", ["Observe", "Improve", "Verify"]),
    alt: "Feedback process: Observe, Improve, Verify",
    caption: "Feedback cycle · three stages",
  },
]
const code = `import { ImagePreview } from "@/components/ui/image-preview"\nimport { Button } from "@/components/ui/button"\n\n<ImagePreview\n  title="Design review"\n  images={[{ src: "/review.svg", alt: "Review sequence" }]}\n  trigger={<Button variant="outline">Inspect image</Button>}\n/>`

function LocalVideoExample() {
  const [source, setSource] = useState<{ url: string; name: string }>()
  const [captions, setCaptions] = useState<{ url: string; name: string }>()
  const [failed, setFailed] = useState(false)
  useEffect(
    () => () => {
      if (source) URL.revokeObjectURL(source.url)
    },
    [source]
  )
  useEffect(
    () => () => {
      if (captions) URL.revokeObjectURL(captions.url)
    },
    [captions]
  )
  return (
    <div className="evenform-media-stack">
      <p className="text-muted-foreground">
        Choose a local video to inspect native playback. Add a WebVTT track to
        test captions. Files stay in this browser.
      </p>
      <div className="evenform-media-grid">
        <label className="evenform-media-stack">
          Video file
          <Input
            aria-label="Choose local video"
            type="file"
            accept="video/*"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                setSource({ url: URL.createObjectURL(file), name: file.name })
                setFailed(false)
              }
            }}
          />
        </label>
        <label className="evenform-media-stack">
          English captions (optional)
          <Input
            aria-label="Choose WebVTT captions"
            type="file"
            accept=".vtt,text/vtt"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file)
                setCaptions({ url: URL.createObjectURL(file), name: file.name })
            }}
          />
        </label>
      </div>
      {source ? (
        <>
          <Video
            key={source.url}
            src={source.url}
            aria-label={source.name}
            onError={() => setFailed(true)}
          >
            {captions && (
              <track
                key={captions.url}
                kind="captions"
                src={captions.url}
                srcLang="en"
                label={captions.name}
                default
              />
            )}
          </Video>
          {failed && (
            <p role="alert" className="text-destructive">
              This browser could not play this video. Choose a supported video
              file.
            </p>
          )}
        </>
      ) : (
        <div className="evenform-media-empty">No video selected.</div>
      )}
    </div>
  )
}

function MediaAidsGallery() {
  const [score, setScore] = useState(4)
  const [qrValue, setQrValue] = useState("https://example.com/review/evenform")
  const [unread, setUnread] = useState(3)
  return (
    <div className="evenform-media-gallery">
      <PageSection id="example-image"
        title="Media review"
        description="Inspect diagrams at full size, move between assets, and review loading or failure states."
      >
        <div className="evenform-media-grid">
          <div className="evenform-media-stack">
            <AspectRatio ratio={16 / 9}>
              <Image src={media[0].src} alt={media[0].alt} />
            </AspectRatio>
            <div className="flex flex-wrap gap-toolbar">
              <ImagePreview
                images={media}
                title="Process diagrams"
                trigger={<Button variant="outline">Inspect diagrams</Button>}
              />
              <span className="text-caption text-muted-foreground">
                Local SVG · 800 × 450
              </span>
            </div>
          </div>
          <div className="evenform-media-stack">
            <AspectRatio ratio={16 / 9}>
              <Image
                src="data:image/png;base64,invalid"
                alt="Unavailable process reference"
                fallback={
                  <span>Reference unavailable. Choose a different asset.</span>
                }
              />
            </AspectRatio>
            <p className="text-muted-foreground">
              A failed image keeps its reserved space and accessible
              description.
            </p>
          </div>
        </div>
      </PageSection>
      <PageSection id="example-carousel"
        title="Browse a sequence"
        description="Drag or swipe, use the navigation buttons, or focus the viewport and use arrow keys. Motion starts only after an action."
      >
        <Carousel
          aria-label="Process reference diagrams"
          opts={{ align: "start" }}
        >
          <CarouselContent>
            {media.map((image, index) => (
              <CarouselItem
                key={image.src}
                aria-label={`${index + 1} of ${media.length}`}
              >
                <figure className="evenform-media-stack">
                  <AspectRatio ratio={16 / 9}>
                    <Image src={image.src} alt={image.alt} />
                  </AspectRatio>
                  <figcaption className="text-caption text-muted-foreground">
                    {image.caption}
                  </figcaption>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="evenform-media-carousel-controls">
            <CarouselPrevious />
            <CarouselPosition />
            <CarouselNext />
          </div>
        </Carousel>
      </PageSection>
      <PageSection
        title="Feedback and people"
        description="Native radio inputs support keyboard selection and form values; read-only feedback stays readable."
      >
        <div className="evenform-media-grid">
          <div className="evenform-media-stack">
            <div role="group" aria-label="Rating example" id="example-rating" className="showcase-example"><Rating
              label="How useful was this process reference?"
              value={score}
              onValueChange={setScore}
              allowClear
            /></div>
            <Rating label="Published review" value={4.5} readOnly />
            <Rating label="Review not yet available" disabled />
          </div>
          <div className="evenform-media-stack">
            <div role="group" aria-label="Badge group example" id="example-badge-group" className="showcase-example"><BadgeGroup
              badge={<Badge variant="success">Ready</Badge>}
              action={
                <a href="#media-code-example">
                  View usage{" "}
                  <ExternalLinkIcon
                    className="inline size-3"
                    aria-hidden="true"
                  />
                </a>
              }
            >
              Reviewed by the design team
            </BadgeGroup></div>
            <div role="group" aria-label="Avatar group example" id="example-avatar-group" className="showcase-example"><AvatarGroup
              aria-label="Reference reviewers"
              overflow={2}
              overflowLabel="2 more reviewers"
            >
              <Avatar role="img" aria-label="Sam Rivera">
                <AvatarFallback>SR</AvatarFallback>
              </Avatar>
              <Avatar role="img" aria-label="Jordan Lee">
                <AvatarFallback>JL</AvatarFallback>
              </Avatar>
              <Avatar role="img" aria-label="Alex Morgan">
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
            </AvatarGroup></div>
            <div className="flex flex-wrap items-center gap-toolbar">
              <div role="group" aria-label="Indicator example" id="example-indicator" className="showcase-example"><Indicator
                label={`${unread} unread review notifications`}
                count={unread}
              >
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Mark review notifications as read"
                  disabled={unread === 0}
                  onClick={() => setUnread(0)}
                >
                  <BellIcon />
                </Button>
              </Indicator></div>
              <span
                role="status"
                className="text-caption text-muted-foreground"
              >
                {unread
                  ? `${unread} unread notifications`
                  : "All notifications read"}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={unread > 0}
                onClick={() => setUnread(3)}
              >
                Reset preview
              </Button>
            </div>
          </div>
        </div>
      </PageSection>
      <PageSection id="example-qr-code"
        title="Share a reference"
        description="The QR symbol encodes the value below. Copy feedback includes asynchronous permission and clipboard failures."
      >
        <div className="evenform-media-share">
          <QRCode
            value={qrValue || " "}
            label={
              qrValue
                ? `QR code for ${qrValue}`
                : "Enter a value to create a QR code"
            }
            size={144}
          />
          <div className="evenform-media-stack">
            <label className="evenform-media-stack">
              Link or text to encode
              <Input
                value={qrValue}
                onChange={(event) => setQrValue(event.target.value)}
                maxLength={1000}
              />
            </label>
            <div>
              <div role="group" aria-label="Copy button example" id="example-copy-button" className="showcase-example"><CopyButton
                value={qrValue}
                label="Copy reference"
                disabled={!qrValue}
              /></div>
            </div>
            <p className="text-caption text-muted-foreground">
              The example address uses example.com. Replace it with your own
              destination.
            </p>
          </div>
        </div>
      </PageSection>
      <PageSection id="example-code-block"
        title="Code and clipboard"
        description="Selectable source keeps native scrolling, an optional filename, and a copy action."
      >
        <div id="media-code-example">
          <CodeBlock code={code} language="tsx" filename="review-preview.tsx" />
        </div>
      </PageSection>
      <PageSection id="example-video"
        title="Native video"
        description="Browser controls preserve playback, volume, full screen, and caption behavior."
      >
        <LocalVideoExample />
      </PageSection>
    </div>
  )
}

export { MediaAidsGallery }
