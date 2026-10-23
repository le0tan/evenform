# Source adoption size analysis

This is an analysis record, not a production optimization. No component entry,
shared CSS import, class table or dependency version was removed or changed to
reduce bundle size. The P1/SSR work is independent of these measurements.

## Method

Two archived revisions of one React Router consumer were rebuilt from temporary
snapshots, using the same installed dependencies and build settings. The host
was not edited. The revisions represent its existing UI before adoption and its
source-adopted UI after adoption; they are not isolated control-library benchmarks.
Repository identity and business source are intentionally omitted here.

The profiler used Node 26.7.0, React/React DOM 19.2.8, Vite 8.2.2,
`@react-router/dev` 8.3.0 and `@tailwindcss/vite` 4.3.3 for both revisions.
It records emitted client files, normalized per-file `gzipSync` sizes under that
same Node runtime, module inventories and pre-minification rendered lengths.
Gzip totals sum compressed files, not a single compression of the concatenated
bundle. They can differ from another Node version or Vite's console estimates.
Asset totals are emitted files, not measured page transfers or font requests.

Two further builds changed only the temporary after-snapshot:

- **Without Combobox:** its source module was replaced with an inert stub to
  measure dependency reachability and final output size. The stub does not
  implement the control and is not a proposed replacement.
- **Without workspace stylesheet:** its explicit import was removed to isolate
  that stylesheet's emitted cost. This breaks styling contracts and is not a
  proposed production configuration.

The source snapshots, logs and full report stay in ignored local evidence. The
public profiling helper contains no consumer URL or business-specific source.

## Controlled build results

Sizes below are exact emitted bytes or normalized gzip bytes; 1 kB = 1,000 bytes.

| Client output | Before | After | Delta |
| --- | ---: | ---: | ---: |
| All JavaScript | 690,283 | 804,379 | +114,096 |
| All JavaScript gzip | 217,189 | 258,389 | +41,200 |
| Home route JavaScript | 374,822 | 487,520 | +112,698 |
| Home route JavaScript gzip | 115,182 | 155,896 | +40,714 |
| Stylesheet | 65,752 | 125,626 | +59,874 |
| Stylesheet gzip | 13,705 | 23,702 | +9,997 |
| Font/other emitted assets | 160,636 | 160,636 | 0 |

| Temporary ablation, compared with After | JavaScript delta | JS gzip delta | CSS delta | CSS gzip delta |
| --- | ---: | ---: | ---: | ---: |
| Remove Combobox implementation | −37,541 | −12,577 | 0 | 0 |
| Remove workspace stylesheet | 0 | 0 | −5,588 | −712 |

The new Combobox's unique reachable implementation accounts for about 30.5% of
the total JavaScript gzip increase in this composition. Other components share
some of its dependencies, so that figure is not a standalone Combobox bundle
size. The remaining 28,623 gzip bytes include the broader primitive replacement,
new Tabs, class-merging and host composition changes; this run does not assign
an additive gzip size to each of those parts.

The workspace stylesheet accounts for about 7.1% of the CSS gzip increase.
Removing it would save 712 bytes while violating the layout contract; it would
not address most of the observed growth. The adopted core imports tokens,
appearance, control sizing, patterns, extended controls/patterns and motion, with
many rules outside this consumer's selected TSX entries. CSS selectors are not
tree-shaken simply because their component's JavaScript is absent. Tailwind's
host utility generation also changes when the adopted source is scanned.

## Module evidence and interpretation

The following are **pre-minification rendered module lengths**, not transferred
bytes, additive gzip contributions or evidence of runtime cost:

| Module family | Before | After |
| --- | ---: | ---: |
| React DOM | 461,033 | 461,033 |
| visx modules | 46,710 | 46,710 |
| Radix modules | 152,711 | 0 |
| Base UI + Base UI utilities | 0 | 527,830 |
| Floating UI modules | 54,130 | 49,758 |
| tailwind-merge | 56,119 | 0 |
| cn engine | 0 | 30,815 |
| Host and adopted local modules | 149,154 | 171,958 |

There is no evidence here of duplicate React or a larger chart engine causing
the increase. Floating UI's rendered length decreases. Base UI's richer control
set and the changed local module set are the candidates to isolate next. The
class-merging engines were exchanged, and generated class metadata lives in the
local-module group; comparing only the two engine numbers would be misleading.

## Decisions before any optimization

1. Keep the working primitives and CSS contracts in this change. The ablations
   remove behavior or layout and are diagnostic experiments only.
2. Profile the remaining controls with identical markup/entry sets, especially
   closed-set Select, Dialog/Popover and Tabs. Attribute shared code separately;
   do not interpret the whole consumer delta as a single library defect.
3. Evaluate CSS entry separation with a maintained import/dependency map and
   real theme/density/motion/focus checks. Start with the broad core style groups,
   rather than expecting the workspace file to explain the entire increase.
4. Preserve semantic class-merging behavior. If considering narrower generated
   metadata, test host-supplied utilities and token conflict cases first.
5. Measure route loading, parse/interaction latency and actual network requests
   before choosing budgets. This report contains build sizes only; it does not
   establish a performance regression or a production optimization target.

## Reproduction

The helper supports a source-adopted React Router/Vite consumer with an existing
pnpm installation and `vite.config.ts`:

```sh
npm run analyze:adoption-size -- /path/to/consumer BEFORE_SHA AFTER_SHA \
  --ablate-combobox --ablate-workspace-style
```

Use the same supported Node runtime for both builds. The helper resolves immutable
Git revisions, uses installed dependencies, refuses ambiguous missing-package
versions, and never installs packages. Its optional ablations expect the standard
`@/components/ui/combobox` import and explicit workspace CSS import. It is not an
arbitrary framework/package-manager profiler or a lockfile-reproducibility audit.
Review the recorded dependency versions and use locked clean installations when
that stronger guarantee is needed. Results are saved under `evidence/adoption-size/`.
