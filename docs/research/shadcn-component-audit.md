# shadcn component audit: update to the 4.23 registry output

- Date: 2026-11-09
- Status: Complete. This audit is read-only. It did not change repository files other than this report. It ran one temporary install in `/tmp/opencode/uitest2`, outside the repository.

## Answer

Update the CLI and the Base UI runtime, then run one `shadcn add` batch with `--overwrite`. After the post-steps and `bun run format`, 13 of the 15 component files are byte-identical. `sidebar.tsx` changes only comments. `sonner.tsx` changes code. Three files need a restore: `sidebar.tsx` (local comment edits), `sonner.tsx` (local OS theme), and `hooks/use-mobile.ts` (local `useSyncExternalStore`). The CLI adds `cn` and `next-themes`; the post-steps remove them.

The registry is live and unversioned. The version anchor is the CLI: at the audit date, `bunx --bun shadcn@latest --version` prints `4.23.0`. The `info --json` output reports style `base-nova`, base `base`, `rsc: false`, icon library `lucide`, and the aliases `#components`, `#lib`, `#hooks`, `#lib/utils`. See [Evidence](#evidence).

### 1. Component audit

"Match" means the CLI `--view` output equals the installed file after the two post-steps and `oxfmt`. See the method in [Evidence](#evidence).

| Component | Installed file | Registry result | Risk | Source |
| --- | --- | --- | --- | --- |
| Alert | `packages/ui/src/components/alert.tsx` | Match | Low | `https://ui.shadcn.com/r/styles/base-nova/alert.json`; CLI `--view` diff empty |
| Avatar | `packages/ui/src/components/avatar.tsx` | Match | Low | `https://ui.shadcn.com/r/styles/base-nova/avatar.json`; CLI `--view` diff empty |
| Button | `packages/ui/src/components/button.tsx` | Match | Low | `https://ui.shadcn.com/r/styles/base-nova/button.json`; CLI `--view` diff empty |
| Card | `packages/ui/src/components/card.tsx` | Match after the CLI transform | Low | `https://ui.shadcn.com/r/styles/base-nova/card.json`; raw JSON has `cn-font-heading`, CLI `--view` removes it |
| Dropdown Menu | `packages/ui/src/components/dropdown-menu.tsx` | Match after the CLI transform | Low | `https://ui.shadcn.com/r/styles/base-nova/dropdown-menu.json`; raw JSON has `cn-menu-target cn-menu-translucent`, CLI `--view` removes them |
| Empty | `packages/ui/src/components/empty.tsx` | Match after the CLI transform | Low | `https://ui.shadcn.com/r/styles/base-nova/empty.json`; raw JSON has `cn-font-heading`, CLI `--view` removes it |
| Input | `packages/ui/src/components/input.tsx` | Match | Low | `https://ui.shadcn.com/r/styles/base-nova/input.json`; CLI `--view` diff empty |
| Item | `packages/ui/src/components/item.tsx` | Match after the CLI transform | Low | `https://ui.shadcn.com/r/styles/base-nova/item.json`; CLI rewrites the separator import to `#components/separator` |
| Separator | `packages/ui/src/components/separator.tsx` | Match | Low | `https://ui.shadcn.com/r/styles/base-nova/separator.json`; CLI `--view` diff empty |
| Sheet | `packages/ui/src/components/sheet.tsx` | Match after the CLI transform | Low | `https://ui.shadcn.com/r/styles/base-nova/sheet.json`; CLI rewrites the button import and resolves `XIcon` |
| Sidebar | `packages/ui/src/components/sidebar.tsx` | Match in code; comments drift | Medium | `https://ui.shadcn.com/r/styles/base-nova/sidebar.json`; local comments at `packages/ui/src/components/sidebar.tsx:60-61`, `:73`, `:79`, `:84`, `:97-98`, `:202` |
| Skeleton | `packages/ui/src/components/skeleton.tsx` | Match | Low | `https://ui.shadcn.com/r/styles/base-nova/skeleton.json`; CLI `--view` diff empty |
| Sonner | `packages/ui/src/components/sonner.tsx` | Drift: registry adds `next-themes` | High | `https://ui.shadcn.com/r/styles/base-nova/sonner.json`; installed local theme at `packages/ui/src/components/sonner.tsx:10-12` |
| Spinner | `packages/ui/src/components/spinner.tsx` | Match after the CLI transform | Low | `https://ui.shadcn.com/r/styles/base-nova/spinner.json`; CLI resolves `Loader2Icon` |
| Tooltip | `packages/ui/src/components/tooltip.tsx` | Match | Low | `https://ui.shadcn.com/r/styles/base-nova/tooltip.json`; CLI `--view` diff empty |
| `use-mobile` hook (sidebar dependency) | `packages/ui/src/hooks/use-mobile.ts` | Drift: local `useSyncExternalStore` | Medium | CLI `add sidebar --view src/hooks/use-mobile.ts`; installed hook at `packages/ui/src/hooks/use-mobile.ts:6-20` |

Risk key:

- **Low**: the overwrite is byte-identical after the post-steps. No app code change.
- **Medium**: the overwrite loses a local edit. Restore the file, or merge by hand.
- **High**: the overwrite adds a dependency that conflicts with a documented repository decision. Keep the local file.

The installed set has 15 files in `packages/ui/src/components`. The `info --json` component list names the same 15. See `packages/ui/src/components` and the [Evidence](#evidence).

Per-component version: the registry does not publish one. The exact current item is the live JSON at the URL in the table, fetched on 2026-11-09. The CLI version is the only version anchor.

### What changes

- `packages/ui/package.json`: `shadcn` moves from `4.21.3` to `4.23.0` (`packages/ui/package.json:40`). `@base-ui/react` moves from `1.8.0` to `1.9.0` (`packages/ui/package.json:25`). The `add` batch also adds `cn` and `next-themes`; the post-steps remove them.
- 13 component files: no content change after the post-steps and `bun run format`.
- `sidebar.tsx`: the overwrite changes comments only. The code is identical.
- `sonner.tsx`: the overwrite adds `next-themes`. Restore the local file.
- `use-mobile.ts`: the overwrite replaces `useSyncExternalStore` with `useEffect`. Restore the local file.
- `globals.css`: no change.
- App code: no required change. See [Components that need app code](#4-components-that-need-app-code).

### 2. Exact command sequence

Run this on a rift. Inspect the diff before step 4.

```bash
# 0. Preflight
git status --short
bun install

# 1. Create the rift
rift create --name shadcn-4-23
# cd to the worktree that rift prints

# 2. Bump the CLI and the Base UI runtime
cd packages/ui
bun add --exact --dev shadcn@4.23.0
bun add --exact @base-ui/react@1.9.0
cd ../..

# 3. Preview, then apply, the registry output
cd packages/ui
bunx --bun shadcn@4.23.0 add alert avatar button card dropdown-menu empty input item separator sheet sidebar skeleton sonner spinner tooltip --dry-run -y
bunx --bun shadcn@4.23.0 add alert avatar button card dropdown-menu empty input item separator sheet sidebar skeleton sonner spinner tooltip --overwrite -y

# 4. Restore the three files with local edits.
#    This registry build has no code change in them. Re-check the diff first.
git checkout -- src/components/sidebar.tsx src/components/sonner.tsx src/hooks/use-mobile.ts

# 5. Post-steps
grep -rl 'from "cn"' src/components | xargs sed -i 's/from "cn"/from "#lib\/utils"/g'
grep -rl '^"use client"' src | xargs sed -i '/^"use client"$/d'
bun remove cn next-themes

# 6. Format and verify
bun run format
cd ../..
bun run check
bun run --filter @acme/web build
```

`bun run --filter @acme/web build` runs `vite build`, which can prompt for 1Password secrets. See `AGENTS.md:250-255`.

Notes:

- Do not use `--all`. It adds every component for the style. The repository uses 15 components. See `packages/ui/src/components`.
- `sidebar` pulls `button`, `input`, `separator`, `sheet`, `skeleton`, `tooltip`, and `use-mobile`. The batch lists them all. The dry-run reports 16 files: the 15 components plus `src/hooks/use-mobile.ts`. See [Evidence](#evidence).
- `bun add --exact` matches the repository's exact pins. See `packages/ui/package.json:25` and `:40`.
- `shadcn@4.23.0` (published 2026-10-27) and `@base-ui/react@1.9.0` (published 2026-10-09) pass the 3-day gate at `bunfig.toml:6`.
- Step 4 is safe only for this registry build. If a future build changes `sidebar.tsx`, `sonner.tsx`, or `use-mobile.ts`, merge the change by hand. Do not run `git checkout` blindly.
- Optional: omit `sonner` from the batch. The local file is already correct, and the batch would otherwise install `next-themes` only to remove it. The table lists `sonner` so the audit covers every installed component.

### 3. Manual post-steps

1. **Repair `cn` imports.**
   - The CLI writes `import { cn } from "cn"` in 14 component files. It writes `cn@^0.5.2` to `packages/ui/package.json`. See [Evidence](#evidence).
   - Replace every import with `from "#lib/utils"`. Remove the `cn` dependency.
   - The repository convention is `#lib/utils` at `packages/ui/components.json:19`. The rule is at `AGENTS.md:307-309`.

2. **Strip `"use client"`.**
   - The CLI writes the directive only to `sidebar.tsx` in this batch. See [Evidence](#evidence).
   - Delete the line. The repository has no RSC boundary. The rule is at `AGENTS.md:310-311`.

3. **Icon imports.**
   - The CLI resolves every `IconPlaceholder` to a lucide export because `packages/ui/components.json:13` sets `"iconLibrary": "lucide"`.
   - The resolved names match the installed imports: `XIcon`, `CheckIcon`, `ChevronRightIcon`, `PanelLeftIcon`, `Loader2Icon`, `CircleCheckIcon`, `InfoIcon`, `TriangleAlertIcon`, `OctagonXIcon`.
   - No manual icon step. See [Evidence](#evidence).

4. **`globals.css` `@source` list.**
   - The list at `packages/ui/src/styles/globals.css:12` already names all 15 installed components.
   - The batch does not change `globals.css`. See [Evidence](#evidence).
   - If you add `toast`, `field`, or `input-group`, add each new file to the list: `toast.tsx`; `field.tsx` plus `label.tsx`; or `input-group.tsx` plus `textarea.tsx`. An unlisted component renders unstyled. The rule is at `AGENTS.md:320-321`.

5. **New subcomponents.**
   - The 15 installed components have no new subcomponents in the 4.23 output. The CLI diffs are empty or comment-only. See [Evidence](#evidence).
   - `toast` is a new component file, not a subcomponent. It exports `Toaster`, `Toast`, `ToastAction`, `ToastClose`, `ToastContent`, `ToastDescription`, `ToastPortal`, `ToastProvider`, `ToastTitle`, `ToastViewport`, `createToastManager`, `toast`, and `useToastManager`. See `https://ui.shadcn.com/r/styles/base-nova/toast.json`.
   - `field` and `input-group` are new component files. See [Components that need app code](#4-components-that-need-app-code).

6. **Base UI API change.**
   - The repository uses `@base-ui/react` `1.8.0` at `packages/ui/package.json:25`. The latest is `1.9.0`. See `https://registry.npmjs.org/@base-ui%2Freact`.
   - The package exports the same subpaths in both versions. The prop types used by the installed components are unchanged. `Button.d.ts` and `TooltipPopup.d.ts` are identical. `MenuPositioner`, `DialogPopup`, `AvatarRoot`, and `Input` change only `import type` syntax. See [Evidence](#evidence).
   - `TooltipProvider` still has the `delay` prop. `Toast.createToastManager` exists in both versions. See [Evidence](#evidence).
   - No code change is required. The 1.9.0 release notes list fixes and one preview Menu feature. They do not list a breaking change for these primitives. See `https://github.com/mui/base-ui/releases/tag/v1.9.0`.

### 4. Components that need app code

| Component | Registry change | App code change | Source |
| --- | --- | --- | --- |
| Button | No file change. The docs show a `Spinner` inside the button for loading. There is no `loading` prop. | No. The notes form already uses `<Spinner data-icon="inline-start" />` at `apps/web/src/routes/app/notes.tsx:76-83`. | `https://ui.shadcn.com/docs/components/base/button`; `https://ui.shadcn.com/docs/components/base/button.md`, section "Spinner" |
| Empty | No file change. The CLI output is identical. | No. The app uses the same exports at `apps/web/src/routes/app/notes.tsx:92-101`, `apps/web/src/components/error-surface.tsx:23-36`, and `apps/web/src/components/not-found-surface.tsx:15-28`. | `https://ui.shadcn.com/r/styles/base-nova/empty.json` |
| Field | New component, not installed. It declares `label` and `separator`; `label` is not installed. | No current code. Add it only if a form needs labels, descriptions, and errors. | `https://ui.shadcn.com/r/styles/base-nova/field.json` |
| Input Group | New component, not installed. It declares `button`, `input`, and `textarea`; `textarea` is not installed. | No current code. Add it only if an input needs addons or buttons. | `https://ui.shadcn.com/r/styles/base-nova/input-group.json` |
| Sonner | The registry adds `next-themes` and `useTheme`. The docs URL redirects to Toast. | No change if you keep the local file. If you migrate to Base UI Toast, change `apps/web/src/components/toaster.tsx` and add `toast` to `@source`. | `https://ui.shadcn.com/r/styles/base-nova/sonner.json`; `https://ui.shadcn.com/docs/components/base/sonner` |
| Tooltip | No file change. The docs say to wrap the app in `TooltipProvider`. | Optional. The app has no provider. This is an existing condition, not a 4.23 change. | `https://ui.shadcn.com/docs/components/base/tooltip`; `packages/ui/src/components/tooltip.tsx:5` |
| Card, Empty, Dropdown Menu | The raw JSON has `cn-font-heading` or `cn-menu-*`. The CLI removes them for this preset. | No. The CLI output matches the installed files. | `https://ui.shadcn.com/r/styles/base-nova/card.json`; `https://ui.shadcn.com/r/styles/base-nova/empty.json`; `https://ui.shadcn.com/r/styles/base-nova/dropdown-menu.json` |
| Sidebar, Sheet, Spinner | The raw JSON uses `IconPlaceholder`. The CLI resolves it to lucide. | No. The names match the installed imports. | `https://ui.shadcn.com/r/styles/base-nova/sidebar.json`; `https://ui.shadcn.com/r/styles/base-nova/sheet.json`; `https://ui.shadcn.com/r/styles/base-nova/spinner.json` |

#### Sonner versus Toast

The registry still ships `sonner`, but the docs route redirects to Toast:

- `https://ui.shadcn.com/docs/components/base/sonner` returns HTTP 308 with `location: /docs/components/base/toast`. See [Evidence](#evidence).
- `https://ui.shadcn.com/r/styles/base-nova/sonner.json` still exists. Its `dependencies` are `["sonner","next-themes"]`.
- `https://ui.shadcn.com/r/styles/base-nova/toast.json` exists. Its `dependencies` are `["cn","@base-ui/react"]`. It has one file, `registry/base-nova/ui/toast.tsx`.

Keep the local `sonner.tsx` for this update. The reason is the repository theme decision:

- `AGENTS.md:316-318` says the theme follows the operating system, no `dark` class is set, and no theme script runs before paint.
- The local file sets `theme="system"` at `packages/ui/src/components/sonner.tsx:12`.
- The registry file calls `useTheme` from `next-themes`. The app has no `next-themes` provider. A grep of `apps/web/src` and `packages/ui/src` finds no `next-themes` import or provider. The dependency adds no value here.

If the maintainer wants the documented direction, migrate to `toast` in a separate change. The app has no `toast()` calls today. A grep of `apps/web/src` finds only the `Toaster` import at `apps/web/src/components/toaster.tsx:1` and the render at `apps/web/src/routes/__root.tsx:30`. The only integration point is the lazy loader at `apps/web/src/components/toaster.tsx:1-30`, which `apps/web/src/routes/__root.tsx:30` renders. The lazy boundary is still useful for SSR. Add `toast` to `packages/ui/src/styles/globals.css:12` after the add.

## Evidence

### CLI context

`bunx --bun shadcn@latest --version` output:

```
4.23.0
```

`bunx --bun shadcn@latest info --json` reports:

```
"framework": "Manual",
"tailwindVersion": "v4",
"importAlias": "#",
"config": {
  "style": "base-nova",
  "base": "base",
  "rsc": false,
  "iconLibrary": "lucide",
  "aliases": { "components": "#components", "utils": "#lib/utils", "lib": "#lib", "hooks": "#hooks" }
},
"preset": { "values": { "style": "nova", "fontHeading": "inherit", "menuAccent": "subtle", "menuColor": "default" } }
```

The same output lists 15 components: `dropdown-menu`, `sonner`, `spinner`, `empty`, `tooltip`, `alert`, `input`, `avatar`, `item`, `button`, `separator`, `card`, `sheet`, `sidebar`, `skeleton`.

The registry item `https://ui.shadcn.com/r/styles/base-nova/button.json` has these keys: `$schema`, `name`, `dependencies`, `files`, `meta`, `type`. It has no `version` field. The registry is therefore unversioned. The CLI version is the anchor.

### Comparison method

1. Read every installed file under `packages/ui/src/components`, `packages/ui/src/hooks`, and `packages/ui/src/lib`.
2. Ran `bunx --bun shadcn@4.23.0 add <name> --view src/components/<file>.tsx -y` for each of the 15 components.
3. Applied the two post-steps to the view output: `from "cn"` to `from "#lib/utils"`, and removed `"use client"`.
4. Ran `oxfmt` with `.oxfmtrc.json`, then `diff -u` against the installed file.
5. Ran `add <name> --diff src/components/<file>.tsx` for each component. The diff shows formatting, import order, the `cn` import, `"use client"` for sidebar, and the Sonner block. It does not show a new subcomponent or a prop change.
6. Repeated the full batch in `/tmp/opencode/uitest2` with a real `bun install`. This confirms what `add` writes.

The 13 matching component files produced an empty diff. `sidebar.tsx` differs only in comments. `sonner.tsx` differs in code. The `use-mobile` hook is an extra file that `sidebar` pulls; it differs in code.

### Local edits that the overwrite would lose

**Sidebar comments.** The installed file has Simplified Technical English comments at `packages/ui/src/components/sidebar.tsx:60-61`, `:73`, `:79`, `:84`, `:97-98`, and `:202`. The registry text differs. The code is identical.

**Sonner theme.** The installed file sets `theme="system"` at `packages/ui/src/components/sonner.tsx:12`. The registry content imports `useTheme` from `next-themes` and passes `theme={theme as ToasterProps["theme"]}`. The registry `dependencies` are `["sonner","next-themes"]` at `https://ui.shadcn.com/r/styles/base-nova/sonner.json`.

**`use-mobile` hook.** The installed file uses `React.useSyncExternalStore` at `packages/ui/src/hooks/use-mobile.ts:6-20` and exports at the bottom. The registry content uses `React.useState` + `React.useEffect` and exports inline `export function useIsMobile()`. The installed version supplies `getServerSnapshot` and avoids the initial effect. The registry version initializes from the effect.

### What `shadcn add` writes

The temp batch command:

```bash
bunx --bun shadcn@4.23.0 add alert avatar button card dropdown-menu empty input item separator sheet sidebar skeleton sonner spinner tooltip --overwrite -y
```

Result in `/tmp/opencode/uitest2/packages/ui`:

- `src/components/sidebar.tsx` starts with `"use client"`.
- `src/components/sidebar.tsx` imports `{ cn } from "cn"`.
- `src/hooks/use-mobile.ts` is the `useState` + `useEffect` version.
- `src/components/sheet.tsx`, `src/components/sidebar.tsx`, `src/components/spinner.tsx`, and `src/components/sonner.tsx` contain lucide imports. They do not contain `IconPlaceholder`.
- `package.json` gains `"cn": "^0.5.2"` and `"next-themes": "^0.4.6"`.
- `src/styles/globals.css` is unchanged.
- `components.json` is unchanged.

The dry-run in the repository reports:

```
├ Files (16) ~16 overwrite
│ ~ src/components/alert.tsx          overwrite
...
│ ~ src/hooks/use-mobile.ts           overwrite
├ Dependencies (3)
│ + cn
│ + sonner
│ + next-themes
```

### `cn` and `next-themes`

`https://registry.npmjs.org/cn/latest` returns:

```
"version": "0.5.2",
"description": "Fast, small, compiled class-name merging for Tailwind CSS. Drop-in replacement for clsx + tailwind-merge.",
"repository": { "url": "git+https://github.com/shadcn-ui/cn.git", "type": "git", "directory": "packages/cn" }
```

`https://registry.npmjs.org/cn` gives the publish time of `0.5.2` as `2026-11-02T08:02:09.226Z`. The repository age gate is 3 days at `bunfig.toml:6`. The version is 7 days old at the audit date and passes.

`https://registry.npmjs.org/next-themes` gives the publish time of `0.4.6` as `2025-03-11T21:02:05.882Z`. The repository does not depend on it. `packages/ui/package.json:24-32` has no `cn` and no `next-themes`.

### `cn-*` classes

Raw registry JSON contains transform placeholders:

- `https://ui.shadcn.com/r/styles/base-nova/card.json` has `cn-font-heading` in `CardTitle`.
- `https://ui.shadcn.com/r/styles/base-nova/empty.json` has `cn-font-heading` in `EmptyTitle`.
- `https://ui.shadcn.com/r/styles/base-nova/dropdown-menu.json` has `cn-menu-target cn-menu-translucent` in the content classes.

The CLI transforms these classes with the preset. `info --json` reports `fontHeading: "inherit"`, `menuColor: "default"`, and `menuAccent: "subtle"`. The `--view` output has no `cn-font-heading` and no `cn-menu-*`. The output matches the installed files. Follow the CLI output, because `add` writes that output.

`shadcn@4.21.3` and `shadcn@4.23.0` `dist/tailwind.css` are identical: 637 lines, no `cn-font-heading`, `cn-menu-target`, or `cn-menu-translucent` rule. The classes are transform markers, not CSS rules in the package. Sources: `https://unpkg.com/shadcn@4.21.3/dist/tailwind.css` and `https://unpkg.com/shadcn@4.23.0/dist/tailwind.css`.

### Base UI 1.9

The `@base-ui/react` versions:

- `packages/ui/package.json:25` pins `1.8.0`.
- `https://registry.npmjs.org/@base-ui%2Freact` lists `1.9.0` as `latest`.

The package export map is the same in `1.8.0` and `1.9.0`. Both include `./avatar`, `./button`, `./dialog`, `./input`, `./menu`, `./merge-props`, `./separator`, `./toast`, `./tooltip`, and `./use-render`. Sources: `https://registry.npmjs.org/@base-ui/react/-/react-1.8.0.tgz` and `https://registry.npmjs.org/@base-ui/react/-/react-1.9.0.tgz`.

The public type files:

- `button/Button.d.ts` is identical.
- `tooltip/popup/TooltipPopup.d.ts` is identical.
- `menu/positioner/MenuPositioner.d.ts`, `dialog/popup/DialogPopup.d.ts`, `avatar/root/AvatarRoot.d.ts`, and `input/Input.d.ts` change only `import` to `import type`.

`tooltip/provider/TooltipProvider.d.ts` still declares `delay?: number | undefined`. `toast/index.d.ts` exports `createToastManager` in both versions. The 1.9.0 release notes at `https://github.com/mui/base-ui/releases/tag/v1.9.0` list fixes and one preview Menu filtering feature. They do not list a breaking change for these primitives.

### shadcn 4.22 and 4.23 release notes

- `shadcn@4.22.0` upgrades to Zod 4. This affects programmatic imports of `shadcn/schema` and `@shadcn/registry/schema`. The repository uses the CLI through `packages/ui/package.json:19` and `:40`, not those schemas.
- `shadcn@4.22.1` fixes `shadcn add --all` and the component picker for style filtering.
- `shadcn@4.22.2` updates `undici`.
- `shadcn@4.23.0` upgrades the MCP server to MCP TypeScript SDK v2.

None of these releases lists a component file change. The installed files match the current registry output. Source: `https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.22.0`, `https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.22.1`, `https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.22.2`, `https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.23.0`.

### App usage

- `apps/web/src/routes/app/notes.tsx:76-83` uses `<Spinner data-icon="inline-start" />` inside a disabled `Button` while the mutation is pending.
- `apps/web/src/routes/app/notes.tsx:92-101` uses `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, and `EmptyDescription`.
- `apps/web/src/components/error-surface.tsx:23-36` uses the same `Empty` family plus `EmptyContent`.
- `apps/web/src/components/not-found-surface.tsx:15-28` uses the same `Empty` family plus `EmptyContent`.
- `apps/web/src/components/app-shell.tsx:3-29` imports `Avatar`, `DropdownMenu`, `Separator`, `Sidebar`, and `Spinner`.
- `apps/web/src/components/toaster.tsx:1-30` lazy-loads the Sonner `Toaster`.
- `apps/web/src/routes/__root.tsx:30` renders `<Toaster />`.

No app file imports `Field`, `InputGroup`, or `toast`. A grep of `apps/web/src` and `packages/ui/src` returns no matches.

### Docs redirect

```
$ curl -sSIL https://ui.shadcn.com/docs/components/base/sonner
HTTP/2 308
location: /docs/components/base/toast
HTTP/2 200
```

`bunx --bun shadcn@latest docs sonner` still prints the sonner URL. The URL redirects. The registry item still exists. This is the conflict in [Conflicts](#conflicts).

## Conflicts

1. **Raw registry JSON versus CLI output.** The raw `card`, `empty`, and `dropdown-menu` JSON contains `cn-*` placeholders. The CLI output removes them for this preset.
   - Follow the CLI output. `shadcn add` writes the transformed content, not the raw JSON. The `--view` output matches the installed files.
   - Do not copy the raw JSON by hand.

2. **Sonner docs versus the Sonner registry item.** The docs URL redirects to Toast. The registry still ships `sonner` with `next-themes`.
   - Follow `AGENTS.md:316-318` for this update. Keep the local `theme="system"` file.
   - The reason is the OS theme decision. The app has no `next-themes` provider, so the hook would always fall back to `system`. The local file already sets `system`. The dependency adds no value.
   - If the maintainer wants the documented direction, migrate to `toast` in a separate change.

3. **`cn` description in `AGENTS.md`.** `AGENTS.md:307-309` calls `cn` "the unrelated npm package `cn`". The npm manifest says it is `shadcn-ui/cn`, a Tailwind class merger.
   - Follow `AGENTS.md` for the action: use `#lib/utils` and remove the dependency.
   - The reason is that the repository already has its own `cn` at `packages/ui/src/lib/utils.ts:6`. The package would duplicate it.
   - Update the wording in `AGENTS.md` to "the `cn` package" when the maintainer next edits the file.

4. **Version in `AGENTS.md`.** `AGENTS.md:307` says "shadcn 4.21.0". `packages/ui/package.json:40` pins `4.21.3`. The current CLI is `4.23.0`.
   - Follow the current CLI and `package.json` for facts.
   - Update the `AGENTS.md` number to `4.23.0`. The `cn` and `"use client"` post-steps still apply.

5. **`menuColor` and `menuAccent` config.** `components.json` does not set them. `info --json` shows `null` in `config`, but `preset.values` shows `menuColor: "default"` and `menuAccent: "subtle"`.
   - Follow the preset values. The CLI output has no `cn-menu-*` classes.
   - Optional: add `"menuColor": "default"` and `"menuAccent": "subtle"` to `components.json` so a future CLI default cannot change the output. The schema allows both fields at `https://ui.shadcn.com/schema.json`. A test with these fields produced the same `--view` output.

6. **`shadcn docs sonner` versus the redirect.** The CLI prints `https://ui.shadcn.com/docs/components/base/sonner`. That URL returns 308 to `/docs/components/base/toast`.
   - Follow the redirect for documentation.
   - Keep the registry `sonner` file for the installed component until the maintainer chooses Toast.

## Not found

- **No `version` field in the registry items.** Checked the keys of `https://ui.shadcn.com/r/styles/base-nova/button.json`: `$schema`, `name`, `dependencies`, `files`, `meta`, `type`.
- **No component-level changelog for 4.22 or 4.23.** Checked the GitHub release bodies. They cover Zod 4, `--all`, `undici`, and the MCP SDK. They do not cover component files.
- **No `cn` dependency in the repository.** Checked `packages/ui/package.json:24-32`.
- **No `next-themes` dependency in the repository.** Checked `packages/ui/package.json:24-32`.
- **No `Field`, `InputGroup`, or `toast` file or import.** Checked the 15 files in `packages/ui/src/components` and a grep of `apps/web/src` and `packages/ui/src`.
- **No `cn-toast` CSS rule.** Checked `packages/ui/src/styles/globals.css` and `shadcn@4.21.3`/`4.23.0` `dist/tailwind.css`. The class appears only at `packages/ui/src/components/sonner.tsx:31`.
- **No `node_modules` in the worktree.** `ls node_modules` returns "No such file or directory". This blocks a repository typecheck and build.
- **No `TooltipProvider` in app code.** A grep finds only the definition at `packages/ui/src/components/tooltip.tsx:5`.
- **No `toast()` calls in app code.** A grep finds only the `Toaster` import at `apps/web/src/components/toaster.tsx:1` and the render at `apps/web/src/routes/__root.tsx:30`.

## Not verified

These items need an install or a build in the repository:

- **TypeScript check with `@base-ui/react` 1.9.0.** The temp workspace used 1.8.0. The `.d.ts` comparison covers the public prop types, but `tsc` did not run against 1.9.0.
- **Repository `bun install` and lockfile resolution.** The temp workspace used stub `@acme/oxlint-config` and `@acme/typescript-config` packages. The real workspace resolution is untested.
- **Repository build.** No `node_modules`. `bun run --filter @acme/web build` did not run.
- **Tailwind scan.** The `@source` list and the new classes need a build to confirm the CSS output.
- **Runtime rendering.** No dev server ran. The Base UI 1.9 behavior is from the release notes and the type files only.
- **`bun run check`.** Format, lint, and typecheck did not run in the repository.
- **The `next-themes` path.** The app has no provider. The behavior of `useTheme` without a provider was not run.
- **The `toast` migration.** The `toast` component was fetched, not installed. Its runtime behavior and SSR boundary were not tested.

## References

### Repository files

- `AGENTS.md:250-255` — commands that can reach 1Password.
- `AGENTS.md:301-321` — UI component rules, post-steps, theming, `@source`.
- `bunfig.toml:6` — 3-day minimum release age.
- `packages/ui/components.json:3` — style `base-nova`.
- `packages/ui/components.json:13` — icon library `lucide`.
- `packages/ui/components.json:14-20` — aliases.
- `packages/ui/package.json:25` — `@base-ui/react` `1.8.0`.
- `packages/ui/package.json:29` — `sonner` `2.0.8`.
- `packages/ui/package.json:40` — `shadcn` `4.21.3`.
- `packages/ui/src/styles/globals.css:3` — `@import "shadcn/tailwind.css"`.
- `packages/ui/src/styles/globals.css:12` — the `@source` component list.
- `packages/ui/src/lib/utils.ts:6` — the local `cn`.
- `packages/ui/src/hooks/use-mobile.ts:6-20` — the local `useSyncExternalStore`.
- `packages/ui/src/components/sidebar.tsx:60-61`, `:73`, `:79`, `:84`, `:97-98`, `:202` — local comments.
- `packages/ui/src/components/sonner.tsx:10-12` — `theme="system"`.
- `apps/web/src/routes/app/notes.tsx:76-83` — Button loading pattern.
- `apps/web/src/routes/app/notes.tsx:92-101` — Empty usage.
- `apps/web/src/components/error-surface.tsx:23-36` — Empty usage.
- `apps/web/src/components/not-found-surface.tsx:15-28` — Empty usage.
- `apps/web/src/components/toaster.tsx:1-30` — lazy Sonner loader.
- `apps/web/src/routes/__root.tsx:30` — `<Toaster />`.

### shadcn registry and docs

- `https://ui.shadcn.com/r/styles/base-nova/alert.json`
- `https://ui.shadcn.com/r/styles/base-nova/avatar.json`
- `https://ui.shadcn.com/r/styles/base-nova/button.json`
- `https://ui.shadcn.com/r/styles/base-nova/card.json`
- `https://ui.shadcn.com/r/styles/base-nova/dropdown-menu.json`
- `https://ui.shadcn.com/r/styles/base-nova/empty.json`
- `https://ui.shadcn.com/r/styles/base-nova/input.json`
- `https://ui.shadcn.com/r/styles/base-nova/item.json`
- `https://ui.shadcn.com/r/styles/base-nova/separator.json`
- `https://ui.shadcn.com/r/styles/base-nova/sheet.json`
- `https://ui.shadcn.com/r/styles/base-nova/sidebar.json`
- `https://ui.shadcn.com/r/styles/base-nova/skeleton.json`
- `https://ui.shadcn.com/r/styles/base-nova/sonner.json`
- `https://ui.shadcn.com/r/styles/base-nova/spinner.json`
- `https://ui.shadcn.com/r/styles/base-nova/tooltip.json`
- `https://ui.shadcn.com/r/styles/base-nova/toast.json`
- `https://ui.shadcn.com/r/styles/base-nova/field.json`
- `https://ui.shadcn.com/r/styles/base-nova/input-group.json`
- `https://ui.shadcn.com/docs/components/base/button`
- `https://ui.shadcn.com/docs/components/base/empty`
- `https://ui.shadcn.com/docs/components/base/field`
- `https://ui.shadcn.com/docs/components/base/input-group`
- `https://ui.shadcn.com/docs/components/base/sonner` (308 to Toast)
- `https://ui.shadcn.com/docs/components/base/toast`
- `https://ui.shadcn.com/docs/components/base/tooltip`
- `https://ui.shadcn.com/schema.json`

### Releases and manifests

- `https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.22.0`
- `https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.22.1`
- `https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.22.2`
- `https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.23.0`
- `https://github.com/mui/base-ui/releases/tag/v1.9.0`
- `https://registry.npmjs.org/shadcn/latest`
- `https://registry.npmjs.org/@base-ui%2Freact`
- `https://registry.npmjs.org/cn/latest`
- `https://registry.npmjs.org/next-themes`
