import { AppearanceControls } from "./appearance-controls"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TokenPlayground } from "./use-tokens"
import { TokenAdjustments, TokenExport } from "./token-editors"

export function TokenPanel({
  tokens,
  onClose,
}: {
  tokens: TokenPlayground
  onClose: () => void
}) {
  return (
    <div className="token-panel-inner">
      <div className="inspector-heading">
        <div className="toolbar">
          <SlidersHorizontal size={15} />
          <h2>Design tokens</h2>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close token panel"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
      <div className="inspector-section">
        <div className="inspector-label">
          <span>Density</span>
        </div>
        <Tabs
          value={tokens.density}
          onValueChange={(value) =>
            tokens.setDensity(value as "compact" | "comfortable")
          }
        >
          <TabsList motion="slide" aria-label="UI density" className="density-tabs w-full">
            <TabsTrigger
              className="text-[length:var(--pg-font-size)]"
              value="compact"
            >
              Compact
            </TabsTrigger>
            <TabsTrigger
              className="text-[length:var(--pg-font-size)]"
              value="comfortable"
            >
              Comfortable
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {Object.keys(tokens.overrides).length > 0 && (
          <p className="inspector-help">Changing density clears numeric overrides.</p>
        )}
      </div>
      <div className="inspector-section">
        <AppearanceControls tokens={tokens} />
        <a
          href="#appearance"
          onClick={onClose}
          className="underline underline-offset-4"
        >
          Open Appearance lab
        </a>
      </div>
      <TokenAdjustments tokens={tokens} />
      <TokenExport tokens={tokens} />
      <div className="inspector-footnote">
        <span className="live-dot" />
        Settings saved in this browser
      </div>
    </div>
  )
}
