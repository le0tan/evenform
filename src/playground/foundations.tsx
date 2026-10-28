import { useId, useState, type CSSProperties, type FormEvent } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  Layers,
  LayoutGrid,
  Mail,
  SlidersHorizontal,
  ChartNoAxesCombined,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CopyButton } from "@/components/ui/copy-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OptionSelect } from "@/components/ui/option-select"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { PageSection } from "@/components/patterns/layouts"
import { palettes, type TokenPlayground } from "./use-tokens"
import "./foundations.css"

const tasks = [
  "Define the direction",
  "Make the details count",
  "Share it with the world",
]
const tokenExample =
  ":root {\n  --ds-card-padding: 24px;\n  --ds-control-height: 36px;\n}"

function ProjectPreview() {
  const [completed, setCompleted] = useState([true, true, false])
  const count = completed.filter(Boolean).length
  return (
    <Card className="foundation-project">
      <CardHeader className="flex flex-col items-start">
        <div className="foundation-project-heading">
          <span className="foundation-card-icon">
            <Layers aria-hidden="true" />
          </span>
          <Badge variant={count === tasks.length ? "success" : "secondary"}>
            {count === tasks.length ? "Ready to go" : "In progress"}
          </Badge>
        </div>
        <CardTitle className="text-sm leading-normal font-semibold">
          <h3>Launch checklist</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress
          value={(count / tasks.length) * 100}
          aria-label="Tasks completed"
          className="foundation-progress"
        >
          <ProgressLabel>Tasks completed</ProgressLabel>
          <span className="foundation-progress-count" aria-live="polite">
            {count} of {tasks.length}
          </span>
        </Progress>
        <ul className="foundation-checklist">
          {tasks.map((task, index) => (
            <li key={task}>
              <label
                className="foundation-task"
                data-complete={completed[index] || undefined}
              >
                <Checkbox
                  checked={completed[index]}
                  onCheckedChange={(checked) =>
                    setCompleted((current) =>
                      current.map((value, i) => (i === index ? checked : value))
                    )
                  }
                />
                <span>{task}</span>
              </label>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="foundation-project-footer">
        <div
          className="foundation-avatars"
          role="img"
          aria-label="Project team: Alex, Jamie and Sam"
        >
          <span>A</span>
          <span>J</span>
          <span>S</span>
        </div>

      </CardFooter>
    </Card>
  )
}

function InvitationPreview() {
  const id = useId()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("editor")
  const [invitation, setInvitation] = useState("")
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setInvitation(
      `Invitation preview: ${email.trim()} · ${role === "editor" ? "Editor" : "Viewer"}`
    )
  }
  return (
    <Card className="foundation-invitation">
      <CardHeader className="flex flex-col items-start">
        <span className="foundation-card-icon">
          <Mail aria-hidden="true" />
        </span>
        <CardTitle className="text-sm leading-normal font-semibold">
          <h3>Invite teammates</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="foundation-form" onSubmit={submit}>
          <div className="form-field">
            <Label htmlFor={`${id}-email`}>Email address</Label>
            <Input
              id={`${id}-email`}
              type="email"
              required
              autoComplete="off"
              placeholder="alex@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setInvitation("")
              }}
            />
          </div>
          <div className="form-field">
            <Label htmlFor={`${id}-role`}>Workspace role</Label>
            <OptionSelect
              value={role}
              onValueChange={(value) => {
                if (value) {
                  setRole(value)
                  setInvitation("")
                }
              }}
              options={[
                { value: "editor", label: "Editor" },
                { value: "viewer", label: "Viewer" },
              ]}
              triggerProps={{ id: `${id}-role`, className: "w-full" }}
            />
          </div>
          <Button type="submit">
            Preview invitation
            <ArrowRight aria-hidden="true" />
          </Button>
        </form>
        <p className={invitation ? "foundation-invitation-status" : undefined} role="status">{invitation}</p>
      </CardContent>
    </Card>
  )
}

function PreferencePreview() {
  const id = useId()
  const [digest, setDigest] = useState(true)
  const [updates, setUpdates] = useState(false)
  return (
    <Card className="foundation-preferences">
      <CardHeader className="flex flex-col items-start">
        <span className="foundation-card-icon">
          <Bell aria-hidden="true" />
        </span>
        <CardTitle className="text-sm leading-normal font-semibold">
          <h3>Notifications</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="foundation-preference">
          <div>
            <Label htmlFor={`${id}-digest`}>Daily digest</Label>

          </div>
          <Switch
            id={`${id}-digest`}

            checked={digest}
            onCheckedChange={setDigest}
          />
        </div>
        <div className="foundation-preference">
          <div>
            <Label htmlFor={`${id}-updates`}>Product updates</Label>

          </div>
          <Switch
            id={`${id}-updates`}

            checked={updates}
            onCheckedChange={setUpdates}
          />
        </div>
        <div className="foundation-digest" aria-live="polite">
          <Check aria-hidden="true" />
          <span>
            {digest ? "Daily digest enabled" : "Daily digest disabled"}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <a className="foundation-text-link" href="#settings">
          Explore settings
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </CardFooter>
    </Card>
  )
}

export function Foundations({ tokens }: { tokens: TokenPlayground }) {
  const id = useId()
  return (
    <div className="foundations">
      <header className="foundation-intro">
        <div>

          <h1>Foundations</h1>

        </div>
        <div className="foundation-intro-actions">
          <Button
            nativeButton={false}
            role="link"
            render={<a href="#components" />}
          >
            Explore components
            <ArrowRight aria-hidden="true" />
          </Button>
          <Button
            nativeButton={false}
            role="link"
            variant="ghost"
            render={<a href="#appearance" />}
          >
            <SlidersHorizontal aria-hidden="true" />
            Appearance lab
          </Button>
        </div>
      </header>

      <section
        className="foundation-playground"
        aria-labelledby={`${id}-preview`}
      >
        <div className="foundation-preview-toolbar">
          <h2 id={`${id}-preview`}>Component preview</h2>
          <div className="foundation-preview-controls">
            <fieldset className="foundation-palettes">
              <legend className="sr-only">Preview theme color</legend>
              {palettes
                .filter(
                  (palette) =>
                    palette !== "custom" || tokens.palette === "custom"
                )
                .map((palette) => (
                  <label
                    key={palette}
                    className="foundation-palette"
                    title={palette[0].toUpperCase() + palette.slice(1)}
                  >
                    <input
                      type="radio"
                      name={`${id}-palette`}
                      value={palette}
                      checked={tokens.palette === palette}
                      onChange={() => tokens.setPalette(palette)}
                      aria-label={`${palette[0].toUpperCase() + palette.slice(1)} theme`}
                    />
                    <span
                      className="foundation-palette-swatch"
                      data-color={palette}
                      style={
                        palette === "custom"
                          ? ({
                              "--foundation-swatch": tokens.customColor,
                            } as CSSProperties)
                          : undefined
                      }
                    />
                  </label>
                ))}
            </fieldset>
            <OptionSelect
              value={tokens.density}
              onValueChange={(value) => {
                if (value === "compact" || value === "comfortable")
                  tokens.setDensity(value)
              }}
              options={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfortable" },
              ]}
              triggerProps={{
                "aria-label": "Preview density",
                className: "foundation-density",
              }}
            />
          </div>
        </div>
        <div className="foundation-preview-grid">
          <ProjectPreview />
          <InvitationPreview />
          <PreferencePreview />
        </div>

      </section>

      <PageSection
        title="Design essentials"
        className="foundation-materials"
      >
        <div className="foundation-material-grid">
          <section className="foundation-material">
            <h3>Typography</h3>
            <div className="foundation-type-specimen" aria-hidden="true">
              Aa<span>Bb</span>
              <span>123</span>
            </div>
            <p>Geist</p>
          </section>
          <section className="foundation-material">
            <h3>Color</h3>
            <div className="foundation-color-strip">
              {["background", "muted", "border", "foreground", "primary"].map(
                (color) => (
                  <span
                    key={color}
                    style={{ background: `var(--${color})` }}
                    role="img"
                    aria-label={`${color} color`}
                    title={color}
                  />
                )
              )}
            </div>

          </section>
          <section className="foundation-material">
            <h3>Spacing</h3>
            <div className="foundation-spacing" aria-hidden="true">
              {[1, 2, 3, 4, 6, 8].map((space) => (
                <span
                  key={space}
                  style={{ width: `var(--ds-space-${space})` }}
                />
              ))}
            </div>

          </section>
        </div>
      </PageSection>

      <nav className="foundation-destinations" aria-label="Explore the library">
        {[
          {
            href: "#components",
            icon: LayoutGrid,
            title: "Components",
          },
          {
            href: "#patterns",
            icon: Layers,
            title: "Patterns",
          },
          {
            href: "#charts",
            icon: ChartNoAxesCombined,
            title: "Charts",
          },
        ].map(({ href, icon: Icon, title }) => (
          <a key={href} href={href}>
            <Icon aria-hidden="true" />
            <div>
              <h2>{title}</h2>
            </div>
            <ArrowUpRight aria-hidden="true" />
          </a>
        ))}
      </nav>

      <details className="foundation-token-guide">
        <summary>
          <ChevronRight aria-hidden="true" />
          Token reference
        </summary>
        <div className="foundation-token-content">
          <div className="foundation-token-layers">
            {[
              {
                title: "Primitive",
                description:
                  "Base spacing, type, color and motion values.",
                code: "--ds-space-4: 16px;",
              },
              {
                title: "Semantic",
                description: "Values assigned to shared roles.",
                code: "--ds-card-padding: var(--ds-space-4);",
              },
              {
                title: "Component",
                description: "Overrides for individual components.",
                code: "--ds-card-inset: var(--ds-card-padding);",
              },
            ].map((layer) => (
              <div key={layer.title}>
                <h3>{layer.title}</h3>
                <p>{layer.description}</p>
                <code>{layer.code}</code>
              </div>
            ))}
          </div>
          <div className="foundation-code-heading">
            <h3>CSS overrides</h3>
            <CopyButton value={tokenExample} label="Copy CSS" size="sm" />
          </div>
          <pre className="code-example">{tokenExample}</pre>
          <a className="foundation-text-link" href="#appearance">
            Open the appearance lab
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </details>
    </div>
  )
}
