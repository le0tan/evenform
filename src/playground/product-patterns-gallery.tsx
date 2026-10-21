import { useShowcasePreview } from "./use-showcase-preview"
import { useState } from "react"
import type { JSONContent } from "@tiptap/react"
import { Bell, Check, FileText, MessageSquare } from "lucide-react"
import { ActivityFeed, ActivityItem } from "@/components/patterns/activity-feed"
import { Comment, Comments } from "@/components/patterns/comments"
import {
  Conversation,
  ConversationComposer,
  ConversationDaySeparator,
  ConversationList,
  ConversationMessage,
} from "@/components/patterns/conversation"
import {
  NotificationItem,
  NotificationList,
} from "@/components/patterns/notification-list"
import { PlanPicker } from "@/components/patterns/plan-picker"
import { SortableList } from "@/components/patterns/sortable-list"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const initialDocument: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Review handover" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Use the toolbar or keyboard shortcuts to format this document. ",
        },
        {
          type: "text",
          marks: [{ type: "bold" }],
          text: "Changes stay in this preview.",
        },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Confirm the owner and next checkpoint.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
function EditorExample() {
  const [document, setDocument] = useState(initialDocument)
  const [readOnly, setReadOnly] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [updated, setUpdated] = useState(false)
  return (
    <div className="product-patterns-example">
      <p className="product-patterns-note">
        A Tiptap document model with history, selection-aware formatting, lists,
        and links. This example owns the JSON document; no server persistence is
        connected.
      </p>
      <div className="toolbar">
        <Button
          variant="outline"
          aria-pressed={readOnly}
          onClick={() => setReadOnly(!readOnly)}
        >
          Read-only preview
        </Button>
        <Button
          variant="outline"
          aria-pressed={disabled}
          onClick={() => setDisabled(!disabled)}
        >
          Disable editor
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setDocument(initialDocument)
            setUpdated(false)
          }}
        >
          Reset document
        </Button>
        <span role="status" className="product-patterns-note">
          {updated ? "Document changed in this preview" : "Original document"}
        </span>
      </div>
      <RichTextEditor
        label="Handover document"
        content={document}
        onUpdate={(next) => {
          setDocument(next)
          setUpdated(true)
        }}
        readOnly={readOnly}
        disabled={disabled}
        footer="Use ⌘ / Ctrl + B for bold, Z to undo. Links require an https, http, or mailto URL."
      />
    </div>
  )
}
function ReorderExample() {
  const [items, setItems] = useState([
    {
      id: "owner",
      textValue: "Confirm ownership",
      detail: "Assign a person who can resolve review questions.",
    },
    {
      id: "accessibility",
      textValue: "Review keyboard access",
      detail: "Check focus order and visible focus in each state.",
    },
    {
      id: "release",
      textValue: "Prepare the handover",
      detail: "Record open questions and the next checkpoint.",
    },
  ])
  const [moved, setMoved] = useState(false)
  return (
    <div className="product-patterns-example">
      <p className="product-patterns-note">
        Drag a handle, or focus it and press Enter to start keyboard reordering.
        Follow the announced instructions and press Escape to cancel. Move
        buttons offer a direct alternative.
      </p>
      <SortableList
        label="Review checklist order"
        items={items}
        onReorder={(next) => {
          setItems(next)
          setMoved(true)
        }}
      >
        {(item) => (
          <>
            <p className="font-medium">{item.textValue}</p>
            <p className="product-patterns-note">{item.detail}</p>
          </>
        )}
      </SortableList>
      <p role="status" className="product-patterns-note">
        {moved
          ? `Current order: ${items.map((item) => item.textValue).join(", ")}.`
          : "The application owns this checklist order."}
      </p>
    </div>
  )
}
function PeopleExample() {
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState("")
  const [replies, setReplies] = useState<string[]>([])
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(
    "The focus order now follows the reading order. Can someone check the narrow layout before we finish?"
  )
  const [draft, setDraft] = useState(text)
  const [edited, setEdited] = useState(false)
  return (
    <div className="product-patterns-two-columns">
      <div className="product-patterns-example">
        <h3 className="font-medium">Review discussion</h3>
        <Comments aria-label="Review comments">
          <Comment
            author="Sam Rivera"
            avatar={
              <Avatar>
                <AvatarFallback>SR</AvatarFallback>
              </Avatar>
            }
            time={<time dateTime="2026-10-21T09:15:00+08:00">09:15</time>}
            edited={edited}
            actions={
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplying(!replying)}
                  aria-expanded={replying}
                >
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDraft(text)
                    setEditing(true)
                  }}
                >
                  Edit comment
                </Button>
              </>
            }
            replies={
              replies.length > 0 || replying ? (
                <div className="product-patterns-example">
                  {replies.length > 0 && (
                    <Comments aria-label="Replies to Sam">
                      {replies.map((item, index) => (
                        <Comment key={index} author="You" time="Just now">
                          {item}
                        </Comment>
                      ))}
                    </Comments>
                  )}
                  {replying && (
                    <form
                      className="product-patterns-example"
                      onSubmit={(event) => {
                        event.preventDefault()
                        if (reply.trim()) {
                          setReplies([...replies, reply.trim()])
                          setReply("")
                          setReplying(false)
                        }
                      }}
                    >
                      <label htmlFor="comment-reply">Reply to Sam</label>
                      <Textarea
                        id="comment-reply"
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                      />
                      <div className="toolbar">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!reply.trim()}
                        >
                          Post reply
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          type="button"
                          onClick={() => setReplying(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              ) : undefined
            }
          >
            {editing ? (
              <form
                className="product-patterns-example"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (draft.trim()) {
                    setText(draft.trim())
                    setEditing(false)
                    setEdited(true)
                  }
                }}
              >
                <label htmlFor="comment-edit">Edit your comment</label>
                <Textarea
                  id="comment-edit"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <div className="toolbar">
                  <Button type="submit" size="sm" disabled={!draft.trim()}>
                    Save comment
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              text
            )}
          </Comment>
        </Comments>
        <p className="product-patterns-note">
          Comment text, edit forms, and replies are owned by this page and stay
          in memory.
        </p>
      </div>
      <div className="product-patterns-example">
        <h3 className="font-medium">Activity</h3>
        <ActivityFeed aria-label="Review activity">
          <ActivityItem
            icon={<FileText size={16} />}
            title="Sam updated the handover"
            time={<time dateTime="2026-10-21T09:10:00+08:00">09:10</time>}
          >
            Added keyboard review notes and ownership details.
          </ActivityItem>
          <ActivityItem
            icon={<MessageSquare size={16} />}
            title="Jordan requested a review"
            time={<time dateTime="2026-10-21T08:45:00+08:00">08:45</time>}
          >
            The compact and comfortable layouts are ready to check.
          </ActivityItem>
          <ActivityItem
            icon={<Check size={16} />}
            title="Checklist created"
            time={<time dateTime="2026-10-20">Yesterday</time>}
          />
        </ActivityFeed>
      </div>
    </div>
  )
}
function ConversationExample() {
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<string[]>([])
  return (
    <Conversation aria-label="Handover conversation">
      <p className="product-patterns-note">
        Send a message to append it to the local conversation. Delivery and
        connection status remain application state.
      </p>
      <ConversationList aria-label="Conversation history">
        <ConversationDaySeparator>
          <time dateTime="2026-10-21">Today, 21 October</time>
        </ConversationDaySeparator>
        <ConversationMessage
          author="Jordan Lee"
          time={<time dateTime="2026-10-21T09:20:00+08:00">09:20</time>}
        >
          The keyboard review is complete. Is the handover ready for another
          look?
        </ConversationMessage>
        <ConversationMessage
          author="You"
          outgoing
          time="09:22"
          status="Added to this preview"
        >
          Yes. I have added the remaining questions to the checklist.
        </ConversationMessage>
        {messages.map((text, index) => (
          <ConversationMessage
            key={index}
            author="You"
            outgoing
            time="Just now"
            status="Added to this preview"
          >
            {text}
          </ConversationMessage>
        ))}
      </ConversationList>
      <ConversationComposer
        value={draft}
        onValueChange={setDraft}
        onSubmit={(text) => {
          setMessages([...messages, text])
          setDraft("")
        }}
        status={
          <span role="status" className="product-patterns-note">
            {messages.length > 0
              ? `${messages.length} messages added locally.`
              : "Local preview"}
          </span>
        }
      />
    </Conversation>
  )
}
function NotificationsExample() {
  const [unread, setUnread] = useState(["review", "comment"])
  const items = [
    {
      id: "review",
      title: "Review requested",
      text: "Jordan asked you to check the handover document.",
      time: "10 minutes ago",
      icon: FileText,
    },
    {
      id: "comment",
      title: "New comment",
      text: "Sam added a question about the narrow layout.",
      time: "25 minutes ago",
      icon: MessageSquare,
    },
    {
      id: "complete",
      title: "Checklist updated",
      text: "The owner confirmed the next checkpoint.",
      time: "Yesterday",
      icon: Check,
    },
  ]
  return (
    <div className="product-patterns-example">
      <div className="toolbar">
        <h3 className="font-medium">Workspace notifications</h3>
        <Badge variant="secondary">{unread.length} unread</Badge>
        <Button
          variant="outline"
          size="sm"
          disabled={!unread.length}
          onClick={() => setUnread([])}
        >
          Mark all as read
        </Button>
      </div>
      <NotificationList aria-label="Workspace notifications">
        {items.map(({ id, title, text, time, icon: Icon }) => (
          <NotificationItem
            key={id}
            title={title}
            icon={<Icon size={16} />}
            time={time}
            unread={unread.includes(id)}
            actions={
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setUnread((previous) =>
                    previous.includes(id)
                      ? previous.filter((key) => key !== id)
                      : [...previous, id]
                  )
                }
              >
                {unread.includes(id) ? "Mark as read" : "Mark as unread"}
              </Button>
            }
          >
            {text}
          </NotificationItem>
        ))}
      </NotificationList>
      <p role="status" className="product-patterns-note">
        <Bell className="inline size-3.5" aria-hidden="true" /> {unread.length}{" "}
        unread in this preview. Read state is local to this page.
      </p>
    </div>
  )
}
function PlansExample() {
  const [plan, setPlan] = useState("team")
  return (
    <div className="product-patterns-example">
      <PlanPicker
        name="preview-plan"
        label="Choose a workspace plan"
        description="Illustrative options demonstrate plan selection. This preview does not start a subscription."
        value={plan}
        onValueChange={setPlan}
        options={[
          {
            value: "personal",
            name: "Personal",
            description: "For individual review work.",
            price: "$0 / month",
            features: (
              <ul>
                <li>One workspace</li>
                <li>Personal checklists</li>
              </ul>
            ),
          },
          {
            value: "team",
            name: "Team",
            description: "For shared review and handover.",
            price: "$12 / member / month",
            badge: <Badge variant="secondary">Current preview</Badge>,
            features: (
              <ul>
                <li>Shared workspaces</li>
                <li>Review ownership</li>
              </ul>
            ),
          },
          {
            value: "organization",
            name: "Organization",
            description: "Contact your administrator for access.",
            price: "Custom",
            disabled: true,
            features: (
              <ul>
                <li>Organization administration</li>
                <li>Access policies</li>
              </ul>
            ),
          },
        ]}
      />
      <p role="status" className="product-patterns-note">
        Selected option: {plan === "team" ? "Team" : "Personal"}. Use arrow keys
        to change the selected plan.
      </p>
    </div>
  )
}
export function ProductPatternsGallery() {
  const [preview, setPreview] = useShowcasePreview("patterns", "product", ["editor", "reorder", "comments", "conversation", "notifications", "plans"], "editor")
  return (
    <div className="product-patterns-gallery">
      <div>
        <h2>Content and collaboration</h2>
        <p className="product-patterns-note">
          Reusable editing, ordering, discussion, and selection structures. Each
          preview owns its data and actions.
        </p>
      </div>
      <Tabs value={preview} onValueChange={setPreview}>
        <TabsList>
          <TabsTrigger value="editor">Rich text</TabsTrigger>
          <TabsTrigger value="reorder">Reorder</TabsTrigger>
          <TabsTrigger value="comments">Comments & activity</TabsTrigger>
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <div role="group" aria-label="Rich text editor example" id="example-rich-text-editor" className="showcase-example"><EditorExample /></div>
        </TabsContent>
        <TabsContent value="reorder">
          <div role="group" aria-label="Sortable list example" id="example-sortable-list" className="showcase-example"><ReorderExample /></div>
        </TabsContent>
        <TabsContent value="comments">
          <div role="group" aria-label="Comments & activity example" id="example-comments" className="showcase-example"><PeopleExample /></div>
        </TabsContent>
        <TabsContent value="conversation">
          <div role="group" aria-label="Conversation example" id="example-conversation" className="showcase-example"><ConversationExample /></div>
        </TabsContent>
        <TabsContent value="notifications">
          <div role="group" aria-label="Notification list example" id="example-notification-list" className="showcase-example"><NotificationsExample /></div>
        </TabsContent>
        <TabsContent value="plans">
          <div role="group" aria-label="Plan picker example" id="example-plan-picker" className="showcase-example"><PlansExample /></div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
