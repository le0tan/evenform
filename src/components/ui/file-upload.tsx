import { useRef, useState, type ComponentProps, type ReactNode } from "react"
import { File, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Progress } from "./progress"

export type FileRejectionCode = "file-type" | "file-size" | "file-count"
export interface FileRejection {
  file: File
  code: FileRejectionCode
  message: string
}
export interface FileValidationOptions {
  accept?: string
  maxSize?: number
  maxFiles?: number
  existingCount?: number
}

/** Browser validation is convenience feedback; a server must validate received files too. */
export function validateFiles(
  files: readonly File[],
  { accept, maxSize, maxFiles, existingCount = 0 }: FileValidationOptions
) {
  const accepted: File[] = []
  const rejected: FileRejection[] = []
  const types =
    accept
      ?.split(",")
      .map((value) => value.trim().toLocaleLowerCase())
      .filter(Boolean) ?? []
  for (const file of files) {
    const type = file.type.toLocaleLowerCase()
    const name = file.name.toLocaleLowerCase()
    if (
      types.length &&
      !types.some((pattern) =>
        pattern.startsWith(".")
          ? name.endsWith(pattern)
          : pattern.endsWith("/*")
            ? type.startsWith(pattern.slice(0, -1))
            : type === pattern
      )
    ) {
      rejected.push({
        file,
        code: "file-type",
        message: "This file type is not accepted.",
      })
    } else if (maxSize !== undefined && file.size > maxSize) {
      rejected.push({
        file,
        code: "file-size",
        message: `File exceeds the ${formatFileSize(maxSize)} limit.`,
      })
    } else if (
      maxFiles !== undefined &&
      existingCount + accepted.length >= maxFiles
    ) {
      rejected.push({
        file,
        code: "file-count",
        message: `A maximum of ${maxFiles} files is allowed.`,
      })
    } else accepted.push(file)
  }
  return { accepted, rejected }
}

export interface FileUploadProps
  extends
    Omit<
      ComponentProps<"div">,
      "children" | "onDrop" | "onDragOver" | "onDragEnter" | "onDragLeave"
    >,
    FileValidationOptions {
  onFilesAccepted: (files: File[]) => void
  onFilesRejected?: (rejections: FileRejection[]) => void
  multiple?: boolean
  disabled?: boolean
  label?: ReactNode
  description?: ReactNode
  buttonLabel?: string
  inputProps?: Omit<
    ComponentProps<"input">,
    | "type"
    | "accept"
    | "multiple"
    | "disabled"
    | "onChange"
    | "ref"
    | "className"
    | "style"
  >
}

/** Picker and drop target only. The consumer owns files, transport, progress and retries. */
export function FileUpload({
  onFilesAccepted,
  onFilesRejected,
  accept,
  maxSize,
  maxFiles,
  existingCount = 0,
  multiple = true,
  disabled = false,
  label = "Drop files here",
  description,
  buttonLabel = "Choose files",
  inputProps,
  className,
  ...props
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)
  const [dragging, setDragging] = useState(false)
  const receive = (files: File[]) => {
    if (disabled) return
    const result = validateFiles(files, {
      accept,
      maxSize,
      maxFiles: multiple ? maxFiles : Math.min(maxFiles ?? 1, 1),
      existingCount,
    })
    if (result.accepted.length) onFilesAccepted(result.accepted)
    if (result.rejected.length) onFilesRejected?.(result.rejected)
  }
  return (
    <div
      className={cn("evenform-file-upload", className)}
      data-slot="file-upload"
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      onDragEnter={(event) => {
        if (!disabled && event.dataTransfer.types.includes("Files")) {
          event.preventDefault()
          dragDepth.current++
          setDragging(true)
        }
      }}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1)
        if (dragDepth.current === 0) setDragging(false)
      }}
      onDragOver={(event) => {
        if (!disabled && event.dataTransfer.types.includes("Files")) {
          event.preventDefault()
          event.dataTransfer.dropEffect = "copy"
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        dragDepth.current = 0
        setDragging(false)
        receive(Array.from(event.dataTransfer.files))
      }}
      {...props}
    >
      <Upload size={20} aria-hidden="true" />
      <div className="evenform-file-upload-copy">
        <p>{label}</p>
        {description && <div className="evenform-data-caption">{description}</div>}
      </div>
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {buttonLabel}
      </Button>
      <input
        {...inputProps}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        hidden
        onChange={(event) => {
          receive(Array.from(event.target.files ?? []))
          event.target.value = ""
        }}
      />
    </div>
  )
}

export interface FileUploadItem {
  id: string
  name: string
  size?: number
  status?: "ready" | "uploading" | "complete" | "error"
  progress?: number
  error?: ReactNode
}
export interface FileUploadListProps<T extends FileUploadItem> extends Omit<
  ComponentProps<"ul">,
  "children"
> {
  files: readonly T[]
  onRemove?: (file: T) => void
  onRetry?: (file: T) => void
  renderActions?: (file: T) => ReactNode
  disabled?: boolean
}

export function FileUploadList<T extends FileUploadItem>({
  files,
  onRemove,
  onRetry,
  renderActions,
  disabled,
  className,
  ...props
}: FileUploadListProps<T>) {
  const removeButtons = useRef(new Map<string, HTMLElement>())
  return (
    <ul
      className={cn("evenform-file-list", className)}
      aria-label="Files"
      tabIndex={-1}
      {...props}
    >
      {files.map((file, index) => (
        <li key={file.id} className="evenform-file-list-item">
          <File size={18} aria-hidden="true" />
          <div className="evenform-file-list-copy">
            <span>{file.name}</span>
            <small>
              {file.size !== undefined && formatFileSize(file.size)}
              {file.size !== undefined && file.status && " · "}
              {file.status === "ready"
                ? "Ready"
                : file.status === "uploading"
                  ? "Uploading"
                  : file.status === "complete"
                    ? "Complete"
                    : file.status === "error"
                      ? "Failed"
                      : null}
            </small>
            {file.status === "uploading" && (
              <Progress
                value={file.progress ?? null}
                aria-label={`Uploading ${file.name}`}
              />
            )}
            {file.error && <p className="evenform-data-error">{file.error}</p>}
          </div>
          {renderActions?.(file)}
          {file.status === "error" && onRetry && (
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onRetry(file)}
            >
              Retry<span className="sr-only"> {file.name}</span>
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              aria-label={`Remove ${file.name}`}
              ref={element => {
                if (element) removeButtons.current.set(file.id, element)
                else removeButtons.current.delete(file.id)
              }}
              onClick={event => {
                const list = event.currentTarget.closest("ul")
                const next = files[index + 1] ?? files[index - 1]
                onRemove(file)
                requestAnimationFrame(() => {
                  const target = next && removeButtons.current.get(next.id)
                  if (target?.isConnected) target.focus()
                  else if (list?.isConnected) list.focus()
                })
              }}
            >
              <X aria-hidden="true" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}

export function formatFileSize(bytes: number, locale?: string) {
  const unit = bytes >= 1024 * 1024 ? "MB" : bytes >= 1024 ? "KB" : "B"
  const value =
    unit === "MB" ? bytes / (1024 * 1024) : unit === "KB" ? bytes / 1024 : bytes
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)} ${unit}`
}
