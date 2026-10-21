import { useId, useRef, useState, type ComponentProps } from "react"
import { ListBox, ListBoxItem } from "react-aria-components"
import { Check, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type CascaderOption = { id: string; label: string; disabled?: boolean; children?: readonly CascaderOption[] }
export type CascaderProps = Omit<ComponentProps<"div">, "onChange" | "children" | "defaultValue"> & {
  label: string; options: readonly CascaderOption[]; value: readonly string[]; onValueChange: (path: string[]) => void
  disabled?: boolean; invalid?: boolean; name?: string; placeholder?: string; changeOnSelect?: boolean
  clearLabel?: string; rootLabel?: string; levelLabel?: (level: number) => string
}
/** Each path level is a real single-select listbox. Tab moves between levels;
 * arrows/typeahead stay with each list. No business category data is embedded. */
export function Cascader({ label, options, value, onValueChange, disabled, invalid, name, placeholder = "Choose a path…", changeOnSelect = false, clearLabel = "Clear path", rootLabel = "All categories", levelLabel = level => `Level ${level}`, className, ...props }: CascaderProps) {
  const id = useId()
  const firstList = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [navigation, setNavigation] = useState<readonly string[]>(value)
  function describe(path: readonly string[]) { const labels: string[] = []; let items = options; for (const key of path) { const item = items.find(option => option.id === key); if (!item) break; labels.push(item.label); items = item.children ?? [] } return labels }
  const selectedLabels = describe(value)
  const columns: (readonly CascaderOption[])[] = [options]
  for (const key of navigation) { const next = columns[columns.length - 1].find(item => item.id === key)?.children; if (!next?.length) break; columns.push(next) }
  function select(level: number, key: string) {
    const option = columns[level].find(item => item.id === key)
    if (disabled || !option || option.disabled) return
    const next = [...navigation.slice(0, level), key]
    setNavigation(next)
    if (!option.children?.length || changeOnSelect) onValueChange(next)
    if (!option.children?.length) setOpen(false)
  }
  return <div {...props} className={cn("evenform-cascader", className)}><label id={`${id}-label`} className="evenform-field-label">{label}</label><div className="evenform-cascader-trigger-row"><Popover open={open} onOpenChange={next => { if (next) setNavigation(value); setOpen(next) }}><PopoverTrigger render={<Button variant="outline" disabled={disabled} className="evenform-cascader-trigger" aria-labelledby={`${id}-label ${id}-value`} aria-invalid={invalid || undefined} />}><span id={`${id}-value`}>{selectedLabels.join(" / ") || placeholder}</span><ChevronDown size={16} aria-hidden="true" /></PopoverTrigger><PopoverContent aria-label={label} className="evenform-cascader-popup" align="start" initialFocus={firstList}><div className="evenform-cascader-path"><Button variant="ghost" size="sm" disabled={disabled} onClick={() => setNavigation([])}>{rootLabel}</Button>{describe(navigation).map((text, index) => <Button variant="ghost" size="sm" key={index} disabled={disabled} onClick={() => setNavigation(navigation.slice(0, index + 1))}>{text}<ChevronRight size={13} aria-hidden="true" /></Button>)}</div><div className="evenform-cascader-columns">{columns.map((items, level) => <ListBox key={level} ref={level === 0 ? firstList : undefined} className="evenform-cascader-list" aria-label={levelLabel(level + 1)} items={items} selectionMode="single" selectedKeys={navigation[level] ? new Set([navigation[level]]) : new Set()} onSelectionChange={keys => { const key = Array.from(keys)[0]; if (key != null) select(level, String(key)) }} disabledKeys={items.filter(item => disabled || item.disabled).map(item => item.id)}>{item => <ListBoxItem id={item.id} textValue={item.label} className="evenform-cascader-option"><span>{item.label}</span>{item.children?.length ? <ChevronRight size={14} aria-hidden="true" /> : navigation[level] === item.id ? <Check size={14} aria-hidden="true" /> : null}</ListBoxItem>}</ListBox>)}</div></PopoverContent></Popover>{value.length > 0 && <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onValueChange([])}>{clearLabel}</Button>}</div>{name && value.map(key => <input type="hidden" name={name} value={key} key={key} disabled={disabled} />)}</div>
}
