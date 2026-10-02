# acme

A full-stack web-app starter with no product domain. See [CONTEXT.md](./CONTEXT.md) for
the domain vocabulary. See [docs/adr](./docs/adr) for decisions. The Notes example is the
end-to-end reference that shows how a feature moves through the stack.

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

| Workspace                    | Responsibility                                                               |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `apps/web`                   | TanStack Start app. It holds routes, auth endpoints, the RPC endpoint and browser code. |
| `packages/api`               | The oRPC contract, routers, Effect services and structured logging. Server-only. |
| `packages/auth`              | Better Auth configuration. Server-only.                                      |
| `packages/db`                | Drizzle schema, migrations, and the database client. Server-only.            |
| `packages/env`               | Effect `Config` recipes over the varlock-validated environment. Server-only. |
| `packages/ui`                | shadcn components and design tokens. Browser-only.                           |
| `packages/oxlint-config`     | Shared oxlint configuration.                                                 |
| `packages/typescript-config` | Shared tsconfig presets.                                                     |

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

- **No barrel files.** `oxc/no-barrel-file` is an error. Import from the concrete
  module. Every package exposes `"./*": "./src/*.ts"`, so `@acme/db/client`
  resolves to `packages/db/src/client.ts`.
- **No default exports.** `import/no-default-export` is an error. The only
  exceptions are oxlint config files and TanStack Start entry points.
- **Named exports only.** `import/no-default-export` plus `import/exports-last`
  and `import/group-exports` mean one export block at the bottom of the file.
- **`verbatimModuleSyntax` is off in `apps/web` only.** TanStack Start's build docs
  warn that it can cause server bundles to leak into client bundles. Every other workspace
  keeps it on, so write `import type` explicitly there too. It is a correctness
  habit, not a compiler requirement.
- **No relative parent imports.** `import/no-relative-parent-imports` is an error.
  Use the package's own `#*` subpath imports (or `#components/*` etc.), or the
  `@acme/*` package specifiers. The pattern is `"#*": "./src/*.ts"`, **not**
  `"#/*"`. Bun 1.4.2 cannot resolve a specifier whose first character after `#` is a
  slash. Node, TypeScript and Vite can resolve it. `#schema/index` resolves
  everywhere.
- **Do not suppress lint rules.** If a rule genuinely cannot apply, say so in your
  summary and let the maintainer decide. Never add `oxlint-disable` silently.
- **Never access `process.env`.** `node/no-process-env` is an error. Read config
  through Effect `Config` via `@acme/env`.
- **Do not write raw SQL.** Use Drizzle ORM. If a query seems to need raw SQL,
  stop and ask.
- **Never hand-write a migration.** Use `bun run db:generate`. For a custom
  migration use `drizzle-kit generate --custom --name=<name>`. Never edit a
  generated migration to drop data.
- **No comments** unless they answer a hard "why is it this way?" question.
- **Write documentation and comments in Simplified Technical English.** All
  documentation and code comments use ASD-STE100 Simplified Technical English:
  short sentences, active voice, one term for one concept.
- **No tests, no dev servers, no browser** in this phase.

## Effect (v4, pinned)

`effect` is pinned to **`4.0.0-rc.115`** across the workspace. This pin is deliberate.
The paired version is **`drizzle-orm@1.0.0-rc.5-5935859`**.

**Read this before you write Effect code, because rc.115 is not rc.118.**

- `rc.115` uses the `effect/unstable/*` path segment. `rc.118` removed it.
  At rc.115 the import specifiers are `effect/unstable/http`,
  `effect/unstable/sql`, `effect/unstable/rpc`, and so on.
- The pair is constrained on two axes, and only half of the pair is visible to `tsc`.
  Drizzle's runtime calls `Schema.TaggedError` (present from `4.0.0-beta.104`). Its
  declarations import `effect/unstable/sql/SqlError` (present through
  `4.0.0-rc.117`). The usable Effect window is `[4.0.0-beta.104, 4.0.0-rc.117]`.
- `drizzle-orm@1.0.0-rc.4` calls the pre-`beta.104` `Schema.TaggedErrorClass` and
  cannot load against any rc. Do not bring it back. Do not raise Effect past
  rc.117 until Drizzle's declarations target `effect/sql`. Never mask the
  dangling import with a tsconfig path shim or `skipLibCheck`.
- Drizzle's Effect modules run at import time. After any version change in this pair,
  prove that `packages/db/src/client.ts` loads before you trust a green
  `bun run check` or a build. The history is in
  `docs/adr/0001-pin-effect-to-rc-115.md`.
- Before you write Effect code, read `node_modules/effect/AGENTS.md` if present, and
  search `node_modules/effect/src` for the exact API. Do not assume rc.118 or v3
  shapes.

Conventions:

- Define services with `Context.Service<Self, Shape>()("pkg/path/Name")` and attach a
  `static readonly layer`. Use `Layer.effect(Self, Effect.gen(...))` returning
  `Self.of({...})` when construction is effectful. Use
  `Layer.succeed(Self, Self.of({...}))` when it is not. A generator with no `yield`
  trips `require-yield`.
- Name `Effect.gen` generators explicitly (`Effect.gen(function* greet() { ... })`).
  `func-names` otherwise autofixes them to the enclosing binding's name and then trips
  `no-shadow` mid-fix.
- Public and non-trivial service methods use `Effect.fn("Domain.operation")`.
- Model records as a `<Name>Schema` const plus
  `type <Name> = Schema.Schema.Type<typeof <Name>Schema>`. The same-name `const X` +
  `interface X` form is not available here. `no-redeclare`,
  `consistent-type-definitions`, `no-empty-interface` and `no-empty-object-type` all
  reject it.
- Model typed errors with `Schema.TaggedError`.
- Read runtime config with `Config`, never `process.env`. `ManagedRuntime` supplies a
  default `ConfigProvider` that reads the process environment. `Config` therefore resolves
  inside a managed runtime with no extra wiring.
- The app owns the runtime. `createApiRuntime(layer)` merges `LoggingLayer` and returns
  the result. `createRpcHandler(runtime)` takes that runtime and does not build its own.
  The HTTP handler and the server-side router client therefore share one set of services.
  `ServerServices` in `packages/api/src/context.ts` is the single place that names that
  set.
- `createRpcHandler` emits a wide event per HTTP request, inside that runtime. oRPC's
  `effect/wrap` hook is deliberately unused. It runs its result on a fresh runtime, so a
  wrapper that logs must re-provide the logging context. It also never sees unmatched
  routes or the response status. That made a 404 invisible and a 400 look like a
  success.
- **Effect is server-only.** Do not import `effect` from browser code, from
  `packages/ui`, or from a route component.

### rc.115 API cheat sheet

These differ from both v3 and rc.118. Verified against the installed package:

| Need                             | At rc.115                                                                                                                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Import paths                     | `effect/unstable/http`, `effect/unstable/sql`, `effect/unstable/rpc`. There is **no** `effect/http` or `effect/sql`.                                                                                      |
| Service definition               | `class X extends Context.Service<X, Shape>()("pkg/X") { static readonly layer = Layer.effect(X, ...) }`, then `X.of({ ... })`. **`Effect.Service`, `Context.Tag` and `Context.GenericTag` do not exist.** |
| Catch all error-channel failures | `Effect.catch` — **`Effect.catchAll` does not exist.** Full cause recovery is `Effect.catchCause`.                                                                                                        |
| Cause                            | Already flattened: `Cause<E>` is `{ readonly reasons: ReadonlyArray<Fail<E> \| Die \| Interrupt> }`. No `Sequential`/`Parallel`/`Empty`. `Cause.hasInterruptsOnly`, `Cause.squash` exist.                 |
| Config                           | `Config.String`, `Config.Int`, `Config.Boolean`, `Config.Redacted`, `Config.URL`. **Not** lowercase. `Config<T>` extends `Effect<T, ConfigError>`, so `yield*` it.                                        |
| Config provider                  | `ConfigProvider` is a `Context.Reference` whose default is `fromEnv()`, so you provide nothing to read the environment. Override with `ConfigProvider.layer(...)`. There is no `Config.layerConfig`.     |
| Scoped layers                    | `Layer.effect` is already scoped (it discharges `Scope.Scope`), so `Effect.acquireRelease` works inside it. **`Layer.scoped` does not exist.**                                                            |
| Boundary decode                  | `Schema.decodeUnknownEffect` / `Schema.decodeUnknownSync`. There is no plain `decodeUnknown`.                                                                                                             |
| Dates                            | `Schema.Date` and `Schema.DateTimeUtc` are **self** schemas (they accept `Date` / `DateTime.Utc` values). String decoding is on `Schema.DateFromString` and `Schema.DateTimeUtcFromString`.               |
| Bun runtime                      | `import { BunRuntime } from "@effect/platform-bun"` → `BunRuntime.runMain(effect)`. `BunServices.layer` provides filesystem/path/stdio/crypto/terminal/spawner.                                           |
| Drizzle                          | `drizzle-orm/effect-postgres` exports `makeWithDefaults` / `EffectPgDatabase`; it requires a `PgClient` from `@effect/sql-pg`. Pinned at `1.0.0-rc.5-5935859`.                                            |

## Logging

**All server logging goes through Effect's `Logger`.** `no-console` is an error in
`packages/*` and in `apps/web/src/server/**` and `apps/web/src/routes/api/**`.

- Use `Effect.log`, `Effect.logInfo`, `Effect.logWarning`, `Effect.logError`.
- Attach structured data with `Effect.annotateLogs({ ... })`. Attach per-request context
  with `Effect.annotateCurrentSpan({ ... })`. Do not string-interpolate values into the
  message.
- One request must produce one wide event. That event carries the fields that a
  reader needs: request id, route, user id, outcome, duration.
- Use `Effect.fn("...")` for the span names.
- Browser code can use `console`. That is the one place where it is allowed, and the
  lint config encodes exactly that.

## The server boundary in `apps/web`

`apps/web/src/server/**` is a convention, not a boundary. TanStack Start enforces the
following rules, through `getDefaultImportProtectionRules` in `start-plugin-core`:

- The client environment denies imports of `@tanstack/{react,solid,vue}-start/server`
  and any `**/*.server.*` file.
- The server environment denies any `**/*.client.*` file.
- An import of `@tanstack/react-start/server-only` or `.../client-only` marks a module
  for a single environment.

A module that must never reach the browser therefore belongs in a `*.server.ts` file.
The suffix turns a leak into a build error. Only the compiler's dead-code elimination
after the isomorphic split keeps a `src/server/foo.ts` file without the suffix out of
the client bundle.

Nothing enforces the equivalent rule for the workspace packages. Lint does not
currently restrict `effect`, `@acme/db/*` or `@acme/auth/*` imports. A browser
component that imports one of them compiles and ships it.

The Start compiler protects route files under `src/routes/api/**` differently. It
returns `null` for a `createFileRoute(..., { server: { handlers } })` file, so
compilation does not strip its imports. The router plugin instead prunes any node whose
props are exactly `server` out of the client route tree. A route that gains a
`component` alongside `server` loses that protection: the client deletes its `server`
option while its imports can survive. That is when a `*.server.ts` suffix on the
imported module keeps the build correct.

`bun run check` does not build, so it covers neither the import-protection rules nor
the client bundle. When you touch the boundary, run
`bun run --filter @acme/web build`. Confirm that
`apps/web/dist/client/assets/*.js` contains no `~effect/` TypeId strings. The entry
ceiling is `client.build.chunkSizeWarningLimit` in `apps/web/vite.config.ts`. Vite
warns when a chunk crosses the ceiling, and the build does not fail.

## Routing areas in `apps/web`

The root route renders no chrome. Each area owns its own chrome:

- `/` — marketing chrome, through the pathless `_marketing` layout.
- `/sign-in` — bare.
- `/app/**` — the sidebar shell. The session guard is in `app.tsx`'s `beforeLoad`, and
  every route under `src/routes/app/` inherits it. `/sign-in` mirrors the guard and
  redirects to `/app` when a session exists.

A new protected page goes under `src/routes/app/` and inherits the guard. A route
anywhere else is public by default.

## Server state

React Query is the server-state layer, wired to oRPC through `createApiQueryUtils` in
`apps/web/src/lib/orpc.ts`. That bridge is the reason for React Query here. It carries
the contract's typed errors into `useQuery` and `useMutation`. Pending states,
optimistic updates and infinite queries are built on top of it. The oRPC client caches
nothing, so this layer is not a duplicate of it.

Read sessions through `sessionQueryOptions` in `apps/web/src/lib/session.ts`. The
Better Auth client is used for the sign-in and sign-out actions only, never as a
session read.

Route loaders handle the data that a route needs at navigation time.
`defaultPreload: "intent"` and `router.invalidate()` exist for that purpose. They are
not a substitute for query state that outlives a route.

Do not remove React Query to shrink the client bundle. The saving is not worth writing
its behaviour by hand, and the bundle is measured again after the starter is stripped.

## Environment

`.env.schema` at the repository root is the single source of truth. It is committed.
`.env.local` and similar files are not committed. Never read or print a `.env.local`.

- Edit `.env.schema` to add a variable. Then run `bunx varlock load` to validate.
- varlock validates the environment and loads it into `process.env`. Effect `Config`
  reads it from there. Declare the `Config` recipe in `@acme/env`.
- `bunfig.toml` sets `env = false` so Bun's own `.env` loading cannot shadow varlock.

### Sensitivity

`@defaultSensitive=true` is in the schema header, so a new item is **sensitive
unless it is explicitly marked `@public`**. Only `APP_ENV`, `APP_URL` and
`GITHUB_CLIENT_ID` are public today. Never relax this default. The same key holds
throwaway credentials locally and real ones in staging and production. Sensitivity is a
property of the key, not of the current environment.

Sensitive values are redacted in `varlock load` output. `PublicTypedEnvSchema` excludes
them, and the Vite plugin refuses them in client code.

### Which file wins

Increasing precedence:

`.env.schema` < `.env` < `.env.local` < `.env.[APP_ENV]` < `.env.[APP_ENV].local` < `process.env`

`.env.schema` declares the items and holds environment-independent defaults.
`.env.development` holds the development origin. Those two files are committed.
Staging and production have no committed environment files. The deploy platform
injects every value for them, including `APP_ENV` and the secrets. `process.env`
always takes precedence. `.env.local` and `.env.[env].local` are gitignored, and a
developer's real values go there.

### Which commands can reach 1Password

Only these resolve secret values, so only these can raise an approval prompt:

- `varlock load`, `explain`, `reveal` and `run -- ...` — so `db:migrate`, `db:push`,
  `db:studio` and `auth:generate` qualify
- `vite dev` and `vite build`, through the varlock Vite plugin

`varlock codegen`, `tsc`, `lint` and `format` never resolve a secret. `bun run check`
chains `codegen` only, so the routine verification path cannot prompt.

### Where `op()` references live

Only in your personal `.env.local`, never in `.env.schema` or any other committed
file.

The first reason is correctness. `op()` names exactly one vault item, and every
environment shares the schema. A reference in `.env.schema` can only name
`op://Acme/Local/...`. A deploy that lacks an injected value would resolve that item,
serve development credentials, and report nothing wrong.

The second reason is that nothing committed can raise an approval prompt. To read the
vault during development, put the references in your own `.env.local`, which is
gitignored:

```bash
BETTER_AUTH_SECRET=op(op://Acme/Local/better-auth-secret)
```

`@initOp` alone is inert. It does not authenticate until something resolves a
reference. We verified this by loading a schema that declared
`@initOp(allowAppAuth=false)` with no token and no `op()` call, and the schema resolved
cleanly. That is also why the shared
`@initOp(..., allowAppAuth=forEnv(development, test))` is scoped. A deployed
environment can never silently fall back to a human's 1Password session.

### Environment types

`@generateTsTypes` is declared with `auto=false` and `exposeEnv=none`.
`packages/env/src/env.d.ts` is therefore a pure, ambient-free types module: no
`declare module`, no `declare global`, no `namespace NodeJS`, no `import.meta.env`
augmentation. That design matters, because nothing here can read either global.

Only `bun run --filter @acme/env codegen` produces the file, and `tsc` already chains
that command. The file depends on the schema alone, so the output is deterministic in
every environment. `codegen` formats its own output, because varlock emits trailing
markdown spaces and semicolons that disagree with the repo's formatter. Without that
formatting, the committed file is canonical only when `format` runs after `codegen`,
and Turbo runs the two in parallel.

The file is committed. It is an input, not a build output. Without it, every package
that imports `@acme/env/config` stops typechecking, and the failure is indirect and
confusing. `packages/env/src/config.ts` imports `CoercedEnvSchema` from it directly and
narrows every key through an `envKey()` helper. A misspelled key is therefore a compile
error (`'"APP_URLL"' is not assignable to parameter of type 'keyof CoercedEnvSchema'`),
not a boot-time `ConfigError`.

Do not switch this to `exposeEnv=global`. Module augmentation ties correctness to build
ordering. The augmenting file must be inside each consumer's TypeScript program, and
`packages/db` compiling `env/src/config.ts` does not include it. That surfaces as
`Property 'APP_ENV' does not exist on type 'TypedEnvSchema'`.

### Adding a secret

1. Declare the item in `.env.schema`. Run `bunx varlock load` to validate the schema.
2. Give it a local value in your own `.env.local` by one of these routes:

   - **An `op()` reference, to read the value from the vault.** Add the field to the
     `Local` item in the `Acme` vault. Then write `op(op://Acme/Local/<field>)` in
     `.env.local`. This choice keeps the vault as the source of truth. It asks for
     approval once per resolution, or once an hour, because `@initOp` sets `cacheTtl=1h`.
   - **`varlock("local:<payload>")`, for an encrypted value.** Encrypt with
     `bunx varlock encrypt --file .env.local`. The value is device-local, needs no
     network and stores nothing in plaintext.
   - **A plain value.** Fastest, and least safe.

   A 1Password service account makes the first route headless instead of prompting.
   Create one in the 1Password web UI with read access to the `Acme` vault. Put its
   token in `.env.local` as `OP_TOKEN`. CI authenticates the same way. `allowAppAuth`
   is consulted only when that token is empty.
3. The deploy platform injects the value for staging and production. A missing required
   value fails the load in those environments.

A failing `op()` reference is a **hard** load failure. `varlock load` exits 1, even for
an item that is `@required=forEnv(...)` only outside development. The plugin does offer
`allowMissing`, which yields `undefined` for an item that does not exist. We do not use
it, because a declared secret that cannot be resolved must stop the process. It must
not surface as `undefined` at runtime. `allowMissing` does not rescue a wrong vault
name anyway, because authentication and format errors still throw.

CI and deployed environments need no 1Password access at all when the platform injects
the values. `process.env` has the highest precedence, and varlock never evaluates an
`op()` reference for an item that is already provided. We verified this by pointing the
schema at a nonexistent vault. `varlock load` exited 1 alone and 0 with the values
injected.

## Database

- The schema is in `packages/db/src/schema/`, one file per table.
- `packages/db/src/schema/index.ts` is the aggregation point that the drizzle-kit
  config and the client both read.
- The Better Auth tables are generated, not written by hand. They are in
  `packages/db/src/schema/auth.generated.ts` and must never be edited.
- No schema change is allowed without the maintainer's approval.

## UI components

The shadcn CLI generates `packages/ui`
(`bun run --filter @acme/ui ui -- add <name>`) against the `base-nova` style on
Base UI. You then fix the output by hand. Two post-steps are necessary on every `add`,
because the registry is written for Next.js:

1. **Repair `cn` imports.** shadcn 4.21.0 writes `import { cn } from "cn"` and
   installs the unrelated npm package `cn`. Every import must become
   `from "#lib/utils"`. Remove the `cn` dependency from `packages/ui/package.json`.
   Do this in the same commit as the `add`.
2. **Strip `"use client"`.** There is no RSC boundary in this app. The directive is
   dead code that only produces a bundler warning.

`packages/ui/src/components/**` is excluded from oxlint, so generated files are
not linted. Composing them correctly is a review responsibility, not a lint one.

Theming follows the operating system, and there is no toggle by decision. The dark
tokens are in a `@media (prefers-color-scheme: dark)` block, nothing sets a `dark`
class, and no theme script runs before paint. `color-scheme: light dark` on `:root`
makes native controls follow the same setting.

`globals.css` scans an explicit `@source` list, not the whole package. A component that
you add with the CLI therefore renders unstyled until you name it there. The list names
exactly the components that the app can reach.

## Worktrees

Parallel work happens in rift worktrees:

```bash
rift create --name my-change
```

Each worktree gets branch `rift/my-change` and runs `bun install --frozen-lockfile`
on creation. To add a dependency, run plain `bun install` afterwards and commit the
updated `bun.lock`.
