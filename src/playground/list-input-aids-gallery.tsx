import { useMemo, useRef, useState } from "react"
import { PageSection, FormField } from "@/components/patterns/layouts"
import { Button } from "@/components/ui/button"
import { InputTag } from "@/components/ui/input-tag"
import { SearchField } from "@/components/ui/search-field"
import {
  VirtualList,
  type VirtualListHandle,
} from "@/components/ui/virtual-list"

const records = Array.from({ length: 10_000 }, (_, index) => ({
  id: `review-${index + 1}`,
  title: `Review record ${index + 1}`,
  summary:
    index % 3 === 0
      ? "Review the handover notes, confirm the project owner, and record any questions before the next checkpoint."
      : index % 3 === 1
        ? "Confirm the owner and next review date."
        : "Review the current implementation and record any follow-up questions for the team before approving this item.",
}))
const recordKey = (record: (typeof records)[number]) => record.id
const smallRecords = ["Design review", "Keyboard review", "Content review"]

export function ListInputAidsGallery() {
  const listRef = useRef<VirtualListHandle>(null)
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([
    "Accessibility",
    "Design systems",
  ])
  const [keywords, setKeywords] = useState<string[]>(["research", "research"])
  const [saved, setSaved] = useState<string[] | null>(null)
  const matches = useMemo(
    () =>
      records.filter((record) =>
        record.title.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  )
  return (
    <div className="evenform-list-input-gallery">
      <PageSection id="example-virtual-list"
        title="Virtual list"
        description="10,000 records. Jump to a record or scroll the list."
      >
        <div className="evenform-list-input-stack">
          <SearchField
            aria-label="Search virtual records"
            placeholder="Search review records…"
            value={query}
            onValueChange={setQuery}
          />
          <div className="evenform-list-input-toolbar">
            <Button
              variant="outline"
              size="sm"
              disabled={!matches.length}
              onClick={() => listRef.current?.scrollToIndex(0)}
            >
              First record
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!matches.length}
              onClick={() =>
                listRef.current?.scrollToIndex(Math.floor(matches.length / 2), {
                  align: "start",
                })
              }
            >
              Middle record
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!matches.length}
              onClick={() =>
                listRef.current?.scrollToIndex(matches.length - 1, {
                  align: "end",
                })
              }
            >
              Last record
            </Button>
            <span className="evenform-list-input-note" role="status">
              {matches.length.toLocaleString("en-US")} matching records
            </span>
          </div>
          <VirtualList
            ref={listRef}
            items={matches}
            getItemKey={recordKey}
            estimateSize={160}
            label="Review records"
            emptyContent="No review records match your search."
            renderItem={(record) => (
              <article className="evenform-list-input-record">
                <div className="evenform-list-input-toolbar">
                  <h3>{record.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`${expanded.includes(record.id) ? "Collapse" : "Expand"} ${record.title}`}
                    aria-expanded={expanded.includes(record.id)}
                    onClick={() =>
                      setExpanded((previous) =>
                        previous.includes(record.id)
                          ? previous.filter((id) => id !== record.id)
                          : [...previous, record.id]
                      )
                    }
                  >
                    {expanded.includes(record.id) ? "Less" : "Details"}
                  </Button>
                </div>
                <p>{record.summary}</p>
                {expanded.includes(record.id) && (
                  <p>
                    The next review is scheduled for Thursday. Confirm the handover owner and add any outstanding questions to the project notes.
                  </p>
                )}
              </article>
            )}
          />

          <VirtualList
            items={smallRecords}
            getItemKey={(item) => item}
            estimateSize={48}
            virtualized={false}
            label="Finite review checklist"
            className="h-auto"
            renderItem={(item) => (
              <div className="evenform-list-input-finite">{item}</div>
            )}
          />
        </div>
      </PageSection>
      <PageSection id="example-input-tag"
        title="Free-form input tags"
        description="Enter your own labels or paste a comma, semicolon, or line-separated list. Rejected text stays available for editing."
      >
        <form
          className="evenform-list-input-stack"
          onSubmit={(event) => {
            event.preventDefault()
            setSaved(
              new FormData(event.currentTarget).getAll("topics").map(String)
            )
          }}
        >
          <FormField
            id="list-input-topics"
            label="Review topics"
            description="Add up to 6 unique topics, at most 30 characters each. Enter commits a topic; empty-input Backspace focuses the last tag."
          >
            <InputTag
              id="list-input-topics"
              name="topics"
              value={tags}
              onValueChange={(next) => {
                setTags(next)
                setSaved(null)
              }}
              maxTags={6}
              validate={(tag) =>
                tag.length > 30
                  ? "Topics must be 30 characters or fewer."
                  : null
              }
              aria-describedby="list-input-topics-description"
              placeholder="Add a topic…"
            />
          </FormField>
          <div className="evenform-list-input-toolbar">
            <Button type="submit">Submit topics</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTags([])
                setSaved(null)
              }}
            >
              Clear topics
            </Button>
            <span className="evenform-list-input-note">
              {tags.length} of 6 topics
            </span>
          </div>
          {saved && (
            <p className="evenform-list-input-note" role="status">
              Submitted values: {saved.length ? saved.join(", ") : "None"}.
            </p>
          )}
          <FormField
            id="list-input-keywords"
            label="Repeated keywords"
            description="Duplicate labels are allowed. Moving focus out of the field adds the draft label."
          >
            <InputTag
              id="list-input-keywords"
              value={keywords}
              onValueChange={setKeywords}
              allowDuplicates
              commitOnBlur
              aria-describedby="list-input-keywords-description"
              placeholder="Add any keyword…"
            />
          </FormField>
          <FormField id="list-input-readonly" label="Read-only topics">
            <InputTag
              id="list-input-readonly"
              aria-label="Read-only topics"
              value={["Published", "Reviewed"]}
              onValueChange={() => {}}
              readOnly
            />
          </FormField>
          <FormField id="list-input-disabled" label="Unavailable topics">
            <InputTag
              id="list-input-disabled"
              value={["Managed by administrator"]}
              onValueChange={() => {}}
              disabled
            />
          </FormField>
        </form>
      </PageSection>
    </div>
  )
}
