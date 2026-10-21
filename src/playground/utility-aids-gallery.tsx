import { useEffect, useRef, useState } from "react"
import { PageSection } from "@/components/patterns/layouts"
import { Affix } from "@/components/ui/affix"
import { BackToTop } from "@/components/ui/back-to-top"
import { Button } from "@/components/ui/button"
import { BusyRegion, LoadingState, Spinner } from "@/components/ui/spinner"
import {
  Blockquote,
  InlineCode,
  Prose,
  Text,
  Title,
} from "@/components/ui/typography"

function LoadingExample() {
  const [busy, setBusy] = useState(false)
  const [completed, setCompleted] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <div className="evenform-utility-stack">
      <div className="flex flex-wrap items-center gap-toolbar">
        <Button
          disabled={busy}
          onClick={() => {
            setBusy(true)
            setCompleted(false)
            timer.current = setTimeout(() => {
              setBusy(false)
              setCompleted(true)
            }, 1200)
          }}
        >
          {busy && <Spinner />}
          {busy ? "Refreshing preview…" : "Refresh local preview"}
        </Button>
        <Text as="span" size="caption" tone="muted">
          A local timer demonstrates the pending state.
        </Text>
      </div>
      <BusyRegion
        busy={busy}
        aria-label="Reference summary"
        role="region"
        loadingContent={
          <LoadingState
            label="Refreshing reference summary…"
            description="The current summary remains available while this preview updates."
          />
        }
      >
        <div className="evenform-utility-summary">
          <Title as="h3">Design reference</Title>
          <Text>
            The reference includes component APIs, token ownership, and keyboard
            behavior. Review these together before adopting a new control.
          </Text>
          <Text as="span" size="caption" tone="muted">
            Last saved reference · locally displayed sample
          </Text>
        </div>
      </BusyRegion>
      <Text role="status" tone="muted" size="caption">
        {completed ? "Local preview refreshed." : ""}
      </Text>
    </div>
  )
}

function ReadingExample() {
  const container = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  return (
    <div className="evenform-utility-stack">
      <Text tone="muted">
        Scroll inside this reading region to reveal “Back to document title”.
        The toolbar sticks inside its container; returning also focuses the
        document heading.
      </Text>
      <div
        className="evenform-utility-scroll"
        ref={container}
        tabIndex={0}
        role="region"
        aria-label="Scrollable design review guide"
      >
        <Title ref={heading} as="h3" id="utility-document-title" tabIndex={-1}>
          Design review guide
        </Title>
        <Affix className="evenform-utility-reading-toolbar">
          <Text as="span" size="label" weight="medium">
            Review checklist
          </Text>
          <Text as="span" tone="muted" size="caption">
            Reference document
          </Text>
        </Affix>
        <Prose measure="full">
          <p>
            Review starts with a clear account of the task. Describe who is
            doing the work, the information they need, and the decision the
            interface helps them make. A smaller set of relevant controls often
            serves the task better than a complete inventory of features.
          </p>
          <h4>Preserve the content hierarchy</h4>
          <p>
            Use headings to describe the document structure. Change visual size
            independently when a heading appears in a narrow panel or a dense
            workspace. Ordinary supporting copy should stay readable without
            competing with the document title.
          </p>
          <p>
            Use <InlineCode>Title</InlineCode> for a native heading and{" "}
            <InlineCode>Text</InlineCode> for body or supporting copy. The{" "}
            <InlineCode>as</InlineCode> prop selects the appropriate element,
            while CSS tokens keep the appearance consistent across themes and
            densities.
          </p>
          <h4>Check interaction in context</h4>
          <p>
            Move through the interface with a keyboard. Confirm that controls
            receive visible focus, selected values are announced, and disabled
            actions remain understandable. Floating content should return focus
            to the place where the interaction began.
          </p>
          <ul>
            <li>Review the real content at narrow and wide widths.</li>
            <li>Use the same semantic tokens for the same purpose.</li>
            <li>
              Check loading, empty, and recovery paths that the task actually
              needs.
            </li>
          </ul>
          <h4>Keep ownership clear</h4>
          <p>
            The design system owns presentation, interaction primitives, and
            configurable parameters. The application owns data, requests,
            permissions, and persistence. A demonstration should make the
            boundary visible when a user could mistake a local preview for a
            completed service operation.
          </p>
          <Blockquote attribution="Evenform design principles">
            <p>
              Start with the task. Reuse a pattern when its structure helps the
              reader, and compose a different structure when the content calls
              for it.
            </p>
          </Blockquote>
          <h4>Review before publishing</h4>
          <p>
            Confirm that the implementation and its documentation describe the
            same behavior. A successful build establishes source compatibility.
            A browser review establishes the visual and interaction behavior in
            the scenarios actually checked.
          </p>
          <p>
            Return to the document title when you are ready to begin another
            pass.
          </p>
        </Prose>
      </div>
      <div className="flex justify-end">
        <BackToTop
          target={heading}
          scrollContainer={container}
          threshold={120}
          label="Back to document title"
        />
      </div>
    </div>
  )
}

function UtilityAidsGallery() {
  return (
    <div className="evenform-utility-gallery">
      <PageSection id="example-spinner"
        title="Loading and busy content"
        description="A spinner is decorative by default. Loading text stays static unless the application opts into a live role; busy content remains in flow."
      >
        <LoadingExample />
      </PageSection>
      <PageSection id="example-typography"
        title="Typography with meaning"
        description="Choose a heading level for document structure, a visual size for hierarchy, and a text tone for the message."
      >
        <Prose as="article" aria-label="Typography example">
          <Title as="h3" size="page">
            Clear decisions begin with readable context
          </Title>
          <Text>
            A reference should answer the reader’s next question. Give the key
            decision a clear heading, keep supporting copy close, and use{" "}
            <InlineCode>--ds-text-body</InlineCode> when the task needs the
            shared body scale.
          </Text>
          <Text tone="muted" size="caption">
            Supporting copy uses the caption scale and muted foreground.
          </Text>
          <Blockquote
            attribution={
              <>
                Design review note · <cite>Interface writing guide</cite>
              </>
            }
          >
            <Text>
              State the intended action directly. Describe what the reader can
              do next.
            </Text>
          </Blockquote>
          <ul>
            <li>Title keeps native heading semantics.</li>
            <li>Text can render as a paragraph, span, div, or label.</li>
            <li>
              Prose gives mixed document content a readable measure and rhythm.
            </li>
          </ul>
          <Text as="span" tone="success" size="label">
            Review complete
          </Text>
        </Prose>
      </PageSection>
      <PageSection id="example-affix"
        title="Sticky reading tools"
        description="CSS sticky preserves normal document flow. The return action follows the selected scroll container, respects reduced motion, and moves focus to a real heading."
      >
        <ReadingExample />
      </PageSection>
    </div>
  )
}

export { UtilityAidsGallery }
