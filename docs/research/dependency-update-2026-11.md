# Dependency update research

Date: 2026-11-09

Status: Proposed. Registry checks ran at 2026-11-09T13:52Z. This file is the only deliverable. No existing repository file changed.

## Answer

Adopt the target set in the workspace tables. Hold TypeScript at `7.0.2`. Hold `@tanstack/react-router-ssr-query` at `1.167.3`; no newer version exists.

The pinned trio has a coherent upgrade now. Use `effect@4.1.2`, `@effect/sql-pg@4.1.2`, `drizzle-orm@1.0.0-rc.5`, `drizzle-kit@1.0.0-rc.5`, and the `@orpc/*` `2.0.0-beta.48` line. Replace `@orpc/experimental-effect` with `@orpc/effect`. The package rename is mandatory.

Bump the Bun pin from `1.4.2` to `1.4.4`. The installed runtime is `1.4.3`. Bun `1.4.4` is the newest stable release.

The age gate holds the newest version of several packages. Section "Held by the age gate" lists each one and its first eligible time.

### Pinned trio verdict

A coherent upgrade exists. Effect `4.1.x` no longer ships `effect/unstable/sql`. Drizzle `1.0.0-rc.5` no longer imports that path. It imports `effect/sql/SqlError` instead. The two libraries therefore align at `effect@4.1.2` and `drizzle-orm@1.0.0-rc.5`.

Do not bump Effect alone. The current Drizzle build still imports `effect/unstable/sql/SqlError` in its declarations. Effect `4.1.2` has no such export. Move `effect`, `@effect/sql-pg`, `drizzle-orm`, and `drizzle-kit` in one commit.

The `@orpc/*` packages have a coherent line at `2.0.0-beta.48`. `@orpc/experimental-effect` stops at `2.0.0-beta.45` and is deprecated. Its replacement is `@orpc/effect`. The replacement package has the same Effect peer range, `effect >=4.0.0`. `effect@4.1.2` satisfies that range. A local module-load test loaded `@orpc/effect/extensions/schema` under `effect@4.1.2`.

### Order of operations

1. Create a new ADR that supersedes ADR 0001. Record the new pair and the runtime load check.
2. In one commit, set `effect` and `@effect/sql-pg` to `4.1.2`, `drizzle-orm` to `1.0.0-rc.5`, and `drizzle-kit` to `1.0.0-rc.5`. Run plain `bun install` and commit `bun.lock`.
3. In the same change or the next one, set the five `@orpc/*` packages to `2.0.0-beta.48`. Replace `@orpc/experimental-effect` with `@orpc/effect`. Change the extension import in `packages/api/src/orpc.ts` from `extensions/input-output` to `extensions/schema`. Change the type import in `packages/api/src/context.ts` and the allowlist in `packages/api/oxlint.config.ts`.
4. Run `bun run check`. Run `bun run --filter @acme/web build`. Load `packages/db/src/client.ts` under `varlock run` to prove the Drizzle and Effect pair at runtime. A green check and a build do not prove that pair.
5. Start Postgres with `bun run up`. Run `bun run db:generate` and `bun run db:migrate` against a scratch database. This proves `drizzle-kit@1.0.0-rc.5` against the new ORM.
6. Apply the remaining version bumps. Run `bun run check` again.
7. Set `engines.bun` and `packageManager` to `1.4.4`. Set `@types/bun` to `1.4.4`. Upgrade the local runtime with `bun upgrade`.

## Evidence

### Method

- Age rule: a version passes when `2026-11-09T13:52:00Z - publish time >= 259200 s`. The cutoff is `2026-11-06T13:52:00Z`.
- Current pins come from the nine `package.json` files under the repository root, `apps/`, and `packages/`.
- Version lists, publish times, and dist-tags come from the npm packuments. Each `[R#]` reference is the packument URL. The packument supplies the `versions` list, the `time` map, and `dist-tags`.
- Pre-release lines use their own comparison. A dist-tag alone does not select them.
- The better-auth family is exempt from the age gate by `bunfig.toml:4-17`.

### Root workspace

| Package | Current | Newest age-eligible stable | `latest` dist-tag | Recommended target | Source |
| --- | --- | --- | --- | --- | --- |
| `@types/bun` | `1.4.2` | `1.4.4` | `1.4.4` | `1.4.4` | `package.json:29`, [R1] |
| `@types/node` | `26.6.4` | `26.6.6` | `26.6.6` | `26.6.6` | `package.json:30`, [R2] |
| `@varlock/1password-plugin` | `2.0.4` | `2.0.6` | `2.0.6` | `2.0.6` | `package.json:31`, [R3] |
| `oxfmt` | `0.72.0` | `0.77.0` | `0.78.0` | `0.77.0` | `package.json:33`, [R4] |
| `oxlint` | `1.87.0` | `1.92.0` | `1.93.0` | `1.92.0` | `package.json:34`, [R5] |
| `oxlint-plugin-react-doctor` | `0.9.17` | `0.9.22` | `0.9.22` | `0.9.22` | `package.json:35`, [R6] |
| `oxlint-tsgolint` | `7.0.2003` | `7.0.2006` | `7.0.2006` | `7.0.2006` | `package.json:36`, [R7] |
| `turbo` | `2.11.7` | `2.11.10` | `2.11.10` | `2.11.10` | `package.json:37`, [R8] |
| `typescript` | `7.0.2` | `7.0.2` | `7.0.2` | `7.0.2` (hold) | `package.json:38`, [R9] |
| `varlock` | `1.21.1` | `1.24.0` | `1.24.0` | `1.24.0` | `package.json:39`, [R10] |

### `apps/web`

| Package | Current | Newest age-eligible stable | `latest` dist-tag | Recommended target | Source |
| --- | --- | --- | --- | --- | --- |
| `@tanstack/react-query` | `5.104.1` | `5.106.1` | `5.107.1` | `5.106.1` | `apps/web/package.json:22`, [R11] |
| `@tanstack/react-router` | `1.170.41` | `1.170.46` | `1.170.46` | `1.170.46` | `apps/web/package.json:23`, [R13] |
| `@tanstack/react-router-ssr-query` | `1.167.3` | `1.167.3` | `1.167.3` | `1.167.3` (hold) | `apps/web/package.json:24`, [R14] |
| `@tanstack/react-start` | `1.168.60` | `1.169.4` | `1.169.5` | `1.169.4` | `apps/web/package.json:25`, [R15] |
| `better-auth` | `1.7.7` | `1.7.18` | `1.7.18` | `1.7.18` | `apps/web/package.json:26`, [R17] |
| `effect` | `4.0.0-rc.115` | `4.1.2` | `4.1.2` | `4.1.2` | `apps/web/package.json:27`, [R20] |
| `lucide-react` | `1.52.0` | `1.70.0` | `1.70.0` | `1.70.0` | `apps/web/package.json:28`, [R30] |
| `react` | `19.3.0` | `19.3.1` | `19.3.1` | `19.3.1` | `apps/web/package.json:29`, [R31] |
| `react-dom` | `19.3.0` | `19.3.1` | `19.3.1` | `19.3.1` | `apps/web/package.json:30`, [R32] |
| `@tailwindcss/vite` | `4.3.3` | `4.3.4` | `4.3.5` | `4.3.4` | `apps/web/package.json:35`, [R35] |
| `@tanstack/router-cli` | `1.167.40` | `1.167.46` | `1.168.0` | `1.167.46` | `apps/web/package.json:36`, [R16] |
| `@types/react` | `19.3.0` | `19.3.0` | `19.3.0` | `19.3.0` (hold) | `apps/web/package.json:37`, [R33] |
| `@types/react-dom` | `19.3.0` | `19.3.0` | `19.3.0` | `19.3.0` (hold) | `apps/web/package.json:38`, [R34] |
| `@varlock/vite-integration` | `1.5.2` | `1.5.5` | `1.5.5` | `1.5.5` | `apps/web/package.json:39`, [R37] |
| `@vitejs/plugin-react` | `6.1.2` | `6.2.1` | `6.3.0` | `6.2.1` | `apps/web/package.json:40`, [R38] |
| `oxc-transform-react` | `0.153.0` | `0.156.0` | `0.157.0` | `0.156.0` | `apps/web/package.json:41`, [R39] |
| `portless` | `0.15.7` | `0.16.0` | `0.17.0` | `0.16.0` | `apps/web/package.json:42`, [R40] |
| `tailwindcss` | `4.3.3` | `4.3.4` | `4.3.5` | `4.3.4` | `apps/web/package.json:43`, [R36] |
| `typescript` | `7.0.2` | `7.0.2` | `7.0.2` | `7.0.2` (hold) | `apps/web/package.json:44`, [R9] |
| `vite` | `8.3.3` | `8.3.6` | `8.3.7` | `8.3.6` | `apps/web/package.json:45`, [R41] |

### `packages/api`

| Package | Current | Newest age-eligible stable | `latest` dist-tag | Recommended target | Source |
| --- | --- | --- | --- | --- | --- |
| `@orpc/client` | `2.0.0-beta.40` | `1.16.2` stable; `2.0.0-beta.48` beta | `1.16.2` | `2.0.0-beta.48` | `packages/api/package.json:20`, [R24] |
| `@orpc/contract` | `2.0.0-beta.40` | `1.16.2` stable; `2.0.0-beta.48` beta | `1.16.2` | `2.0.0-beta.48` | `packages/api/package.json:21`, [R25] |
| `@orpc/experimental-effect` | `2.0.0-beta.40` | `1.14.11` stable; `2.0.0-beta.45` beta (deprecated) | `1.14.11` | remove | `packages/api/package.json:22`, [R29] |
| `@orpc/effect` | not installed | no stable; `2.0.0-beta.48` beta | `2.0.0-beta.45` | `2.0.0-beta.48` | replacement for line 22, [R26] |
| `@orpc/server` | `2.0.0-beta.40` | `1.16.2` stable; `2.0.0-beta.48` beta | `1.16.2` | `2.0.0-beta.48` | `packages/api/package.json:23`, [R27] |
| `@orpc/tanstack-query` | `2.0.0-beta.40` | `1.16.2` stable; `2.0.0-beta.48` beta | `1.16.2` | `2.0.0-beta.48` | `packages/api/package.json:24`, [R28] |
| `drizzle-orm` | `1.0.0-rc.5-5935859` | `0.45.4` stable; `1.0.0-rc.5` rc line | `0.45.4` | `1.0.0-rc.5` | `packages/api/package.json:25`, [R22] |
| `effect` | `4.0.0-rc.115` | `4.1.2` | `4.1.2` | `4.1.2` | `packages/api/package.json:26`, [R20] |
| `@tanstack/query-core` | `5.104.1` | `5.106.1` | `5.107.1` | `5.106.1` | `packages/api/package.json:31`, [R12] |
| `typescript` | `7.0.2` | `7.0.2` | `7.0.2` | `7.0.2` (hold) | `packages/api/package.json:32`, [R9] |

### `packages/auth`

| Package | Current | Newest age-eligible stable | `latest` dist-tag | Recommended target | Source |
| --- | --- | --- | --- | --- | --- |
| `@better-auth/drizzle-adapter` | `1.7.7` | `1.7.18` | `1.7.18` | `1.7.18` | `packages/auth/package.json:22`, [R18] |
| `better-auth` | `1.7.7` | `1.7.18` | `1.7.18` | `1.7.18` | `packages/auth/package.json:23`, [R17] |
| `effect` | `4.0.0-rc.115` | `4.1.2` | `4.1.2` | `4.1.2` | `packages/auth/package.json:24`, [R20] |
| `auth` | `1.7.7` | `1.7.18` | `1.7.18` | `1.7.18` | `packages/auth/package.json:29`, [R19] |
| `typescript` | `7.0.2` | `7.0.2` | `7.0.2` | `7.0.2` (hold) | `packages/auth/package.json:30`, [R9] |

### `packages/db`

| Package | Current | Newest age-eligible stable | `latest` dist-tag | Recommended target | Source |
| --- | --- | --- | --- | --- | --- |
| `@effect/sql-pg` | `4.0.0-rc.115` | `4.1.2` | `4.1.2` | `4.1.2` | `packages/db/package.json:24`, [R21] |
| `drizzle-orm` | `1.0.0-rc.5-5935859` | `0.45.4` stable; `1.0.0-rc.5` rc line | `0.45.4` | `1.0.0-rc.5` | `packages/db/package.json:25`, [R22] |
| `effect` | `4.0.0-rc.115` | `4.1.2` | `4.1.2` | `4.1.2` | `packages/db/package.json:26`, [R20] |
| `pg` | `8.23.1` | `8.23.1` | `8.23.1` | `8.23.1` (hold) | `packages/db/package.json:27`, [R42] |
| `@types/pg` | `8.23.1` | `8.23.1` | `8.23.1` | `8.23.1` (hold) | `packages/db/package.json:32`, [R43] |
| `drizzle-kit` | `1.0.0-rc.4` | `0.31.11` stable; `1.0.0-rc.5` rc line | `0.31.11` | `1.0.0-rc.5` | `packages/db/package.json:33`, [R23] |
| `typescript` | `7.0.2` | `7.0.2` | `7.0.2` | `7.0.2` (hold) | `packages/db/package.json:34`, [R9] |

### `packages/env`

| Package | Current | Newest age-eligible stable | `latest` dist-tag | Recommended target | Source |
| --- | --- | --- | --- | --- | --- |
| `effect` | `4.0.0-rc.115` | `4.1.2` | `4.1.2` | `4.1.2` | `packages/env/package.json:20`, [R20] |
| `varlock` | `1.21.1` | `1.24.0` | `1.24.0` | `1.24.0` | `packages/env/package.json:26`, [R10] |
| `typescript` | `7.0.2` | `7.0.2` | `7.0.2` | `7.0.2` (hold) | `packages/env/package.json:25`, [R9] |

### `packages/oxlint-config`

| Package | Current | Newest age-eligible stable | `latest` dist-tag | Recommended target | Source |
| --- | --- | --- | --- | --- | --- |
| `@types/node` | `26.6.4` | `26.6.6` | `26.6.6` | `26.6.6` | `packages/oxlint-config/package.json:27`, [R2] |
| `oxlint` | `1.87.0` | `1.92.0` | `1.93.0` | `1.92.0` | `packages/oxlint-config/package.json:28`, [R5] |
| `typescript` | `7.0.2` | `7.0.2` | `7.0.2` | `7.0.2` (hold) | `packages/oxlint-config/package.json:29`, [R9] |
| `oxlint-plugin-react-doctor` (peer) | `0.9.17` | `0.9.22` | `0.9.22` | `0.9.22` | `packages/oxlint-config/package.json:32`, [R6] |

### `packages/typescript-config`

No external dependency. The package has no `dependencies` or `devDependencies` block. Source: `packages/typescript-config/package.json:1-19`.

### `packages/ui`

| Package | Current | Newest age-eligible stable | `latest` dist-tag | Recommended target | Source |
| --- | --- | --- | --- | --- | --- |
| `@base-ui/react` | `1.8.0` | `1.9.0` | `1.9.0` | `1.9.0` | `packages/ui/package.json:25`, [R44] |
| `class-variance-authority` | `0.7.1` | `0.7.1` | `0.7.1` | `0.7.1` (hold) | `packages/ui/package.json:26`, [R45] |
| `clsx` | `2.1.1` | `2.1.1` | `2.1.1` | `2.1.1` (hold) | `packages/ui/package.json:27`, [R46] |
| `lucide-react` | `1.52.0` | `1.70.0` | `1.70.0` | `1.70.0` | `packages/ui/package.json:28`, [R30] |
| `sonner` | `2.0.8` | `2.0.8` | `2.0.8` | `2.0.8` (hold) | `packages/ui/package.json:29`, [R47] |
| `tailwind-merge` | `3.7.0` | `3.7.0` | `3.7.0` | `3.7.0` (hold) | `packages/ui/package.json:30`, [R48] |
| `tw-animate-css` | `1.4.0` | `1.4.0` | `1.4.0` | `1.4.0` (hold) | `packages/ui/package.json:31`, [R49] |
| `@types/react` | `19.3.0` | `19.3.0` | `19.3.0` | `19.3.0` (hold) | `packages/ui/package.json:36`, [R33] |
| `@types/react-dom` | `19.3.0` | `19.3.0` | `19.3.0` | `19.3.0` (hold) | `packages/ui/package.json:37`, [R34] |
| `react` | `19.3.0` | `19.3.1` | `19.3.1` | `19.3.1` | `packages/ui/package.json:38`, [R31] |
| `react-dom` | `19.3.0` | `19.3.1` | `19.3.1` | `19.3.1` | `packages/ui/package.json:39`, [R32] |
| `shadcn` | `4.21.3` | `4.23.0` | `4.23.0` | `4.23.0` | `packages/ui/package.json:40`, [R50] |
| `tailwindcss` | `4.3.3` | `4.3.4` | `4.3.5` | `4.3.4` | `packages/ui/package.json:41`, [R36] |
| `typescript` | `7.0.2` | `7.0.2` | `7.0.2` | `7.0.2` (hold) | `packages/ui/package.json:42`, [R9] |
| `vite` | `8.3.3` | `8.3.6` | `8.3.7` | `8.3.6` | `packages/ui/package.json:43`, [R41] |
| `react` (peer) | `19.3.0` | `19.3.1` | `19.3.1` | `19.3.1` | `packages/ui/package.json:46`, [R31] |
| `react-dom` (peer) | `19.3.0` | `19.3.1` | `19.3.1` | `19.3.1` | `packages/ui/package.json:47`, [R32] |

Internal `workspace:*` links are unchanged. They have no version to update.

### Pinned trio evidence

**Effect.** Effect `4.1.0`, `4.1.1`, and `4.1.2` export `./sql` and no `./unstable/*` path. [E1] [E2] [E3] Effect `4.0.0-rc.115` exports `./unstable/sql` and no `./sql`. [E4] Effect `4.1.2` still exports `Schema.TaggedError`. [E5] The repository uses `Schema.TaggedError` and the other rc.115 names. A local check loaded the names this repository uses, plus the service, config, logger, and runtime calls, under `4.1.2`.

**Drizzle.** `drizzle-orm@1.0.0-rc.5` published on 2026-10-21. [R22] Its `effect-postgres/session.d.ts` imports `effect/sql/SqlError`. [E6] Its `effect-postgres/migrator.d.ts` imports `effect/sql/SqlError`. [E7] It calls `Schema.TaggedError()` in `effect-core/errors.js`. [E8] Its peer ranges are `effect >=4.0.0` and `@effect/sql-pg >=4.0.0`. [E9] The old build `1.0.0-rc.5-5935859` imports `effect/unstable/sql/SqlError`. [E10]

**Drizzle kit.** `drizzle-kit@1.0.0-rc.5` has peer `drizzle-orm >=1.0.0-rc.5`. [E11] The package published 2026-10-21 18:01Z. [R23]

**Effect SQL.** `@effect/sql-pg@4.1.2` has peer `effect ^4.1.2`. [E12] It exports `PgClient` and `PgConnection` for the Drizzle imports. [E13]

**Local load test.** A copy of `effect@4.1.2`, `@effect/sql-pg@4.1.2`, and `drizzle-orm@1.0.0-rc.5` loaded `drizzle-orm/effect-postgres` with its main exports present. The old Drizzle build plus `effect@4.1.2` failed to resolve `effect/unstable/sql/SqlError`. This matches the declaration evidence.

**oRPC.** The `2.0.0-beta.48` line published on 2026-11-01 between 13:41Z and 13:46Z. [R24] [R25] [R26] [R27] [R28] `@orpc/experimental-effect@2.0.0-beta.45` is deprecated with the message "Renamed to @orpc/effect". [E14] `@orpc/effect@2.0.0-beta.48` has peer `effect >=4.0.0` and depends on the five `@orpc/*` packages at `2.0.0-beta.48`. [E15] It exports `./extensions/effect` and `./extensions/schema`. It does not export `./extensions/input-output`. [E15] The rename of the schema extension is a breaking change in commit `74eb82ad8`. [E16] The repository imports the old path in `packages/api/src/orpc.ts:2`. A local load test loaded `@orpc/effect/extensions/schema` under `effect@4.1.2`.

### Version-specific breakage risks

| Package | Target | Risk | Evidence |
| --- | --- | --- | --- |
| `better-auth` family | `1.7.18` | Low for this repository. No schema change is listed from 1.7.8 to 1.7.18. Version 1.7.16 changes admin phone permissions and email verification links; the repository uses GitHub OAuth only. Version 1.7.13 stops type-only exports from being values. Version 1.7.8 fixes string date columns; the schema uses `timestamp` date columns. | [B1] [B2] [B3] `packages/auth/src/server.ts:20-31`, `packages/db/src/schema/auth.generated.ts:10` |
| `@tanstack/react-start` | `1.169.4` | Medium in general. Version 1.169.0 is a minor release. It removes `.inputValidator()`, the built-in `useSession` API, and `transferResponseBodyOwnership`. `apps/web/src` does not use these names. | [T1] `apps/web/src` |
| `@tanstack/react-router` | `1.170.46` | Low. Versions 1.170.42 to 1.170.46 fix link and route behavior. 1.170.46 adds agent skill files and a router-core bump. | [T2] |
| `@tanstack/react-query` and `@tanstack/query-core` | `5.106.1` | Low. Versions 5.105 and 5.106 change mutation and fetch filters. The repository does not use `useIsMutating`, `useIsFetching`, or `useMutationState`. | [T3] [T4] `apps/web/src` |
| `react` and `react-dom` | `19.3.1` | Low. The release note lists one React Server Components transport change. The application uses TanStack Start SSR, not RSC. | [S1] |
| `vite` | `8.3.6` | Low. Bug fixes only, including HTML attribute escaping in the dev server. | [V1] |
| `tailwindcss` and `@tailwindcss/vite` | `4.3.4` | Low to medium. Many fixes change generated CSS and canonicalization. Recheck the rendered UI. | [W1] |
| `@base-ui/react` | `1.9.0` | Low. Fixes for menus, dialogs, tooltips, inputs, and forms. No breaking entry. The used subpaths still exist. | [U1] |
| `lucide-react` | `1.70.0` | Low. The release adds icons. All 19 icon names used by the repository exist in the 1.70.0 declarations. | [L1] `apps/web/src`, `packages/ui/src` |
| `oxlint` | `1.92.0` | Medium. Version 1.90 adds `typescript/no-unsafe-enum-assignment` in the `suspicious` category. Version 1.91 moves two rules into `suspicious`. The configuration makes every category an error. | [O1] [O2] `packages/oxlint-config/src/base-config.ts:12-19` |
| `oxfmt` | `0.77.0` | Low. Versions 0.76 and 0.77 change HTML and Vue formatting. The repository has no `.html` or `.vue` files under `apps/` or `packages/`. Tailwind class sorting changes can still reformat TSX. | [O3] [O4] |
| `oxlint-plugin-react-doctor` | `0.9.22` | Low to medium. Versions 0.9.18 to 0.9.22 tighten effect-cleanup and forwarded-setter proofs. New findings are possible. | [D1] |
| `turbo` | `2.11.10` | Low. Versions 2.11.8 to 2.11.10 add features and fixes. 2.11.10 distrusts a compromised intermediate certificate. | [B4] [B5] [B6] |
| `varlock` | `1.24.0` | Low. Versions 1.22 to 1.24 add features and warnings. `@redactLogs` becomes `@redact` with an alias. The schema does not use it. The `url` type adds warnings; `APP_URL` is a valid URL. | [C1] `.env.schema:19-22` |
| `portless` | `0.16.0` | Low. Adds Docker Compose support and fixes connection reuse. The engine is `node >=24`; the host runs Node 26.12.0. | [P1] |
| `shadcn` | `4.23.0` | Low for the CLI. Version 4.22.0 moves to Zod 4. Version 4.23.0 changes the MCP server. The repository imports no shadcn schema. The two `add` post-steps are unverified for 4.23.0. | [H1] [H2] |
| `@vitejs/plugin-react` | `6.2.1` | Low. Version 6.2.0 adds `refreshInclude` and `refreshExclude`; 6.2.1 fixes them. The peer range for `oxc-transform-react` is `>=0.152.0 <0.157.0`. | [J1] |
| `oxc-transform-react` | `0.156.0` | Low. Version 0.156.0 fixes React Compiler manual memoization. The application enables the compiler in `apps/web/vite.config.ts:22`. | [J2] |
| `@types/node` | `26.6.6` | Low. Patch release of the Node type definitions. | [R2] |
| `@types/bun` | `1.4.4` | Low. Matches Bun `1.4.4`. | [R1] |

## Conflicts

1. **ADR 0001 against the registry.** ADR 0001 says to keep Effect at `4.0.0-rc.115` because Drizzle imports `effect/unstable/sql`. `docs/adr/0001-pin-effect-to-rc-115.md:20-26` states the blocker and the exit condition. The exit condition is now met: `drizzle-orm@1.0.0-rc.5` imports `effect/sql/SqlError`. Follow the new Drizzle build and supersede the ADR. Do not keep the old pin.
2. **Effect `latest` against `rc`.** The `latest` tag is `4.1.2`. The `rc` tag is `4.0.0-rc.118`. The `rc` tag is the old pre-release line and does not ship `effect/unstable/sql`. Follow `latest` and the 4.1 line. [R20]
3. **oRPC `latest` against `beta`.** The `latest` tag is `1.16.2`. The `beta` tag is `2.0.0-beta.50`. The repository uses the v2 contract and the Effect integration. Follow the `2.0.0-beta` line. [R24]
4. **oRPC orphan `2.0.0`.** `@orpc/client@2.0.0` published on 2024-11-23 and depends on `@orpc/shared@0.0.5`. It is not the current stable line. Ignore it. [E17]
5. **`@orpc/effect` `latest` against `beta`.** The `latest` tag is `2.0.0-beta.45`. The `beta` tag is `2.0.0-beta.50`. `beta.45` still has `extensions/input-output`. Follow the version history and pin `beta.48`; do not run `bun add @orpc/effect` without a version. [R26] [E15]
6. **`@vitejs/plugin-react` peer against `oxc-transform-react` `latest`.** The peer range is `>=0.152.0 <0.157.0`. The `latest` tag is `0.157.0`. `0.157.0` is outside the peer range. Follow the peer range and use `0.156.0`. [J1] [R39]
7. **`better-auth` stable against `beta`.** The `latest` tag is `1.7.18`. The `beta` tag is `1.8.0-beta.6`. Follow stable `1.7.18`. [R17]
8. **Bun pin against installed runtime.** The pin is `1.4.2`. The installed runtime is `1.4.3`. The newest stable release is `1.4.4`. Follow `1.4.4`. [R51] [S2]

## Held by the age gate

| Package | Version | Published (UTC) | Eligible from (UTC) | Use instead |
| --- | --- | --- | --- | --- |
| `oxfmt` | `0.78.0` | 2026-11-09T12:02 | 2026-11-12T12:02 | `0.77.0` |
| `oxlint` | `1.93.0` | 2026-11-09T11:47 | 2026-11-12T11:47 | `1.92.0` |
| `@tanstack/react-query` | `5.107.1` | 2026-11-06T23:04 | 2026-11-09T23:04 | `5.106.1` |
| `@tanstack/query-core` | `5.107.1` | 2026-11-06T23:03 | 2026-11-09T23:03 | `5.106.1` |
| `@tanstack/react-start` | `1.169.5` | 2026-11-08T01:04 | 2026-11-11T01:04 | `1.169.4` |
| `@tanstack/router-cli` | `1.168.0` | 2026-11-08T01:04 | 2026-11-11T01:04 | `1.167.46` |
| `@tailwindcss/vite` | `4.3.5` | 2026-11-06T15:16 | 2026-11-09T15:16 | `4.3.4` |
| `tailwindcss` | `4.3.5` | 2026-11-06T15:16 | 2026-11-09T15:16 | `4.3.4` |
| `@vitejs/plugin-react` | `6.3.0` | 2026-11-09T06:12 | 2026-11-12T06:12 | `6.2.1` |
| `oxc-transform-react` | `0.158.0` | 2026-11-09T11:26 | 2026-11-12T11:26 | `0.156.0` |
| `portless` | `0.17.0` | 2026-11-08T22:08 | 2026-11-11T22:08 | `0.16.0` |
| `vite` | `8.3.7` | 2026-11-09T10:25 | 2026-11-12T10:25 | `8.3.6` |
| `@orpc/client` | `2.0.0-beta.49` | 2026-11-07T09:33 | 2026-11-10T09:33 | `2.0.0-beta.48` |
| `@orpc/contract` | `2.0.0-beta.49` | 2026-11-07T09:37 | 2026-11-10T09:37 | `2.0.0-beta.48` |
| `@orpc/effect` | `2.0.0-beta.49` | 2026-11-07T09:34 | 2026-11-10T09:34 | `2.0.0-beta.48` |
| `@orpc/server` | `2.0.0-beta.49` | 2026-11-07T09:33 | 2026-11-10T09:33 | `2.0.0-beta.48` |
| `@orpc/tanstack-query` | `2.0.0-beta.49` | 2026-11-07T09:34 | 2026-11-10T09:34 | `2.0.0-beta.48` |
| `@orpc/client` | `2.0.0-beta.50` | 2026-11-09T10:04 | 2026-11-12T10:04 | `2.0.0-beta.48` |
| `@orpc/contract` | `2.0.0-beta.50` | 2026-11-09T10:04 | 2026-11-12T10:04 | `2.0.0-beta.48` |
| `@orpc/effect` | `2.0.0-beta.50` | 2026-11-09T10:05 | 2026-11-12T10:05 | `2.0.0-beta.48` |
| `@orpc/server` | `2.0.0-beta.50` | 2026-11-09T10:04 | 2026-11-12T10:04 | `2.0.0-beta.48` |
| `@orpc/tanstack-query` | `2.0.0-beta.50` | 2026-11-09T10:05 | 2026-11-12T10:05 | `2.0.0-beta.48` |

Boundary note: `oxfmt@0.77.0` and `oxlint@1.92.0` passed the gate by about one hour at the check time. `tailwindcss@4.3.5` and `@tailwindcss/vite@4.3.5` become eligible about 84 minutes after the check time. Recheck the gate at apply time.

`typescript@7.1.0-beta` and `7.1.0-dev.*` are pre-release. They are not stable targets. The same applies to `better-auth@1.8.0-beta.6` and the React canary builds.

## Not found

- **No `@orpc` changelog file.** The `unnoq/orpc` checkout has no `CHANGELOG` path. The release notes are commit messages. Checked with `git ls-files | grep -i changelog`.
- **No `drizzle-orm@1.0.0` stable and no `1.0.0-rc.6`.** The newest `1.0.0` version is `1.0.0-rc.5`. [R22]
- **No Effect `4.1.x` build with `effect/unstable/sql`.** All three 4.1 builds export `./sql` and no unstable paths. [E1] [E2] [E3]
- **No shadcn `add` run for `4.23.0`.** The two post-steps in `AGENTS.md` are not verified for this version. A real `shadcn add` run is the only direct proof.
- **No database run for `drizzle-kit@1.0.0-rc.5`.** No `db:generate` or `db:migrate` command ran. A scratch database is required.
- **No full typecheck or build run.** This research is read-only. The module-load checks cover module resolution, not the complete type graph.
- **No `bun.lock` change.** The lockfile was not regenerated. The targets are from the registry at the stated time.
- **No release notes for `@orpc/effect` `beta.47` and `beta.48`.** No changelog file lists these changes. The evidence is the commit history and published manifests.

## References

Registry packuments. Each URL supplies the version list, `time` map, and `dist-tags`:

| Ref | URL |
| --- | --- |
| [R1] | https://registry.npmjs.org/@types%2Fbun |
| [R2] | https://registry.npmjs.org/@types%2Fnode |
| [R3] | https://registry.npmjs.org/@varlock%2F1password-plugin |
| [R4] | https://registry.npmjs.org/oxfmt |
| [R5] | https://registry.npmjs.org/oxlint |
| [R6] | https://registry.npmjs.org/oxlint-plugin-react-doctor |
| [R7] | https://registry.npmjs.org/oxlint-tsgolint |
| [R8] | https://registry.npmjs.org/turbo |
| [R9] | https://registry.npmjs.org/typescript |
| [R10] | https://registry.npmjs.org/varlock |
| [R11] | https://registry.npmjs.org/@tanstack%2Freact-query |
| [R12] | https://registry.npmjs.org/@tanstack%2Fquery-core |
| [R13] | https://registry.npmjs.org/@tanstack%2Freact-router |
| [R14] | https://registry.npmjs.org/@tanstack%2Freact-router-ssr-query |
| [R15] | https://registry.npmjs.org/@tanstack%2Freact-start |
| [R16] | https://registry.npmjs.org/@tanstack%2Frouter-cli |
| [R17] | https://registry.npmjs.org/better-auth |
| [R18] | https://registry.npmjs.org/@better-auth%2Fdrizzle-adapter |
| [R19] | https://registry.npmjs.org/auth |
| [R20] | https://registry.npmjs.org/effect |
| [R21] | https://registry.npmjs.org/@effect%2Fsql-pg |
| [R22] | https://registry.npmjs.org/drizzle-orm |
| [R23] | https://registry.npmjs.org/drizzle-kit |
| [R24] | https://registry.npmjs.org/@orpc%2Fclient |
| [R25] | https://registry.npmjs.org/@orpc%2Fcontract |
| [R26] | https://registry.npmjs.org/@orpc%2Feffect |
| [R27] | https://registry.npmjs.org/@orpc%2Fserver |
| [R28] | https://registry.npmjs.org/@orpc%2Ftanstack-query |
| [R29] | https://registry.npmjs.org/@orpc%2Fexperimental-effect |
| [R30] | https://registry.npmjs.org/lucide-react |
| [R31] | https://registry.npmjs.org/react |
| [R32] | https://registry.npmjs.org/react-dom |
| [R33] | https://registry.npmjs.org/@types%2Freact |
| [R34] | https://registry.npmjs.org/@types%2Freact-dom |
| [R35] | https://registry.npmjs.org/@tailwindcss%2Fvite |
| [R36] | https://registry.npmjs.org/tailwindcss |
| [R37] | https://registry.npmjs.org/@varlock%2Fvite-integration |
| [R38] | https://registry.npmjs.org/@vitejs%2Fplugin-react |
| [R39] | https://registry.npmjs.org/oxc-transform-react |
| [R40] | https://registry.npmjs.org/portless |
| [R41] | https://registry.npmjs.org/vite |
| [R42] | https://registry.npmjs.org/pg |
| [R43] | https://registry.npmjs.org/@types%2Fpg |
| [R44] | https://registry.npmjs.org/@base-ui%2Freact |
| [R45] | https://registry.npmjs.org/class-variance-authority |
| [R46] | https://registry.npmjs.org/clsx |
| [R47] | https://registry.npmjs.org/sonner |
| [R48] | https://registry.npmjs.org/tailwind-merge |
| [R49] | https://registry.npmjs.org/tw-animate-css |
| [R50] | https://registry.npmjs.org/shadcn |
| [R51] | https://registry.npmjs.org/bun |

Version manifests and published files:

| Ref | URL |
| --- | --- |
| [E1] | https://cdn.jsdelivr.net/npm/effect@4.1.0/package.json |
| [E2] | https://cdn.jsdelivr.net/npm/effect@4.1.1/package.json |
| [E3] | https://cdn.jsdelivr.net/npm/effect@4.1.2/package.json |
| [E4] | https://cdn.jsdelivr.net/npm/effect@4.0.0-rc.115/package.json |
| [E5] | https://cdn.jsdelivr.net/npm/effect@4.1.2/dist/Schema.d.ts |
| [E6] | https://cdn.jsdelivr.net/npm/drizzle-orm@1.0.0-rc.5/effect-postgres/session.d.ts |
| [E7] | https://cdn.jsdelivr.net/npm/drizzle-orm@1.0.0-rc.5/effect-postgres/migrator.d.ts |
| [E8] | https://cdn.jsdelivr.net/npm/drizzle-orm@1.0.0-rc.5/effect-core/errors.js |
| [E9] | https://cdn.jsdelivr.net/npm/drizzle-orm@1.0.0-rc.5/package.json |
| [E10] | https://cdn.jsdelivr.net/npm/drizzle-orm@1.0.0-rc.5-5935859/effect-postgres/session.d.ts |
| [E11] | https://cdn.jsdelivr.net/npm/drizzle-kit@1.0.0-rc.5/package.json |
| [E12] | https://cdn.jsdelivr.net/npm/@effect/sql-pg@4.1.2/package.json |
| [E13] | https://cdn.jsdelivr.net/npm/@effect/sql-pg@4.1.2/dist/PgClient.d.ts |
| [E14] | https://registry.npmjs.org/@orpc%2Fexperimental-effect/2.0.0-beta.45 |
| [E15] | https://cdn.jsdelivr.net/npm/@orpc/effect@2.0.0-beta.48/package.json |
| [E16] | https://github.com/unnoq/orpc/commit/74eb82ad8daf55a15c91ffe2f033a160dc312f64 |
| [E17] | https://registry.npmjs.org/@orpc%2Fclient/2.0.0 |

Release notes, changelogs, and other sources:

| Ref | URL or path |
| --- | --- |
| [B1] | https://github.com/better-auth/better-auth/blob/main/packages/better-auth/CHANGELOG.md |
| [B2] | https://github.com/better-auth/better-auth/blob/main/packages/drizzle-adapter/CHANGELOG.md |
| [B3] | https://github.com/better-auth/better-auth/blob/main/packages/cli/CHANGELOG.md |
| [B4] | https://github.com/vercel/turborepo/releases/tag/v2.11.8 |
| [B5] | https://github.com/vercel/turborepo/releases/tag/v2.11.9 |
| [B6] | https://github.com/vercel/turborepo/releases/tag/v2.11.10 |
| [T1] | https://github.com/TanStack/router/blob/main/packages/react-start/CHANGELOG.md#11690 |
| [T2] | https://github.com/TanStack/router/blob/main/packages/react-router/CHANGELOG.md |
| [T3] | https://github.com/TanStack/query/blob/main/packages/react-query/CHANGELOG.md |
| [T4] | https://github.com/TanStack/query/blob/main/packages/query-core/CHANGELOG.md |
| [S1] | https://github.com/facebook/react/releases/tag/v19.3.1 |
| [S2] | https://github.com/oven-sh/bun/releases/tag/bun-v1.4.4 |
| [V1] | https://github.com/vitejs/vite/releases/tag/v8.3.6 |
| [W1] | https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.4 |
| [U1] | https://github.com/mui/base-ui/releases/tag/v1.9.0 |
| [L1] | https://github.com/lucide-icons/lucide/releases/tag/1.70.0 |
| [O1] | https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.90.0 |
| [O2] | https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.91.0 |
| [O3] | https://github.com/oxc-project/oxc/releases/tag/oxfmt_v0.76.0 |
| [O4] | https://github.com/oxc-project/oxc/releases/tag/oxfmt_v0.77.0 |
| [D1] | https://github.com/millionco/react-doctor/blob/main/packages/oxlint-plugin-react-doctor/CHANGELOG.md |
| [C1] | https://github.com/dmno-dev/varlock/blob/main/packages/varlock/CHANGELOG.md |
| [P1] | https://github.com/vercel-labs/portless/releases/tag/v0.16.0 |
| [H1] | https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.22.0 |
| [H2] | https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.23.0 |
| [J1] | https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/CHANGELOG.md |
| [J2] | https://github.com/oxc-project/oxc/blob/main/napi/transform-react/CHANGELOG.md |

Local files:

- `bunfig.toml:4-17` — age gate and better-auth exclusions.
- `docs/adr/0001-pin-effect-to-rc-115.md:20-26` — current Effect and Drizzle constraint.
- `package.json:29-44` — root pins, `engines.bun`, and `packageManager`.
- `apps/web/package.json:22-45` — web pins.
- `packages/api/package.json:20-32` — API pins.
- `packages/auth/package.json:22-30` — auth pins.
- `packages/db/package.json:24-34` — database pins.
- `packages/env/package.json:20-26` — environment pins.
- `packages/oxlint-config/package.json:27-32` — lint pins and peer.
- `packages/ui/package.json:25-47` — UI pins and peers.
- `packages/api/src/orpc.ts:1-2` — old extension imports.
- `packages/api/src/context.ts:1` — old type import.
- `packages/api/oxlint.config.ts:11` — old allowlist entry.
- `packages/db/src/client.ts:1-26` — Drizzle Effect client.
- `packages/auth/src/server.ts:20-31` — Drizzle adapter and GitHub provider.
- `packages/db/src/schema/auth.generated.ts:10` — date column type.
- `apps/web/vite.config.ts:22` — React compiler enabled.
