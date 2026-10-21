import type { ComponentProps, Ref } from "react"
import {
  MentionsInput as MentionsInputPrimitive,
  Mention as MentionPrimitive,
  type MentionsInputProps,
  type MentionsInputHandle,
  type MentionsInputClassNames,
} from "react-mentions-ts"
import { cn } from "cn"

const partClasses: MentionsInputClassNames = {
  control:
    "evenform-mentions-control rounded-[var(--_mentions-radius)] border-[length:var(--_mentions-border-width)] bg-[var(--_mentions-background)]",
  highlighter: "evenform-mentions-highlighter",
  highlighterSubstring: "evenform-mentions-substring",
  highlighterCaret: "evenform-mentions-caret",
  input: "evenform-mentions-input overflow-auto resize-y",
  suggestions:
    "evenform-mentions-suggestions min-w-[var(--_mentions-list-min-width)] backdrop-blur-none",
  suggestionsList:
    "evenform-mentions-list max-h-[var(--_mentions-list-height)] divide-y-0",
  suggestionsStatus: "evenform-mentions-status",
  suggestionItem: "evenform-mentions-option",
  suggestionItemFocused: "evenform-mentions-option-focused",
  suggestionDisplay: "evenform-mentions-display",
  suggestionHighlight: "evenform-mentions-match",
  loadingIndicator: "evenform-mentions-loading",
  loadingSpinner: "evenform-mentions-spinner",
  loadingSpinnerElement: "evenform-mentions-spinner-dot",
  inlineSuggestion: "evenform-mentions-inline",
  inlineSuggestionText: "evenform-mentions-inline-text",
  inlineSuggestionPrefix: "evenform-mentions-inline-prefix",
  inlineSuggestionSuffix: "evenform-mentions-inline-suffix",
}

type MentionsProps<
  Extra extends Record<string, unknown> = Record<string, unknown>,
> = MentionsInputProps<Extra> & { ref?: Ref<MentionsInputHandle> }

/** Thin adapter: upstream owns caret/markup mapping, suggestions, async cancellation and refs. */
function Mentions<
  Extra extends Record<string, unknown> = Record<string, unknown>,
>({
  className,
  classNames,
  suggestionsPlacement = "auto",
  a11ySuggestionsListLabel = "Mention suggestions",
  ...props
}: MentionsProps<Extra>) {
  const merged = { ...partClasses }
  for (const key of Object.keys(
    classNames ?? {}
  ) as (keyof MentionsInputClassNames)[])
    merged[key] = cn(partClasses[key], classNames?.[key])
  return (
    <MentionsInputPrimitive
      {...props}
      suggestionsPlacement={suggestionsPlacement}
      a11ySuggestionsListLabel={a11ySuggestionsListLabel}
      className={cn("evenform-mentions", className)}
      classNames={merged}
    />
  )
}

type MentionProps<
  Extra extends Record<string, unknown> = Record<string, unknown>,
> = ComponentProps<typeof MentionPrimitive<Extra>>
function Mention<
  Extra extends Record<string, unknown> = Record<string, unknown>,
>({ className, ...props }: MentionProps<Extra>) {
  return (
    <MentionPrimitive
      {...props}
      className={cn("evenform-mention rounded-none bg-[var(--_mention-background)]", className)}
    />
  )
}

export {
  Mentions,
  Mentions as MentionsInput,
  Mention,
  type MentionsProps,
  type MentionProps,
}
export type {
  MentionsInputHandle,
  MentionDataItem,
  MentionDataPage,
  MentionSearchContext,
  MentionsInputChangeEvent,
  MentionsInputChangeHandler,
  MentionsInputClassNames,
  MentionSelection,
  MentionSerializer,
  MentionDataProviderResult,
  MentionSearchReason,
} from "react-mentions-ts"

export { createMarkupSerializer, makeTriggerRegex } from "react-mentions-ts"
