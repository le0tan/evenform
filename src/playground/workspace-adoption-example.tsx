import { useState } from "react"
import { HeaderShell } from "@/components/patterns/header-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OptionSelect } from "@/components/ui/option-select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import "./workspace-adoption-example.css"

const options = [
  { value: "fields", label: "Fields" },
  { value: "optional", label: "Optional" },
]

/** Demo state belongs to the Showcase; the shell and controls remain reusable. */
export function WorkspaceAdoptionExample({
  embedded = true,
}: {
  embedded?: boolean
}) {
  const [field, setField] = useState<string | null>("fields")
  const [includePlan, setIncludePlan] = useState(true)
  return (
    <HeaderShell
      variant="workspace"
      contentAs={embedded ? "div" : "main"}
      className="adoption-workspace"
      data-embedded={embedded}
      mainId="adoption-workspace-content"
      header={
        <>
          <strong>Task review</strong>
          <OptionSelect
            options={options}
            value={field}
            onValueChange={setField}
            triggerProps={{ "aria-label": "Field mode" }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Snapshot parts
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuGroupLabel>Included parts</DropdownMenuGroupLabel>
                <DropdownMenuCheckboxItem
                  checked={includePlan}
                  onCheckedChange={setIncludePlan}
                  closeOnClick={false}
                >
                  Execution plan
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            onClick={() => setField(field === "fields" ? "optional" : "fields")}
          >
            Restore value
          </Button>
        </>
      }
      footer="18 review steps"
    >
      <div className="adoption-workspace-panels">
        <aside
          className="adoption-workspace-navigation"
          aria-label="Review steps"
          tabIndex={0}
        >
          {Array.from({ length: 18 }, (_, index) => (
            <a
              key={index}
              href={`#adoption-step-${index + 1}`}
              onClick={(event) => {
                event.preventDefault()
                const card = document.getElementById(
                  `adoption-step-${index + 1}`
                )
                card?.scrollIntoView({ block: "nearest", behavior: "instant" })
                card?.focus({ preventScroll: true })
              }}
            >
              Step {index + 1}
            </a>
          ))}
        </aside>
        <section
          className="adoption-workspace-feed"
          aria-label="Task activity"
          tabIndex={0}
        >
          {Array.from({ length: 18 }, (_, index) => (
            <Card key={index} tabIndex={-1} id={`adoption-step-${index + 1}`}>
              <CardHeader>
                <CardTitle>Step {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {index % 3 === 0
                    ? "Review the source fields, confirm the required values, and record any missing information before continuing."
                    : "Source fields reviewed."}
                </p>
                {includePlan && index % 3 === 0 && (
                  <details>
                    <summary>Execution plan</summary>
                    <ol>
                      <li>Read the source.</li>
                      <li>Check required values.</li>
                      <li>Save the reviewed fields.</li>
                    </ol>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </HeaderShell>
  )
}
