# Effect is server-only

Effect is the effect system for `packages/api`, `packages/auth`, `packages/db`,
`packages/env`, and the server-only parts of `apps/web`. Browser code does not import
it, and `packages/ui` must not depend on it at all.

The temptation is to reuse Effect's `Logger` and `Result` types on the client for
consistency. We do not, because a shared `Effect`-shaped vocabulary across the
client/server boundary pushes runtime concerns into components: layers, runtimes and
service wiring. The client's data and error story already belongs to TanStack Query and
oRPC's typed clients. Two coherent systems are better than one blurred system.

## Consequences

- `no-console` is an error in `packages/*`, `apps/web/src/server/**` and
  `apps/web/src/routes/api/**`. It is off for the rest of the app. The lint config
  encodes this boundary and does not rely on reviewers.
- Anything the browser needs from the server is passed over the wire, not imported.
- `packages/api` exposes an isomorphic contract but a server-only handler. The
  contract is the only part that a browser can import.
