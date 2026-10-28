import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react"
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type Extensions,
  type JSONContent,
} from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Link,
  Undo2,
  Redo2,
  Unlink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface RichTextEditorProps extends Omit<
  ComponentProps<"div">,
  "content" | "onChange" | "defaultValue"
> {
  /** A Tiptap document. Pass content to control it. */
  content?: JSONContent
  defaultContent?: JSONContent
  onUpdate?: (document: JSONContent, editor: Editor) => void
  readOnly?: boolean
  disabled?: boolean
  placeholder?: string
  label: string
  /** Additional trusted Tiptap extensions; the standard document schema is included. */
  extensions?: Extensions
  renderToolbar?: (editor: Editor) => ReactNode
  footer?: ReactNode | ((editor: Editor) => ReactNode)
  onEditorReady?: (editor: Editor) => void
}

function RichTextToolbar({ editor }: { editor: Editor }) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [linkError, setLinkError] = useState(false)
  const linkTrigger = useRef<HTMLButtonElement>(null)
  const linkErrorId = useId()
  function closeLink() {
    // Keep focus on a mounted control while the editor restores its selection.
    linkTrigger.current?.focus()
    setLinkOpen(false)
    editor.commands.focus()
  }
  function applyLink() {
    if (!/^(https?:\/\/\S+|mailto:\S+@\S+)$/i.test(url.trim())) {
      setLinkError(true)
      return
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run()
    closeLink()
    setLinkError(false)
  }
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      heading: current.isActive("heading", { level: 2 }),
      bullet: current.isActive("bulletList"),
      ordered: current.isActive("orderedList"),
      link: current.isActive("link"),
      undo: current.can().undo(),
      redo: current.can().redo(),
    }),
  })
  const controls = [
    {
      label: "Bold",
      icon: Bold,
      active: state.bold,
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      active: state.italic,
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Heading",
      icon: Heading2,
      active: state.heading,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Bullet list",
      icon: List,
      active: state.bullet,
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: state.ordered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ]
  return (
    <div data-slot="rich-text-toolbar">
      <div
        role="group"
        aria-label="Text formatting"
        className="flex flex-wrap gap-1"
      >
        {controls.map(({ label, icon: Icon, active, action }) => (
          <Button
            key={label}
            type="button"
            variant={active ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label={label}
            title={label}
            aria-pressed={active}
            onClick={action}
          >
            <Icon />
          </Button>
        ))}
        <Button
          type="button"
          variant={state.link ? "secondary" : "ghost"}
          size="icon-sm"
          aria-label="Edit link"
          ref={linkTrigger}
          title="Edit link"
          aria-pressed={state.link}
          aria-expanded={linkOpen}
          onClick={() => {
            setUrl(String(editor.getAttributes("link").href ?? ""))
            setLinkError(false)
            setLinkOpen(!linkOpen)
          }}
        >
          <Link />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove link"
          title="Remove link"
          disabled={!state.link}
          onClick={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        >
          <Unlink />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Undo"
          title="Undo"
          disabled={!state.undo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Redo"
          title="Redo"
          disabled={!state.redo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 />
        </Button>
      </div>
      {linkOpen && (
        <div
          data-slot="rich-text-link"
          className="flex flex-wrap items-center gap-field"
        >
          <Input
            autoFocus
            aria-label="Link URL"
            placeholder="https://example.com"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value)
              setLinkError(false)
            }}
            aria-invalid={linkError || undefined}
            aria-describedby={linkError ? linkErrorId : undefined}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return
              if (event.key === "Enter") {
                event.preventDefault()
                applyLink()
              }
              if (event.key === "Escape") {
                event.preventDefault()
                event.stopPropagation()
                closeLink()
              }
            }}
          />
          <Button size="sm" type="button" onClick={applyLink}>
            Apply link
          </Button>
          <Button
            size="sm"
            type="button"
            variant="ghost"
            onClick={closeLink}
          >
            Cancel
          </Button>
          {linkError && (
            <p
              id={linkErrorId}
              role="alert"
              className="w-full text-sm text-destructive"
            >
              Enter a complete http, https, or mailto URL.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function RichTextEditor({
  className,
  content,
  defaultContent,
  onUpdate,
  readOnly = false,
  disabled = false,
  placeholder = "Start writing…",
  label,
  extensions = [],
  renderToolbar,
  footer,
  onEditorReady,
  ...props
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: false,
          protocols: ["http", "https", "mailto"],
        },
      }),
      Placeholder.configure({ placeholder }),
      ...extensions,
    ],
    content: content ??
      defaultContent ?? { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    editable: !readOnly && !disabled,
    editorProps: {
      attributes: {
        "aria-label": label,
        role: "textbox",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor: current }) => onUpdate?.(current.getJSON(), current),
  })
  useEffect(() => {
    if (!editor) return
    editor.setEditable(!readOnly && !disabled)
    editor.view.dom.setAttribute("aria-readonly", String(readOnly))
    editor.view.dom.setAttribute("aria-disabled", String(disabled))
    editor.view.dom.setAttribute("aria-label", label)
  }, [editor, readOnly, disabled, label])
  useEffect(() => {
    if (
      editor &&
      content &&
      JSON.stringify(editor.getJSON()) !== JSON.stringify(content)
    )
      editor.commands.setContent(content, { emitUpdate: false })
  }, [editor, content])
  useEffect(() => {
    if (editor) onEditorReady?.(editor)
  }, [editor, onEditorReady])
  return (
    <div
      data-slot="rich-text-editor"
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      className={cn("evenform-rich-text-editor", className)}
      {...props}
    >
      {editor &&
        !readOnly &&
        !disabled &&
        (renderToolbar ? (
          renderToolbar(editor)
        ) : (
          <RichTextToolbar editor={editor} />
        ))}
      <EditorContent editor={editor} />
      {editor && footer && (
        <div data-slot="rich-text-footer">
          {typeof footer === "function" ? footer(editor) : footer}
        </div>
      )}
    </div>
  )
}
