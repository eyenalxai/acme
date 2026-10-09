# acme

A full-stack web-app starter with no product domain. See [GLOSSARY.md](./GLOSSARY.md) for
the domain vocabulary. See [docs/adr](./docs/adr) for decisions. The Notes example is the
end-to-end reference that shows how a feature moves through the stack.

## Agent skills

### Issue tracker

Issues live in Linear, driven with the `rata` CLI. Every issue must carry a
priority and be assigned to the authenticated user. Wayfinder children are the
exception: the claim step assigns them. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary: `needs-triage`, `needs-info`,
`ready-for-agent`, `ready-for-human`, `wontfix`. See
`docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `GLOSSARY.md` at the repo root plus ADRs in
`docs/adr/`. See `docs/agents/domain.md`.

## Working agreement

- **Use subagents.** Split independent tasks across subagents and run them in
  parallel. Do not serialize work that can run at the same time.
- **Change code in a rift.** `rift create --name <change>` makes the worktree and
  the `rift/<change>` branch. Commit the work there. When it is ready, rebase the
  rift onto `main`, bring the rift back into `main` with a fast-forward, then push. Never
  make a merge commit. Rift runs `bun install --frozen-lockfile` at creation. For a new
  dependency, run plain `bun install` and commit `bun.lock`.
- **Load the skills that match the task.** Load `grill-with-docs` and
  `domain-modeling` to sharpen a plan. Load every Effect skill for Effect work.
  Load the design, UI and shadcn skills for interface work.
- **No backwards compatibility.** Refactor when the long-term design needs it.
  Optimize for long-term maintenance and follow best practice.
- **Use Bun** for every command and script.
- **Place each file where it belongs.** Utilities go in `lib`, components in
  `components`. Follow the existing folder structure.
- **Read the source before you guess an API.** Search these checkouts:

| Library                     | Path                               |
| --------------------------- | ---------------------------------- |
| Effect source               | `~/Projects/other/effect`          |
| Effect docs                 | `~/Projects/other/effect-docs`     |
| oRPC                        | `~/Projects/other/orpc`            |
| TanStack docs               | `~/Projects/other/tanstack-docs`   |
| TanStack Start and Router   | `~/Projects/other/tanstack-router` |
| AI SDK source and docs      | `~/Projects/other/vercel-ai`       |
| TanStack AI                 | `~/Projects/other/tanstack-ai`     |
| Turborepo docs              | `~/Projects/other/turborepo`       |
| oxlint and oxfmt source     | `~/Projects/other/oxc`             |
| Varlock                     | `~/Projects/other/varlock`         |
| Drizzle source and docs     | `~/Projects/other/drizzle-orm`     |
| Better Auth source and docs | `~/Projects/other/better-auth`     |
| Rift                        | `~/Projects/other/rift`            |

## Commands

```bash
bun install
bun run up                  # Postgres on :5434 via docker-compose
bun run check               # format + lint + typecheck, every workspace
bun run db:generate         # generate a Drizzle migration from the schema
bun run db:migrate          # apply migrations
bun run auth:generate       # regenerate the Better Auth tables into packages/db
bun dev                     # web at https://acme.localhost via portless
PORTLESS=0 bun dev          # bypass portless; Vite serves http://localhost:3000, not APP_URL

# Several tasks in one workspace. `--sequential` is required. Without it, Bun
# forwards the extra task names as CLI arguments to the first script.
bun run --filter @acme/ui --sequential tsc lint format
```

## Layout

| Workspace                    | Responsibility                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| `apps/web`                   | TanStack Start app. It holds routes, auth endpoints, the RPC endpoint and browser code. |
| `packages/api`               | The oRPC contract, routers, Effect services and structured logging. Server-only.        |
| `packages/auth`              | Better Auth configuration. Server-only.                                                 |
| `packages/db`                | Drizzle schema, migrations, and the database client. Server-only.                       |
| `packages/env`               | Effect `Config` recipes over the varlock-validated environment. Server-only.            |
| `packages/ui`                | shadcn components and design tokens. Browser-only.                                      |
| `packages/oxlint-config`     | Shared oxlint configuration.                                                            |
| `packages/typescript-config` | Shared tsconfig presets.                                                                |

## The Notes example

The starter ships one worked feature, Notes. It is the reference for how a change moves
through the stack. Trace it end to end before you add a feature:

- **Contract** — the Note schemas and procedures in `packages/api/src/contract.ts`.
- **Router** — the Effect implementation in `packages/api/src/router.ts`, which uses the
  Note service in `packages/api/src/services/`.
- **Drizzle** — the `note` table in `packages/db/src/schema/note.ts`, aggregated by
  `packages/db/src/schema/index.ts`.
- **React Query** — the notes route under `apps/web/src/routes/app/`, which reads and
  mutates through `createApiQueryUtils` in `apps/web/src/lib/orpc.ts`.

## Non-negotiables

- **No barrel files and no re-exports.** `oxc/no-barrel-file` is an error for barrel files. Import
  from the concrete module; do not re-export. Every package exposes `"./*": "./src/*.ts"`, so
  `@acme/db/client` resolves to `packages/db/src/client.ts`.
- **No default exports.** `import/no-default-export` is an error. The only exceptions are oxlint config
  files and TanStack Start entry points.
- **Named exports only.** `import/no-default-export` plus `import/exports-last` and `import/group-exports`
  mean one export block at the bottom of the file.
- **`verbatimModuleSyntax` is off in `apps/web` only.** TanStack Start's build docs warn that it can cause
  server bundles to leak into client bundles. Every other workspace keeps it on, so write `import type`
  explicitly there too. It is a correctness habit, not a compiler requirement.
- **No relative parent imports.** `import/no-relative-parent-imports` is an error. Use the package's own
  `#*` subpath imports (or `#components/*` etc.), or the `@acme/*` package specifiers. The pattern is
  `"#*": "./src/*.ts"`, **not** `"#/*"`. Bun 1.4.2 cannot resolve a specifier whose first character after
  `#` is a slash. Node, TypeScript and Vite can resolve it. `#schema/index` resolves everywhere.
- **Do not suppress lint rules.** If a rule genuinely cannot apply, say so in your summary and let the
  maintainer decide. Never add `oxlint-disable` silently.
- **Never suppress an error.** Do not swallow a failure. Only the maintainer can allow an exception.
- **Never access `process.env`.** `node/no-process-env` is an error. Read config through Effect `Config`
  via `@acme/env`.
- **Do not write raw SQL.** Use Drizzle ORM, even when the query needs intermediate results in memory. If
  Drizzle cannot express the query, stop and ask.
- **Never hand-write a migration.** Use `bun run db:generate`. For a custom migration use
  `drizzle-kit generate --custom --name=<name>`. Never edit a generated migration to drop data.
  No data loss. A migration never drops data unless the maintainer approves the drop.
- **No comments** unless they answer a hard "why is it this way?" question.
- **Write documentation and comments in Simplified Technical English.** All documentation and code comments
  use ASD-STE100 Simplified Technical English: short sentences, active voice, one term for one concept.
- **No tests** unless they cover really tricky logic where a subtle bug is hard to catch by hand. No dev servers, no browser.

## Effect (v4, pinned)

`effect` is pinned to **`4.0.0-rc.115`** across the workspace. The paired version is
**`drizzle-orm@1.0.0-rc.5-5935859`**. The pair is constrained on two axes, so read
`docs/adr/0001-pin-effect-to-rc-115.md` before you change either pin. Do not raise Effect past rc.117,
and never mask Drizzle's dangling import with `skipLibCheck` or a tsconfig path shim. rc.115 uses the
`effect/unstable/*` path segment. Before you write Effect code, read `node_modules/effect/AGENTS.md`
if present, and search `node_modules/effect/src` for the exact API. Do not assume rc.118 or v3 shapes.

Conventions:

- Define services with `Context.Service<Self, Shape>()("pkg/path/Name")` and attach a `static readonly layer`.
  Use `Layer.effect(Self, Effect.gen(...))` returning `Self.of({...})` when construction is effectful. Use
  `Layer.succeed(Self, Self.of({...}))` when it is not. A generator with no `yield` trips `require-yield`.
- Name `Effect.gen` generators explicitly (`Effect.gen(function* greet() { ... })`). `func-names` otherwise
  autofixes them to the enclosing binding's name and then trips `no-shadow` mid-fix.
- Public and non-trivial service methods use `Effect.fn("Domain.operation")`.
- Model records as a `<Name>Schema` const plus `type <Name> = Schema.Schema.Type<typeof <Name>Schema>`. The
  same-name `const X` + `interface X` form is not available here. `no-redeclare`,
  `consistent-type-definitions`, `no-empty-interface` and `no-empty-object-type` all reject it.
- Model typed errors with `Schema.TaggedError`.
- Read runtime config with `Config`, never `process.env`. `ManagedRuntime` supplies a default
  `ConfigProvider` that reads the process environment. `Config` therefore resolves inside a managed runtime
  with no extra wiring.
- The app owns the runtime. `createApiRuntime(layer)` merges `LoggingLayer` and returns the result.
  `createRpcHandler(runtime)` takes that runtime and does not build its own. The HTTP handler and the
  server-side router client therefore share one set of services. `ServerServices` in
  `packages/api/src/context.ts` is the single place that names that set.
- `createRpcHandler` emits a wide event per HTTP request, inside that runtime. oRPC's `effect/wrap` hook is
  deliberately unused. It runs its result on a fresh runtime, so a wrapper that logs must re-provide the
  logging context. It also never sees unmatched routes or the response status. That made a 404 invisible
  and a 400 look like a success.
- **Effect is server-only.** Do not import `effect` from browser code, from `packages/ui`, or from a route
  component.

### rc.115 API cheat sheet

These differ from both v3 and rc.118. Verified against the installed package:

| Need                             | At rc.115                                                                                                                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Import paths                     | `effect/unstable/http`, `effect/unstable/sql`, `effect/unstable/rpc`. There is **no** `effect/http` or `effect/sql`.                                                                                      |
| Service definition               | `class X extends Context.Service<X, Shape>()("pkg/X") { static readonly layer = Layer.effect(X, ...) }`, then `X.of({ ... })`. **`Effect.Service`, `Context.Tag` and `Context.GenericTag` do not exist.** |
| Catch all error-channel failures | `Effect.catch` — **`Effect.catchAll` does not exist.** Full cause recovery is `Effect.catchCause`.                                                                                                        |
| Cause                            | Already flattened: `Cause<E>` is `{ readonly reasons: ReadonlyArray<Fail<E> \| Die \| Interrupt> }`. No `Sequential`/`Parallel`/`Empty`. `Cause.hasInterruptsOnly`, `Cause.squash` exist.                 |
| Config                           | `Config.String`, `Config.Int`, `Config.Boolean`, `Config.Redacted`, `Config.URL`. **Not** lowercase. `Config<T>` extends `Effect<T, ConfigError>`, so `yield*` it.                                        |
| Config provider                  | `ConfigProvider` is a `Context.Reference` whose default is `fromEnv()`, so you provide nothing to read the environment. Override with `ConfigProvider.layer(...)`. There is no `Config.layerConfig`.      |
| Scoped layers                    | `Layer.effect` is already scoped (it discharges `Scope.Scope`), so `Effect.acquireRelease` works inside it. **`Layer.scoped` does not exist.**                                                            |
| Boundary decode                  | `Schema.decodeUnknownEffect` / `Schema.decodeUnknownSync`. There is no plain `decodeUnknown`.                                                                                                             |
| Dates                            | `Schema.Date` and `Schema.DateTimeUtc` are **self** schemas (they accept `Date` / `DateTime.Utc` values). String decoding is on `Schema.DateFromString` and `Schema.DateTimeUtcFromString`.               |
| Bun runtime                      | `import { BunRuntime } from "@effect/platform-bun"` → `BunRuntime.runMain(effect)`. `BunServices.layer` provides filesystem/path/stdio/crypto/terminal/spawner.                                           |
| Drizzle                          | `drizzle-orm/effect-postgres` exports `makeWithDefaults` / `EffectPgDatabase`; it requires a `PgClient` from `@effect/sql-pg`. Pinned at `1.0.0-rc.5-5935859`.                                            |

## Logging

**All server logging goes through Effect's `Logger`.** `no-console` is an error in `packages/*`
and in `apps/web/src/server/**` and `apps/web/src/routes/api/**`.

- Use `Effect.log`, `Effect.logInfo`, `Effect.logWarning`, `Effect.logError`.
- Attach structured data with `Effect.annotateLogs({ ... })`. Attach per-request context with
  `Effect.annotateCurrentSpan({ ... })`. Do not string-interpolate values into the message.
- One request produces one wide event at the HTTP boundary. See `docs/adr/0006-one-wide-event-per-http-request.md`.
- Use `Effect.fn("...")` for the span names.
- Browser code can use `console`. That is the one place where it is allowed, and the lint config encodes exactly that.

## The server boundary in `apps/web`

A module that must never reach the browser goes in a `*.server.ts` file. The suffix turns a leak into a
build error. Route handlers under `src/routes/api/**` stay bare `server` routes with no `component`.
`bun run check` does not build, so after you touch the boundary, run `bun run --filter @acme/web build`
and confirm that `apps/web/dist/client/assets/*.js` contains no `~effect/` TypeId strings. See
`docs/adr/0007-server-only-modules-carry-the-suffix.md`.

## Routing areas in `apps/web`

The root route renders no chrome. Each area owns its own chrome. A new protected page goes under
`src/routes/app/` and inherits the guard in `app.tsx`'s `beforeLoad`. A route anywhere else is public by
default. See `docs/adr/0011-the-app-area-lives-under-app-guarded-in-beforeload.md`.

## Server state

React Query is the server-state layer, wired to oRPC through `createApiQueryUtils` in
`apps/web/src/lib/orpc.ts`. Route loaders handle the data that a route needs at navigation time. They are
not a substitute for query state that outlives a route. See
`docs/adr/0013-react-query-is-the-server-state-layer.md`.

Read sessions through `sessionQueryOptions` in `apps/web/src/lib/session.ts`. The Better Auth client is
used for the sign-in and sign-out actions only, never as a session read. See
`docs/adr/0012-sessions-are-read-through-the-api-contract.md`.

## Environment

`.env.schema` at the repository root is the single source of truth. It is committed. `.env.local` and
similar files are not committed. Never read or print a `.env.local`.

- Edit `.env.schema` to add a variable. Then run `bunx varlock load` to validate.
- varlock validates the environment and loads it into `process.env`. Effect `Config` reads it from there.
  Declare the `Config` recipe in `@acme/env`. See `docs/adr/0002-varlock-declares-effect-config-reads.md`.

### Sensitivity

`@defaultSensitive=true` is in the schema header. A new item is **sensitive unless it is explicitly marked
`@public`**. Only `APP_ENV`, `APP_URL` and `GITHUB_CLIENT_ID` are public today. Never relax this default.
See `docs/adr/0004-secrets-never-enter-the-repository.md`.

### Which file wins

Increasing precedence:

`.env.schema` < `.env` < `.env.local` < `.env.[APP_ENV]` < `.env.[APP_ENV].local` < `process.env`

`.env.schema` and `.env.development` are committed. `.env.local` and `.env.[env].local` are gitignored, and a
developer's real values go there. Staging and production have no committed environment file: the deploy platform
injects every value, including `APP_ENV` and the secrets. See `docs/adr/0004-secrets-never-enter-the-repository.md`.

### Which commands can reach 1Password

Only these resolve secret values, so only these can raise an approval prompt:

- `varlock load`, `explain`, `reveal` and `run -- ...` — so `db:migrate`, `db:push`, `db:studio` and `auth:generate` qualify
- `vite dev` and `vite build`, through the varlock Vite plugin

`varlock codegen`, `tsc`, `lint` and `format` never resolve a secret. `bun run check` chains `codegen` only,
so the routine verification path cannot prompt.

### Where `op()` references live

Only in your personal `.env.local`, never in `.env.schema` or any other committed file. For example,
`BETTER_AUTH_SECRET=op(op://Acme/Local/better-auth-secret)`. See `docs/adr/0004-secrets-never-enter-the-repository.md`.

### Environment types

`@generateTsTypes` is declared with `auto=false` and `exposeEnv=none`. The generated
`packages/env/src/env.d.ts` is committed, and only `bun run --filter @acme/env codegen` produces it. See
`docs/adr/0002-varlock-declares-effect-config-reads.md`.

### Adding a secret

1. Declare the item in `.env.schema`. Run `bunx varlock load` to validate the schema.
2. Give it a local value in your own `.env.local` by one of these routes:

   - **An `op()` reference, to read the value from the vault.** Add the field to the `Local` item in the `Acme`
     vault. Then write `op(op://Acme/Local/<field>)` in `.env.local`. This choice keeps the vault as the source
     of truth. It asks for approval once per resolution, or once an hour, because `@initOp` sets `cacheTtl=1h`.
   - **`varlock("local:<payload>")`, for an encrypted value.** Encrypt with
     `bunx varlock encrypt --file .env.local`. The value is device-local, needs no network and
     stores nothing in plaintext.
   - **A plain value.** Fastest, and least safe.

   A 1Password service account makes the first route headless instead of prompting. Create one in the
   1Password web UI with read access to the `Acme` vault. Put its token in `.env.local` as `OP_TOKEN`. CI
   authenticates the same way. `allowAppAuth` is consulted only when that token is empty.

3. The deploy platform injects the value for staging and production. A missing required value fails the load
   in those environments.

A failing `op()` reference is a **hard** load failure. See `docs/adr/0004-secrets-never-enter-the-repository.md`.

## Database

- The schema is in `packages/db/src/schema/`, one file per table.
- `packages/db/src/schema/index.ts` is the aggregation point that the drizzle-kit config and the client both read.
- The Better Auth tables are generated, not written by hand. They are in
  `packages/db/src/schema/auth.generated.ts` and must never be edited.
- No schema change is allowed without the maintainer's approval.

## UI components

The shadcn CLI generates `packages/ui` (`bun run --filter @acme/ui ui -- add <name>`) against the `base-nova`
style on Base UI. You then fix the output by hand. Two post-steps are necessary on every `add`, because the
registry is written for Next.js:

1. **Repair `cn` imports.** shadcn 4.21.0 writes `import { cn } from "cn"` and installs the unrelated npm
   package `cn`. Every import must become `from "#lib/utils"`. Remove the `cn` dependency from
   `packages/ui/package.json`. Do this in the same commit as the `add`.
2. **Strip `"use client"`.** There is no RSC boundary in this app. The directive is dead code that only
   produces a bundler warning.

`packages/ui/src/components/**` is excluded from oxlint, so generated files are not linted. Composing them
correctly is a review responsibility, not a lint one.

Theming follows the operating system, and there is no toggle by decision. The dark tokens are in a
`@media (prefers-color-scheme: dark)` block, nothing sets a `dark` class, and no theme script runs before
paint. `color-scheme: light dark` on `:root` makes native controls follow the same setting.

`globals.css` scans an explicit `@source` list, not the whole package. A component that you add with the CLI
therefore renders unstyled until you name it there. The list names exactly the components that the app can reach.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
