# Server-only modules carry a `*.server.ts` suffix; the directory is a convention

TanStack Start's default import-protection rules deny `**/*.server.*` files and
`@tanstack/*-start/server` specifiers in the client environment. They deny
`**/*.client.*` files in the server environment. That suffix is the boundary. Only
dead-code elimination after the isomorphic split keeps a module in
`apps/web/src/server/**` without the suffix out of the client bundle. That
elimination is not a guarantee. The server-only modules are therefore `rpc.server.ts`
and `orpc.server.ts`, not `rpc.ts` and `orpc.ts`.

The Start router plugin protects route files by a different mechanism. It builds the
client route tree by pruning every route node whose `createFileRoute` props are exactly
`server`, and whose children are all server-only. The client code splitter deletes the
`server` option from the rest. That protection is positional, not structural.

A route that gains a `component` beside `server` keeps its imports client-side after the
option is deleted. Only the suffix on the imported module then keeps the build correct.
`apps/web/src/routes/api/**` handlers therefore stay bare `server` routes with no
`component`.

## Consequences

- `bun run check` does not build, so it cannot see a broken boundary. After you touch
  it, confirm that the client bundle contains no `~effect/` TypeId strings.
- Nothing enforces the equivalent rule for the workspace packages. Lint does not
  restrict `effect`, `@acme/db/*` or `@acme/auth/*` imports, so a browser module that
  imports one of them compiles and ships it. Only the `*.server.ts` callers hold that
  line.
