# Pin Effect to 4.0.0-rc.115, with Drizzle's rc5 build

We use Effect as the server-side effect system and Drizzle as the ORM. Both are on
pre-release lines. Drizzle's Effect integration calls Effect APIs at runtime that its
declarations never mention. The two libraries therefore constrain each other from two
independent directions. Only one of those directions is visible to `tsc`.

Drizzle `1.0.0-rc.4`'s compiled integration calls `Schema.TaggedErrorClass()`
(`cache/core/cache-effect.js`, `effect-core/errors.js`). `effect@4.0.0-beta.104` renamed
that name to `Schema.TaggedError`, and no `4.0.0-rc.*` exports it. rc.4 therefore cannot
load against any Effect rc. `packages/db/src/client.ts` died at module evaluation with
`TypeError: Schema$1.TaggedErrorClass is not a function`. Every page goes through
`rpc.server.ts`, so every request returned 500. A typecheck and a build both passed
anyway, because rc.4's declarations import only `effect/unstable/sql/SqlError`, which
resolved fine.

The rc5 build (`drizzle-orm@1.0.0-rc.5-5935859`, the package's `rc5` dist-tag) calls
`Schema.TaggedError()` instead. Every Effect from `beta.104` through `rc.118` exports
that name. Its declarations still import `effect/unstable/sql/SqlError`, and Effect
removed the `unstable/` path segment at `4.0.0-rc.118`.

The Effect window for this Drizzle build is therefore `[4.0.0-beta.104, 4.0.0-rc.117]`
on both axes. The Schema API rename bounds the window below, and the import path bounds
it above. `4.0.0-rc.115` sits inside the window. rc.118 typechecks only because
`skipLibCheck` hides the dangling import. With `--skipLibCheck false`, `tsc` reports
`TS2307: Cannot find module 'effect/unstable/sql/SqlError'` in Drizzle's declarations.

We move only `drizzle-orm` and keep `effect` and `@effect/sql-pg` at `4.0.0-rc.115`.
Every Effect API this repository calls exists at rc.115. That set is 39 runtime
names. The names span `Cause`, `Clock`, `Config`, `Context`, `Effect`, `Exit`, `Layer`,
`Logger`, `ManagedRuntime`, `Redacted`, `References` and `Schema`. The only broken half was Drizzle's. `rc.117` is
the newest Effect that the Drizzle declarations accept. A move to rc.117 means a
workspace-wide Effect bump, a `@effect/sql-pg` bump and a re-verification of all of the
above. That change has no practical gain.

## Consequences

- Raising `effect` past `4.0.0-rc.117` requires a Drizzle build whose declarations
  target `effect/sql`, not `effect/unstable/sql`. Until then, the newest Effect is out
  of reach. Do not hide the dangling import with `skipLibCheck` or a tsconfig path shim.
- Never pair `drizzle-orm@1.0.0-rc.4` with any Effect rc. The API that it calls last
  existed in `4.0.0-beta.103`, before the rc line began.
- The pins are exact on purpose. The incompatibility is a runtime API rename that types
  cannot see, so a range lets `bun install` pick a broken pair. After any bump in this
  pair, load `packages/db/src/client.ts` under `varlock run`. A green `bun run check`
  and a successful build are not evidence for this failure mode.
- `drizzle-kit` stays at `1.0.0-rc.4`: it bundles its own ORM and does not share the
  client runtime. This change does not verify whether the rc.4 kit works with the rc5
  ORM for `db:generate`/`db:migrate`.
- If this pairing becomes painful, the alternative is to drop
  `drizzle-orm/effect-postgres` and wrap the plain `node-postgres` driver in our own
  Effect service. The service interface does not change, only `packages/db` internals.
