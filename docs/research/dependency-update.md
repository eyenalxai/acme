# Dependency update research

- Date: 2026-10-09. All registry checks ran at 07:40 UTC (2026-10-09T07:40:19Z).
- Checkout: `/home/ulezot/.local/share/opencode/worktree/5a75f6/update-deps`, HEAD `b743175` (`b195a86` plus one docs commit).
- Policy: `bunfig.toml` sets `minimumReleaseAge = 259200` (3 days). The `better-auth` family is listed in `minimumReleaseAgeExcludes`.
- Method: the candidate list from the task brief was checked against the registry manifests and the `time` field of the packuments on `registry.npmjs.org`, the published tarballs, the release notes and changelogs of each project, and the local clones in `/home/ulezot/Projects/other/`. No install or update command ran.
- Citation form: `registry:<pkg>@<v>` is `https://registry.npmjs.org/<pkg>/<v>` (for scoped names, `%2F` replaces `/`). `time:<pkg>` is the `time` map of `https://registry.npmjs.org/<pkg>`. The abbreviated packument supplied the dependency and peer-dependency data.
- Age rule: a version passes when `now - publish time >= 259200 s`. At the research time the cutoff is `2026-10-06T07:40:19Z`. A version published before that instant is age-eligible.

## Summary of the moves

| Workspace | Package | Move | Target published (UTC) | Risk | Main evidence |
| --- | --- | --- | --- | --- | --- |
| root | `@types/node` | 26.6.3 → 26.6.4 | 2026-10-01 22:39 | Low | [DT commit 57ddf7c0](https://github.com/DefinitelyTyped/DefinitelyTyped/commit/57ddf7c0) adds one optional property. No manifest change. |
| root | `oxfmt` | 0.70.0 → 0.72.0 | 2026-10-05 11:03 | Low, markdown only | [oxfmt v0.72.0 release](https://github.com/oxc-project/oxc/releases/tag/oxfmt_v0.72.0) has one breaking entry: markdown files now use the oxc markdown formatter. |
| root | `oxlint` | 1.85.0 → 1.87.0 | 2026-10-05 11:05 | Low–medium | [oxlint v1.86.0](https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.86.0) adds one rule. The repo turns every rule category into an error. |
| root | `oxlint-plugin-react-doctor` | 0.9.14 → 0.9.17 | 2026-10-05 05:05 | Low | [react-doctor releases](https://github.com/millionco/react-doctor/releases): rule fixes only; version 0.9.15 does not exist. |
| root | `turbo` | 2.11.4 → 2.11.7 | 2026-10-02 14:58 | Low | [v2.11.5–v2.11.7 releases](https://github.com/vercel/turborepo/releases): fixes and additive features. One task-hash normalization change. |
| root | `varlock` | 1.21.0 → 1.21.1 | 2026-09-29 06:35 | Low | [varlock 1.21.1 changelog](https://github.com/dmno-dev/varlock/blob/main/packages/varlock/CHANGELOG.md): patches only, one stricter parse. |
| apps/web | `@tanstack/react-query` | 5.104.0 → 5.104.1 | 2026-10-02 10:04 | Low | [react-query changelog](https://github.com/TanStack/query/blob/main/packages/react-query/CHANGELOG.md): only the `query-core` dependency moves. |
| packages/api | `@tanstack/query-core` | 5.104.0 → 5.104.1 | 2026-10-02 10:05 | Low | [query-core changelog](https://github.com/TanStack/query/blob/main/packages/query-core/CHANGELOG.md): "No changes in this release." |
| apps/web | `@tanstack/react-router` | 1.170.39 → 1.170.41 | 2026-09-30 17:48 | Low–medium | [react-router changelog](https://github.com/TanStack/router/blob/main/packages/react-router/CHANGELOG.md): patch fixes touch route boundary rendering and the root match context. |
| apps/web | `@tanstack/react-start` | 1.168.58 → 1.168.60 | 2026-09-30 17:48 | Low | [react-start changelog](https://github.com/TanStack/router/blob/main/packages/react-start/CHANGELOG.md): dependency updates only. It requires `@tanstack/react-router@1.170.41` (matched). |
| apps/web | `@tanstack/router-cli` | 1.167.38 → 1.167.40 | 2026-09-30 17:48 | Low | [router-cli changelog](https://github.com/TanStack/router/blob/main/packages/router-cli/CHANGELOG.md): `router-generator` bump only. |
| apps/web, packages/auth | `better-auth` | 1.7.6 → 1.7.7 | 2026-09-30 21:30 | Medium | [better-auth 1.7.7 changelog](https://github.com/better-auth/better-auth/blob/main/packages/better-auth/CHANGELOG.md) documents two upgrade-sensitive state changes. |
| packages/auth | `@better-auth/drizzle-adapter` | 1.7.6 → 1.7.7 | 2026-09-30 21:32 | Low | [adapter changelog](https://github.com/better-auth/better-auth/blob/main/packages/drizzle-adapter/CHANGELOG.md): one concurrency fix. Peer `@better-auth/core` moves to `^1.7.7`. |
| packages/auth | `auth` (CLI) | 1.7.6 → 1.7.7 | 2026-09-30 21:32 | Low | [auth CLI changelog](https://github.com/better-auth/better-auth/blob/main/packages/cli/CHANGELOG.md): dependent version bumps only. |
| apps/web, packages/ui | `lucide-react` | 1.48.0 → 1.52.0 | 2026-10-04 08:17 | Low | [lucide 1.49.0–1.52.0 releases](https://github.com/lucide-icons/lucide/releases/tag/1.52.0): no icon removal or rename. All used icons exist in 1.52.0. |
| apps/web | `@vitejs/plugin-react` | 6.1.1 → 6.1.2 | 2026-10-05 10:08 | Low | [plugin-react changelog](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/CHANGELOG.md): HMR and compiler-diagnostic fixes. Peer `oxc-transform-react` moves to `^0.152.0` (target 0.153.0 satisfies it). |
| apps/web | `oxc-transform-react` | 0.151.0 → 0.153.0 | 2026-10-05 10:35 | Low | [napi/transform-react changelog](https://github.com/oxc-project/oxc/blob/main/napi/transform-react/CHANGELOG.md) and [crates v0.153.0 release](https://github.com/oxc-project/oxc/releases/tag/crates_v0.153.0): no package-specific entries for 0.153.0. |
| apps/web | `portless` | 0.15.6 → 0.15.7 | 2026-10-02 06:15 | Low | [portless changelog](https://github.com/vercel-labs/portless/blob/main/CHANGELOG.md): fixes and small features; one node-resolution change. |
| apps/web, packages/ui | `vite` | 8.3.1 → 8.3.2 | 2026-10-01 10:17 | Low | [vite changelog](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md): bug fixes only; `rolldown` moves `~1.2.9` → `~1.2.11`. |
| packages/api | `@orpc/client`, `@orpc/contract`, `@orpc/experimental-effect`, `@orpc/server`, `@orpc/tanstack-query` | 2.0.0-beta.40 → 2.0.0-beta.42 | 2026-10-04 08:26–08:28 | Medium–high for `experimental-effect`; medium for the rest | [registry:@orpc/experimental-effect@2.0.0-beta.42](https://registry.npmjs.org/@orpc%2Fexperimental-effect/2.0.0-beta.42): peer range `effect` `>=4.0.0` excludes the pinned `4.0.0-rc.115`. |
| packages/db | `pg` | 8.23.0 → 8.23.1 | 2026-09-30 15:39 | Low | [pg changelog](https://github.com/brianc/node-postgres/blob/master/CHANGELOG.md) has no 8.23.1 entry ("break-fix" releases are omitted); dependency patch bumps only. |
| packages/ui | `shadcn` | 4.21.0 → 4.21.1 | 2026-10-01 10:32 | Low | [shadcn@4.21.1 release](https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.21.1): registry engine extraction, "no changes for existing users". |

## Per-package notes

### @orpc (five packages), beta.40 → beta.42

- **Version history.** `beta.40` → `beta.41` → `beta.42`. Release commits in `unnoq/orpc`: `b3837183` (beta.40, 2026-09-23), `cb7715a9` (beta.41, 2026-10-01), `95dcbbff` (beta.42, 2026-10-04). Source: GitHub commits API for `unnoq/orpc`.
- **The repository has no changelog file, no tags, and no GitHub releases on 2026-10-09.** The `main` tree is complete and not truncated (1450 entries), and it holds no path that matches `changelog`. The releases list is empty. The notes below come from the release commit history.
- **beta.40 → beta.42 contains 90 commits.** Two carry breaking marks (`!`), and both are outside the packages this repo uses: `feat(ratelimit, lock)!: drop Redis cluster client support (#2075)` and `fix(publisher, bun)!: keep Redis Pub/Sub delivery in stream order (#2073)`.
- **beta.41 → beta.42 contains 7 commits.** The notable entries:
  - `fix(openapi): improve OpenAPI path matching with rou3 v1 (#2173)`
  - `fix: upgrade @standard-server packages to 0.10.1 (#2174)`
  - `feat(effect): improve JSON Schema converter with caching and options (#2175)`
  - `fix(client): exclude aborted subrequests from batch messages (#2176)`
  - `fix: upgrade @openapi-spec packages to v0.3.0 (#2178)`
- **Manifest changes.** `registry:@orpc/experimental-effect@2.0.0-beta.42` declares `peerDependencies.effect = ">=4.0.0"`. Version beta.40 declared `>=4.0.0-beta.90`. The change landed in beta.41. `Bun.semver.satisfies("4.0.0-rc.115", ">=4.0.0")` returns `false`. The pinned Effect version therefore does not satisfy the declared range of beta.41 and beta.42.
- **`@standard-server/*` moves from `~0.9.2` to `~0.10.1`** in `@orpc/server`, `@orpc/client`, and `@orpc/contract`. The upgrade commit uses the `fix:` prefix, not `!`.
- **The Effect import surface is unchanged in shape.** Both beta.40 and beta.42 bundles import `{ Effect, Schema, Function, Context } from 'effect'` (16 occurrences each, from the published tarballs). beta.42 adds calls to `Schema.toJsonSchemaDocument`, `Schema.ToJsonSchemaOptions`, and `Schema.toType` for the new JSON Schema converter. All three names exist in `effect@4.0.0-rc.115` (`dist/Schema.d.ts` of the rc.115 tarball). The declared incompatibility and the code-level API presence therefore disagree.
- **No install ran**, so the resolution outcome (peer warning, a second nested `effect@4.0.x` copy, or a hard error) is unverified. See the open questions.

### better-auth trio, 1.7.6 → 1.7.7

- **`better-auth@1.7.7`** (published 2026-09-30 21:30) contains six patch entries. Two entries describe upgrade-sensitive state:
  - OAuth state cookies and OAuth Proxy payloads now use purpose-specific encryption keys. The changelog says: "Upgrade all Better Auth nodes that handle the same cookie-backed OAuth or SAML relay-state flow together", "OAuth sign-in, account-linking, and cookie-backed SAML sign-in flows started before the upgrade must be restarted", and "there is no fallback to the previous shared key."
  - Magic Link verification accepts only records with a new `magic-link:` prefix, and database-backed OAuth/SAML state uses an `auth-state:` prefix. The changelog says: "Links and database-backed sign-ins started before the upgrade cannot complete", and asks for an update of `verification.storeIdentifier.overrides` rules "for these flows".
- The same changelog list also covers CAPTCHA and rate-limit `Content-Type` fixes, `disableSignUp` handling for ID-token sign-in, and an active-organization refresh.
- **`@better-auth/drizzle-adapter@1.7.7`** changes `incrementOne`: it rejects an update when a concurrent write makes the original `where` condition false. The peer range moves to `@better-auth/core: ^1.7.6 → ^1.7.7`.
- **`auth@1.7.7` (CLI)** only moves its `better-auth`, `@better-auth/core`, and `@better-auth/telemetry` dependencies.
- **Repo usage.** `packages/auth/src/server.ts:24` configures `socialProviders` (GitHub). A grep of `packages/auth` finds no `storeIdentifier`, `oAuthProxy`, or `magicLink` configuration. No changelog entry mentions a schema change, so `packages/db/src/schema/auth.generated.ts` has no listed reason to change.
- Source: [better-auth CHANGELOG](https://github.com/better-auth/better-auth/blob/main/packages/better-auth/CHANGELOG.md), [drizzle-adapter CHANGELOG](https://github.com/better-auth/better-auth/blob/main/packages/drizzle-adapter/CHANGELOG.md), [CLI CHANGELOG](https://github.com/better-auth/better-auth/blob/main/packages/cli/CHANGELOG.md).

### shadcn, 4.21.0 → 4.21.1

- **The two documented post-steps remain necessary.** The [shadcn@4.21.0 release note](https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.21.0) says: "install `cn` and generate `export { cn } from 'cn'` for `lib/utils` on init. Registry components now import `cn` from the `cn` package." That note matches the `AGENTS.md` warning.
- **4.21.1 does not revert that behavior.** The [shadcn@4.21.1 release note](https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.21.1) lists the `@shadcn/registry` extraction, a shimmer reduced-motion fix, and a docs-link fix. It says there are "no changes for existing users".
- **Published-code check.** The 4.21.0 tarball holds one `use client` string in `dist/`. The 4.21.1 tarball holds zero in its own `dist/`, but its new dependency `@shadcn/registry@0.1.0` holds one. The directive logic moved into the registry package; it did not disappear.
- **Compare API check.** `shadcn@4.21.0...shadcn@4.21.1` has 44 commits. `packages/registry/src/preset/preset.ts` appears as a pure rename with `+0/-0`, so the preset logic is unchanged.
- **Manifest.** 4.21.1 adds `@shadcn/registry` `0.1.0` as a dependency, and bumps `undici`, `postcss`, and `postcss-selector-parser`. `engines.node` stays `>=20.18.1`.

### oxc tools: oxlint 1.87.0, oxfmt 0.72.0, oxc-transform-react 0.153.0

- **oxlint 1.86.0 adds `typescript/no-generated-empty-object-type`.** The rule lives at `crates/oxc_linter/src/rules/typescript/no_generated_empty_object_type.rs` in the local clone. Its category is `suspicious` (line 46), and it is type-aware (`tsgolint`). The repo sets `correctness`, `suspicious`, `perf`, `pedantic`, `style`, and `restriction` to `error` (`packages/oxlint-config/src/base-config.ts:12-19`) and runs `oxlint --type-aware` in every workspace. A new rule in this set can produce new errors.
- **oxlint 1.87.0 adds no new rule.** Its features are suggestions (fixers) for `react/no-unescaped-entities`, `unicorn/no-useless-switch-case`, and `react/jsx-no-target-blank`. It also fixes several rules. 1.86.0 moves `node/no-exports-assign` from `style` to `suspicious`; both categories are errors here.
- **The `oxlint` peer on `oxlint-tsgolint` moves to `>=7.0.2003`.** The repo pins `oxlint-tsgolint` `7.0.2003`, so the peer is satisfied. Node engine stays `^20.19.0 || >=22.12.0`.
- **oxfmt 0.72.0 has one breaking entry**: "Format `parser:markdown` files by `oxc_formatter_markdown`". [PR #27256](https://github.com/oxc-project/oxc/pull/27256) states: "Now oxfmt formats Markdown files natively with `oxc_formatter_markdown`", "Basically the same output with Prettier 3.9.9", and `sortImports`/`sortTailwindcss` now work in markdown code fences. The change is limited to Markdown files. The checkout holds no `.md` file under `apps/**` or `packages/**` (git ls-files), and the root Markdown files are not covered by the workspace `format` tasks.
- **oxc-transform-react 0.153.0 has no package-specific release entry.** The 0.152.0 changelog entry adds the `reportDiagnostics` option. The 0.151.0 → 0.153.0 move matches the new `@vitejs/plugin-react` peer, `^0.152.0`.
- Sources: [oxlint v1.86.0](https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.86.0), [oxlint v1.87.0](https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.87.0), [oxfmt v0.72.0](https://github.com/oxc-project/oxc/releases/tag/oxfmt_v0.72.0), [crates v0.153.0](https://github.com/oxc-project/oxc/releases/tag/crates_v0.153.0).

### @vitejs/plugin-react 6.1.2 with vite 8.3.2

- **vite 8.3.2** carries bug fixes only. The `rolldown` dependency moves from `~1.2.9` to `~1.2.11`. `engines.node` stays `^20.19.0 || >=22.12.0`, and every peer entry is unchanged and optional.
- **plugin-react 6.1.2** fixes HMR for compound components, fixes `compiler.logDiagnostics` with `oxc-transform-react >= 0.148`, and disables refresh for non-JSX files when the compiler is on. The changelog deprecates `compiler.logDiagnostics` in favor of `compiler.reportDiagnostics` and says the plugin "requires `oxc-transform-react` >= 0.152 as a peer dependency if you are using the `compiler` option".
- The repo uses `viteReact({ compiler: true })` (`apps/web/vite.config.ts:22`). It does not set `logDiagnostics`.

### TanStack patch bumps

- `@tanstack/react-query@5.104.1` only bumps `@tanstack/query-core` to `5.104.1`. `query-core@5.104.1` says "No changes in this release." Peer and engine fields are unchanged.
- `react-router@1.170.40` fixes Link preload cleanup. `react-router@1.170.41` composes only enabled route boundaries, consolidates the root match context provider, and reuses Link href classification. Dependency moves: `@tanstack/react-store ^0.11.0 → ^0.11.2`, `router-core 1.171.32 → 1.171.34`. Peers and engines are unchanged.
- `react-start@1.168.60` bumps internal `@tanstack/*` packages only. Its `@tanstack/react-router` dependency is exactly `1.170.41`, so the pair must move together (the task brief does that).
- `router-cli@1.167.40` bumps `@tanstack/router-generator` only.
- Sources: [react-query CHANGELOG](https://github.com/TanStack/query/blob/main/packages/react-query/CHANGELOG.md), [query-core CHANGELOG](https://github.com/TanStack/query/blob/main/packages/query-core/CHANGELOG.md), [react-router CHANGELOG](https://github.com/TanStack/router/blob/main/packages/react-router/CHANGELOG.md), [react-start CHANGELOG](https://github.com/TanStack/router/blob/main/packages/react-start/CHANGELOG.md), [router-cli CHANGELOG](https://github.com/TanStack/router/blob/main/packages/router-cli/CHANGELOG.md).

### turbo, varlock, lucide-react, pg, portless, @types/node

- **turbo 2.11.5–2.11.7.** 2.11.5: security fixes (`js-yaml` CVE-2026-84375 and Next.js CVEs in examples), bundled docs, remote-artifact back-off, pnpm lockfile-hash fix. 2.11.6: task tags with inheritance, `query` tag filters, and a change that normalizes task inputs for affected detection and hashing. 2.11.7: SDKROOT pass-through and a fix that ignores Vercel OIDC token rotation in `.env.local` cache inputs. No breaking entries. Source: [v2.11.5](https://github.com/vercel/turborepo/releases/tag/v2.11.5), [v2.11.6](https://github.com/vercel/turborepo/releases/tag/v2.11.6), [v2.11.7](https://github.com/vercel/turborepo/releases/tag/v2.11.7).
- **varlock 1.21.1.** The changelog lists: an unquoted config item that looks like a function call now errors instead of using the literal text; the CLI runs with Bun when auto-load or an integration runs from a Bun process; and a Windows path fix. Engine ranges stay `bun >=1.3.3`, `node >=22.3.0`. Source: [varlock CHANGELOG](https://github.com/dmno-dev/varlock/blob/main/packages/varlock/CHANGELOG.md).
- **lucide-react 1.49.0–1.52.0.** Release notes mention no removed or renamed icon. 1.49.0 adds `@types/react` as an **optional** peer (`peerDependenciesMeta` confirms `optional: true`). 1.50.0 replaced the `nut` and `nut-off` drawings, 1.51.0 added icons, and 1.52.0 changed only `wifi-cog`. A check of `lucide-react@1.52.0/dist/lucide-react.d.ts` finds all 19 icons the repo imports (`PanelLeftIcon`, `Loader2Icon`, `XIcon`, `ChevronRightIcon`, `CheckIcon`, `TriangleAlertIcon`, `RotateCcwIcon`, `ChevronsUpDownIcon`, `HouseIcon`, `LogOutIcon`, `StickyNoteIcon`, `CompassIcon`, `ArrowLeftIcon`, `PlusIcon`, `Trash2Icon`, `ArrowRightIcon`, and the sonner set `CircleCheckIcon`, `InfoIcon`, `OctagonXIcon`).
- **pg 8.23.1.** The changelog states: "We do not include break-fix version release in this file." The registry manifest shows patch bumps of `pg-protocol` (`^1.16.1`), `pg-cloudflare` (`^1.4.1`), and `pg-connection-string` (`^2.14.1`). Engines and peers are unchanged.
- **portless 0.15.7.** New: `turbo.jsonc` workspaces, a hosts-sync warning, docs on WebMCP. Fixes: hosts-sync data loss, a macOS CA certificate extension, a proxy crash on backend restart, wildcard fallback order, port collision checks on IPv4 and IPv6 loopback and any-address, and node resolution through the version manager on `PATH`. Source: [portless CHANGELOG](https://github.com/vercel-labs/portless/blob/main/CHANGELOG.md).
- **@types/node 26.6.4.** The registry manifest has no dependency, peer, or engine change. The DefinitelyTyped commit for this release is `57ddf7c0` ("[node] Add pledgedSrcSize to ZstdOptions", 2026-10-01 22:23). The package published 16 minutes later. The change is one additive optional property.

## Held-back versions

These versions are newer than the targets. The task brief marks them as held by policy. The table reports the registry `time` values and the age at 2026-10-09T07:40:19Z. `age >= 259200 s` means the version passes the age gate at the research time.

| Package | Version | Published (UTC) | Age at research time | Passes age gate? | Held by |
| --- | --- | --- | --- | --- | --- |
| `effect` | 4.0.0 | 2026-10-01 03:11 | 8d 04h | Yes | ADR 0001 pin |
| `effect` | 4.0.1 | 2026-10-05 01:15 | 4d 06h | Yes | ADR 0001 pin |
| `effect` | 4.0.2 | 2026-10-07 18:21 | 1d 13h | No | ADR 0001 pin + age |
| `lucide-react` | 1.53.0 | 2026-10-08 06:15 | 1d 01h | No | Age |
| `lucide-react` | 1.54.0 | 2026-10-09 06:18 | 0d 01h | No | Age |
| `vite` | 8.3.3 | 2026-10-06 04:10 | 3d 03h | **Yes** | Brief lists as age-held |
| `vite` | 8.3.4 | 2026-10-08 12:07 | 0d 19h | No | Age |
| `shadcn` | 4.21.2 | 2026-10-05 14:40 | 3d 17h | **Yes** | Brief lists as age-held |
| `shadcn` | 4.21.3 | 2026-10-06 06:19 | 3d 01h | **Yes** | Brief lists as age-held |
| `shadcn` | 4.21.4 | 2026-10-07 11:12 | 1d 20h | No | Age |
| `@orpc/*` | 2.0.0-beta.43 | 2026-10-09 07:25 (`@orpc/server` and `@orpc/experimental-effect`) | 0d 00h | No | Age |

Age-eligible targets near the line:

| Package | Target | Published (UTC) | Age at research time |
| --- | --- | --- | --- |
| `@orpc/*` | 2.0.0-beta.42 | 2026-10-04 08:26–08:28 | 4d 23h |
| `vite` | 8.3.2 | 2026-10-01 10:17 | 7d 21h |
| `lucide-react` | 1.52.0 | 2026-10-04 08:17 | 4d 23h |
| `shadcn` | 4.21.1 | 2026-10-01 10:32 | 7d 21h |

Boundary note: `shadcn@4.21.2` (Oct 5 14:40), `shadcn@4.21.3` (Oct 6 06:19), and `vite@8.3.3` (Oct 6 04:10) pass the 3-day rule at the research time, although the task brief lists them as held. The held list matches a snapshot taken on 2026-10-08. `effect@4.0.0` and `effect@4.0.1` also pass the age rule, but the ADR pin holds them.

## The pinned pair still stands

- **Drizzle `1.0.0-rc.5-5935859` is still the newest `rc5` build, and no `1.0.0-rc.6+` exists.** The `rc5` dist-tag points to `1.0.0-rc.5-5935859` (published 2026-09-09 10:25). The full version list holds `rc.1`, `rc.2`, `rc.3`, `rc.4`, and three `rc.5-*` builds; the newest of those is `5935859`. The `latest` tag points to the `0.45.x` line, and the `rc` tag points to `1.0.0-rc.4`. Source: `https://registry.npmjs.org/drizzle-orm` (versions list and `time`), `time:drizzle-orm`.
- **`effect@4.0.0` no longer ships `effect/unstable/sql`.** In `effect@4.0.0-rc.115`, the export map holds `./unstable/sql` and no `./sql`; the file `dist/unstable/sql/SqlError.js` exists. In `effect@4.0.0`, the export map holds `./sql`, holds no `unstable` entry, and the `dist/unstable` directory does not exist. `effect@4.0.0-rc.118` already dropped the unstable entries, in line with ADR 0001.
- **Drizzle rc5 declarations still import the unstable path.** `effect-postgres/session.d.ts` holds `import { SqlError } from "effect/unstable/sql/SqlError";` and `effect-postgres/migrator.d.ts` holds the same in an inline `import(...)` type. At `effect@4.0.0` the wildcard export `./*` maps that specifier to a file that does not exist, so the import is dangling. `effect@4.0.0-rc.115` resolves the file. Source: published files fetched through `cdn.jsdelivr.net/npm/drizzle-orm@1.0.0-rc.5-5935859/effect-postgres/session.d.ts` and the tarballs of the two Effect versions.
- **`drizzle-kit` stays at `1.0.0-rc.4`.** Note for the record: the registry also holds a `rc5` dist-tag for `drizzle-kit` (`1.0.0-rc.5-5935859`). The task brief and ADR 0001 keep the kit at `1.0.0-rc.4`.

## Addendum: resolver test and advisory context (main session, 2026-10-09 ~08:15 UTC)

- **Resolver outcome for the @orpc conflict (answers open question 2).** A sandbox install (`bun install`, Bun 1.4.2, the repo's `bunfig.toml` copied) pinned the five `@orpc/*` packages at `2.0.0-beta.42` with `effect@4.0.0-rc.115`. The install resolved to a single `effect@4.0.0-rc.115` and printed `warn: incorrect peer dependency "effect@4.0.0-rc.115"`. `await import("@orpc/experimental-effect")` under rc.115 loads. So the resolver warns, links, and loads; the declared incompatibility is a warning, not a hard failure. The decision remains a hold: the repo has no test that exercises the effect integration at runtime, and the declared peer range is unsatisfied.
- **Better Auth release framing.** The v1.7.7 GitHub release marks the Magic Link fix as critical (GHSA-965c-763c-88jm). Acme configures GitHub OAuth only (`packages/auth/src/server.ts:24`); it uses no Magic Link or OAuth Proxy plugin. The bump still carries the core `Content-Type` and ID-token fixes.
- **Targets move with the age gate.** The age-eligible target set grows over time (for example `vite@8.3.3` and `shadcn@4.21.2`/`4.21.3` already pass past the research time). Re-read `bun outdated` at apply time; the ticket tables record the targets observed then.
- **The resolver enforces the gate; `bun outdated` lags it.** A sandbox `bun install` with exact pins hard-fails for versions inside the window (`error: No version matching "vite" found for specifier "8.3.4" (blocked by minimum-release-age: 259200 seconds)`) and succeeds for versions past it. At 2026-10-09T07:57Z, `vite@8.3.3` (age 3d 03h 47m), `shadcn@4.21.3` (3d 01h 37m), and `lucide-react@1.52.0` install cleanly, while `bun outdated` still reports the older `8.3.2` / `4.21.1`. The applied targets are therefore `vite@8.3.3` and `shadcn@4.21.3`.

## Open questions / blockers

1. **The oRPC changelog location in the brief does not exist.** The `unnoq/orpc` `main` tree (complete, 1450 entries) has no changelog file, no tags, and no GitHub releases on 2026-10-09. The version notes in this document come from the release commits and the commit history. If a published changelog lives somewhere else, the maintainer should name the location.
2. **`@orpc/experimental-effect` conflicts with the Effect pin on paper.** beta.41 and beta.42 declare `effect >= 4.0.0`; `4.0.0-rc.115` does not satisfy that range. The used Effect APIs exist in rc.115, but no install ran, so the resolver outcome is unknown. The options are a held `@orpc/experimental-effect`, an escalation of the Effect pin (which ADR 0001 blocks while Drizzle rc5 imports `effect/unstable/sql`), or an accepted second Effect copy. The maintainer must choose.
3. **The 3-day boundary and the held list disagree for three versions** (`vite@8.3.3`, `shadcn@4.21.2`, `shadcn@4.21.3`). See the boundary note above. The brief's held list matches a 2026-10-08 snapshot.
4. **The `shadcn` post-steps are verified from published code only.** A real `shadcn add` run is the only direct proof that 4.21.1 still writes `import ... from "cn"` and still emits `"use client"`. No such run was made.
5. **The new `oxlint` rule needs a lint run.** `typescript/no-generated-empty-object-type` is an error in this repo's category map. A grep finds no obvious trigger, but only `bun run lint` after the bump proves the result.
6. **Better Auth 1.7.7 drops in-flight state.** OAuth sign-ins and Magic Link flows that start before the upgrade cannot finish after it (per the 1.7.7 changelog). A deploy plan must accept a restart of active sign-in flows.
