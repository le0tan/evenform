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
          <Title as="h3">Handover summary</Title>
          <Text>
            Sam is coordinating the handover. Account access is confirmed; the support rota and first reporting date still need review.
          </Text>
          <Text as="span" size="caption" tone="muted">
            Local sample · Updated 21 October
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
        Scroll inside this document to reveal “Back to document title”.
      </Text>
      <div
        className="evenform-utility-scroll"
        ref={container}
        tabIndex={0}
        role="region"
        aria-label="Scrollable handover guide"
      >
        <Title ref={heading} as="h3" id="utility-document-title" tabIndex={-1}>
          Workspace handover guide
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
            The workspace handover brings together the current release schedule, team contacts and outstanding questions. Review the summary before the checkpoint so each open item has a clear owner and a planned response.
          </p>
          <h4>Confirm the handover owner</h4>
          <p>
            Sam Rivera will coordinate the handover and keep the checklist up to date. Jordan Lee will answer questions about account access. Add other contacts to the project directory before the team begins its next review.
          </p>
          <p>
            Use <InlineCode>handover-october</InlineCode> as the reference when
            adding questions to the review queue. Include the affected project,
            the person who can answer, and the date a response is needed.
          </p>
          <h4>Check account access</h4>
          <p>
            Confirm that each team member can open the workspace and find the projects assigned to them. Ask the workspace owner to resolve missing access before the handover meeting. Record unresolved requests in the review queue.
          </p>
          <ul>
            <li>Confirm the project owner and backup contact.</li>
            <li>Check the support rota for the first week.</li>
            <li>
              Agree on the first reporting date and expected recipients.
            </li>
          </ul>
          <h4>Record open questions</h4>
          <p>
            Keep one review queue for questions that remain open. Each entry should name the project, describe the question and identify who will respond. Close an entry only after the answer is recorded where the next reviewer can find it.
          </p>
          <Blockquote attribution="Illustrative handover note">
            <p>
              Every open question needs an owner and a date for the next update.
            </p>
          </Blockquote>
          <h4>Confirm the next checkpoint</h4>
          <p>
            The next checkpoint is Thursday at 10:00 Singapore time. Review the outstanding items, confirm the release schedule and send any remaining questions to the handover owner before the meeting.
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

      >
        <LoadingExample />
      </PageSection>
      <PageSection id="example-typography"
        title="Typography"

      >
        <Prose as="article" aria-label="Typography example">
          <Title as="h3" size="page">
            October handover
          </Title>
          <Text>
            The October release is ready for review. Confirm account access and
            the support rota, then add any remaining questions to{" "}
            <InlineCode>handover-october</InlineCode> before Thursday’s checkpoint.
          </Text>
          <Text tone="muted" size="caption">
            Illustrative project note · Updated 21 October 2026
          </Text>
          <Blockquote
            attribution={
              <>
                Team note · <cite>October handover</cite>
              </>
            }
          >
            <Text>
              Please confirm the support rota before the next review.
            </Text>
          </Blockquote>
          <ul>
            <li>Account access confirmed</li>
            <li>Support rota awaiting confirmation</li>
            <li>
              First reporting date: 28 October
            </li>
          </ul>
          <Text as="span" tone="success" size="label">
            Review complete
          </Text>
        </Prose>
      </PageSection>
      <PageSection id="example-affix"
        title="Sticky reading tools"

      >
        <ReadingExample />
      </PageSection>
    </div>
  )
}

export { UtilityAidsGallery }
