import { useState, type ReactNode } from "react"
import { FileText, Folder } from "lucide-react"
import type { Selection } from "react-aria-components"
import { PageSection } from "@/components/patterns/layouts"
import {
  Tree,
  TreeItem,
  TreeItemContent,
  TreeRow,
  Collection,
} from "@/components/ui/tree"
import { TreeSelect, type TreeSelectNode } from "@/components/ui/tree-select"
import { Transfer } from "@/components/ui/transfer"
import {
  FileUpload,
  FileUploadList,
  type FileRejection,
} from "@/components/ui/file-upload"

const folders: TreeSelectNode[] = [
  {
    id: "design",
    label: "Design",
    icon: <Folder />,
    children: [
      {
        id: "foundations",
        label: "Foundations",
        icon: <Folder />,
        children: [
          { id: "palette", label: "Color palette", icon: <FileText /> },
          { id: "type", label: "Typography", icon: <FileText /> },
        ],
      },
      {
        id: "components",
        label: "Components",
        icon: <Folder />,
        children: [
          { id: "inputs", label: "Input controls", icon: <FileText /> },
          { id: "layouts", label: "Layouts", icon: <FileText /> },
        ],
      },
    ],
  },
  {
    id: "research",
    label: "Research",
    icon: <Folder />,
    children: [
      { id: "interviews", label: "Interview notes", icon: <FileText /> },
    ],
  },
  {
    id: "archived",
    label: "Archived (restricted)",
    disabled: true,
    icon: <Folder />,
  },
]
const permissions = [
  { id: "read", label: "View projects", description: "Read project content" },
  {
    id: "comment",
    label: "Comment",
    description: "Participate in discussions",
  },
  {
    id: "edit",
    label: "Edit content",
    description: "Create and update documents",
  },
  { id: "share", label: "Share projects", description: "Invite collaborators" },
  {
    id: "billing",
    label: "Manage billing",
    description: "Restricted by organization",
    disabled: true,
  },
]

export function StructuredDataGallery() {
  const [treeSelection, setTreeSelection] = useState<Selection>(
    new Set(["palette"])
  )
  const [single, setSingle] = useState<string[]>(["inputs"])
  const [multiple, setMultiple] = useState<string[]>(["palette", "layouts"])
  const [targetKeys, setTargetKeys] = useState<string[]>(["read", "comment"])
  const [files, setFiles] = useState<
    { id: string; name: string; size: number; file: File; status: "ready" }[]
  >([])
  const [rejections, setRejections] = useState<FileRejection[]>([])
  const renderNode = (node: TreeSelectNode): ReactNode => (
    <TreeItem id={node.id} textValue={node.label} isDisabled={node.disabled}>
      <TreeItemContent>
        {(state) => (
          <TreeRow {...state} selectionMode="multiple">
            {node.icon}
            {node.label}
          </TreeRow>
        )}
      </TreeItemContent>
      <Collection items={node.children ?? []}>{renderNode}</Collection>
    </TreeItem>
  )
  return (
    <div className="preview-stack" data-testid="structured-data-gallery">
      <PageSection
        title="Hierarchical choices"
      >
        <div className="evenform-structured-grid">
          <div className="evenform-structured-example">
            <div role="group" aria-label="Tree example" id="example-tree" className="showcase-example"><Tree
              items={folders}
              aria-label="Design library folders"
              selectionMode="multiple"
              defaultExpandedKeys={["design", "foundations"]}
              selectedKeys={treeSelection}
              onSelectionChange={setTreeSelection}
            >
              {renderNode}
            </Tree></div>
            <p className="evenform-data-caption" aria-live="polite">
              {treeSelection === "all"
                ? "All items"
                : `${treeSelection.size} ${treeSelection.size === 1 ? "item" : "items"}`}{" "}
              selected. Each folder is selected individually.
            </p>
          </div>
          <div className="evenform-structured-example">
            <div role="group" aria-label="Tree select example" id="example-tree-select" className="showcase-example"><TreeSelect
              label="Default folder"
              items={folders}
              selectedKeys={single}
              onSelectionChange={setSingle}
              defaultExpandedKeys={["design", "components"]}
            /></div>
            <TreeSelect
              label="Included folders"
              items={folders}
              selectedKeys={multiple}
              onSelectionChange={setMultiple}
              selectionMode="multiple"
              defaultExpandedKeys={["design", "foundations", "components"]}
            />
            <TreeSelect
              label="Locked folder"
              items={folders}
              selectedKeys={["archived"]}
              onSelectionChange={() => {}}
              disabled
              description="Your organization manages this folder."
            />
          </div>
        </div>
      </PageSection>
      <PageSection
        title="Transfer between lists"
      >
        <div role="group" aria-label="Transfer example" id="example-transfer" className="showcase-example"><Transfer
          items={permissions}
          targetKeys={targetKeys}
          onTargetKeysChange={setTargetKeys}
          sourceLabel="Available permissions"
          targetLabel="Granted permissions"
        /></div>
      </PageSection>
      <PageSection id="example-file-upload"
        title="File picker & drop target"
      >
        <div className="evenform-structured-grid">
          <FileUpload
            accept=".pdf,.txt,.csv,image/*"
            maxSize={5 * 1024 * 1024}
            maxFiles={3}
            existingCount={files.length}
            label="Drop documents or images here"
            description="PDF, TXT, CSV or images · up to 5 MB each · 3 files maximum"
            onFilesAccepted={(accepted) => {
              setFiles((current) => [
                ...current,
                ...accepted.map((file) => ({
                  id: crypto.randomUUID(),
                  name: file.name,
                  size: file.size,
                  file,
                  status: "ready" as const,
                })),
              ])
              setRejections([])
            }}
            onFilesRejected={setRejections}
          />
          <div className="evenform-structured-example">
            <FileUploadList
              files={files}
              onRemove={(file) =>
                setFiles((current) =>
                  current.filter((item) => item.id !== file.id)
                )
              }
            />
            {rejections.length > 0 && (
              <ul
                className="evenform-structured-feedback evenform-data-error"
                role="alert"
              >
                {rejections.map((rejection, index) => (
                  <li key={`${rejection.file.name}-${index}`}>
                    {rejection.file.name}: {rejection.message}
                  </li>
                ))}
              </ul>
            )}
            <p className="evenform-data-caption" role="status">
              {files.length ? `${files.length} ${files.length === 1 ? "file" : "files"} selected.` : "No files selected."}
            </p>
          </div>
        </div>
      </PageSection>
    </div>
  )
}
