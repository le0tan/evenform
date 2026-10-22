import { useRef, useState } from "react"
import { PageSection } from "@/components/patterns/layouts"
import { Button } from "@/components/ui/button"
import { EditableText } from "@/components/ui/editable-text"
import { ExpandableText } from "@/components/ui/expandable-text"
import {
  ResizeBox,
  type ResizeBoxHandle,
  type ResizeBoxSize,
} from "@/components/ui/resize-box"
import { Text, Title } from "@/components/ui/typography"

const summary =
  "The workspace handover is ready for review. Sam will answer questions about the release schedule, and Jordan will confirm the support rota. The remaining checklist covers account access, the invoice contact, and the first reporting date. Please add any open questions before Thursday’s checkpoint so the team can resolve them before the handover."

export function ContentAidsGallery() {
  const resizeRef = useRef<ResizeBoxHandle>(null)
  const [size, setSize] = useState<ResizeBoxSize>({ width: 380, height: 220 })
  const [title, setTitle] = useState("Review the onboarding flow")
  const [expanded, setExpanded] = useState(false)
  const [savedTitle, setSavedTitle] = useState<string | null>(null)
  return (
    <div className="evenform-content-aids-gallery">
      <PageSection id="example-resize-box"
        title="Standalone resize box"
        description="Resize one surface independently with the edge handles. Focus a handle and use arrow keys, Shift + arrows, Home, or End."
      >
        <div className="evenform-content-aids-stack">
          <div className="evenform-content-aids-toolbar">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                resizeRef.current?.resizeTo({ width: 380, height: 220 })
              }
            >
              Reset size
            </Button>
            <output className="evenform-content-aids-note evenform-content-aids-size">
              Requested: {Math.round(size.width)} × {Math.round(size.height)} px
            </output>
          </div>
          <div className="evenform-content-aids-resize-stage">
            <ResizeBox
              ref={resizeRef}
              label="Reading preview"
              size={size}
              onSizeChange={setSize}
              minWidth={180}
              maxWidth={640}
              minHeight={140}
              maxHeight={380}
              edges={["top", "right", "bottom", "left"]}
              className="max-w-full"
            >
              <div className="evenform-content-aids-example">
                <Title as="h3" size="label">
                  Reading preview
                </Title>
                <Text tone="muted" size="label">
                  The handover checklist covers account access, team contacts, reporting dates and open questions.
                </Text>
                <ExpandableText lines={3}>{summary}</ExpandableText>
              </div>
            </ResizeBox>
          </div>
          <div className="evenform-content-aids-examples">
            <div className="evenform-content-aids-example">
              <h3>Width only</h3>
              <ResizeBox
                label="Width-only preview"
                axes="horizontal"
                defaultSize={{ width: 280, height: 140 }}
                minWidth={160}
                maxWidth={400}
                className="max-w-full"
              >
                <Text size="label">
                  Only the right edge changes this surface. Height remains
                  fixed.
                </Text>
              </ResizeBox>
            </div>
            <div className="evenform-content-aids-example">
              <h3>Disabled handles</h3>
              <ResizeBox
                label="Locked preview"
                disabled
                defaultSize={{ width: 280, height: 140 }}
                className="max-w-full"
              >
                <Text size="label">
                  Resizing is locked in this preview.
                </Text>
              </ResizeBox>
            </div>
          </div>
        </div>
      </PageSection>
      <PageSection id="example-editable-text"
        title="Editable text"
        description="Edit a value in context. Saving commits the draft; cancelling restores the saved value and returns focus to Edit."
      >
        <div className="evenform-content-aids-examples">
          <div className="evenform-content-aids-example">
            <h3>Project title · required</h3>
            <EditableText
              label="Review title"
              value={title}
              onValueChange={setTitle}
              validate={(value) =>
                !value.trim()
                  ? "Enter a review title before saving."
                  : value.length > 80
                    ? "Keep the title to 80 characters or fewer."
                    : null
              }
              onSave={(value) => setSavedTitle(value)}
            />
            {savedTitle && (
              <p role="status" className="evenform-content-aids-note">
                Saved: {savedTitle}
              </p>
            )}
          </div>
          <div className="evenform-content-aids-example">
            <h3>Multiline note</h3>
            <EditableText
              label="Review note"
              multiline
              defaultValue={"Check the empty state and keyboard navigation.\nRecord the decision in the review."}
            />
          </div>
          <div className="evenform-content-aids-example">
            <h3>Read-only</h3>
            <EditableText
              label="Published reference"
              value="Published reference: EVENFORM-1042"
              readOnly
            />
          </div>
          <div className="evenform-content-aids-example">
            <h3>Save error · demonstration</h3>
            <EditableText
              label="Offline draft"
              defaultValue="Try saving this draft"
              onSave={() => Promise.reject(new Error("Demonstration"))}
              saveErrorMessage="This demonstration is offline. Your draft is retained; cancel to close it."
            />
          </div>
        </div>
      </PageSection>
      <PageSection id="example-expandable-text"
        title="Expandable text"

      >
        <div className="evenform-content-aids-examples">
          <div className="evenform-content-aids-example">
            <h3>Project summary · two lines</h3>
            <ExpandableText
              lines={2}
              expanded={expanded}
              onExpandedChange={setExpanded}
            >
              {summary}
            </ExpandableText>
          </div>
          <div className="evenform-content-aids-example">
            <h3>Short text</h3>
            <ExpandableText lines={3}>
              This text already fits. There is no extra action to navigate.
            </ExpandableText>
          </div>
        </div>
      </PageSection>
    </div>
  )
}
