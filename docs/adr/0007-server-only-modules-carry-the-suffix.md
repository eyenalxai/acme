# Server-only modules carry a `*.server.ts` suffix; the directory is a convention

TanStack Start's default import-protection rules, through
`getDefaultImportProtectionRules` in `start-plugin-core`, deny `**/*.server.*` files
and `@tanstack/{react,solid,vue}-start/server` specifiers in the client environment.
They deny `**/*.client.*` files in the server environment. An import of
`@tanstack/react-start/server-only` or `.../client-only` marks a module for a single
environment. That suffix is the boundary. Only dead-code elimination after the
isomorphic split keeps a module in `apps/web/src/server/**`, such as `src/server/foo.ts`,
without the suffix out of the client bundle. That elimination is not a guarantee. The
server-only modules are therefore `rpc.server.ts` and `orpc.server.ts`, not `rpc.ts` and
`orpc.ts`.

The Start compiler protects route files under `src/routes/api/**` differently. It
returns `null` for a `createFileRoute(..., { server: { handlers } })` file, so
compilation does not strip its imports. The router plugin builds the client route tree
by pruning every route node whose `createFileRoute` props are exactly `server`, and
whose children are all server-only. The client code splitter deletes the `server`
option from the rest. That protection is positional, not structural.

A route that gains a `component` beside `server` loses that protection: it keeps its
imports client-side after the option is deleted. Only the suffix on the imported module
then keeps the build correct. `apps/web/src/routes/api/**` handlers therefore stay bare
`server` routes with no `component`.

## Consequences

- `bun run check` does not build, so it covers neither the import-protection rules nor
  the client bundle. After you touch the boundary, run
  `bun run --filter @acme/web build` and confirm that
  `apps/web/dist/client/assets/*.js` contains no `~effect/` TypeId strings.
- The entry ceiling is `client.build.chunkSizeWarningLimit` in
  `apps/web/vite.config.ts`. Vite warns when a chunk crosses the ceiling, and the build
  does not fail.
- Nothing enforces the equivalent rule for the workspace packages. Lint does not
  restrict `effect`, `@acme/db/*` or `@acme/auth/*` imports, so a browser module that
  imports one of them compiles and ships it. Only the `*.server.ts` callers hold that
  line.
