# Track the stable Effect and Drizzle pair

Status: accepted. Supersedes [ADR 0001](./0001-pin-effect-to-rc-115.md).

Effect is the server-side effect system and Drizzle is the ORM. The old pin kept
Effect on a pre-release line because Drizzle's declarations imported
`effect/unstable/sql`. Effect 4.1 removed the `unstable` path segment. Drizzle
`1.0.0-rc.5` imports `effect/sql/SqlError`, so the two libraries now align on
the stable Effect line.

We pin `effect` and `@effect/sql-pg` to `4.1.2`, and `drizzle-orm` and
`drizzle-kit` to `1.0.0-rc.5`. We follow the stable Effect line. The pins stay
exact because the runtime API contract spans the two libraries, and a range lets
`bun install` resolve a broken pair.

## Consequences

- Effect 4.1.2 exports `effect/http`, `effect/sql` and `effect/rpc`. It does not
  export `effect/unstable/*`.
- A green `bun run check` and a successful build do not prove the pair. After any
  bump in the pair, load `packages/db/src/client.ts` under `varlock run`.
- Do not hide a dangling Drizzle import with `skipLibCheck` or a tsconfig path
  shim. A missing export is a runtime failure, not a type error.
- oRPC `2.0.0-beta.48` replaces `@orpc/experimental-effect` with `@orpc/effect`.
  The input-output extension is now the schema extension. The contract shape does
  not change.
