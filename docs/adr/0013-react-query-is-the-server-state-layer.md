# React Query is the server-state layer

The oRPC client caches nothing, so React Query is not a duplicate of it. Every
procedure call travels to the server. A browser feature still needs cached reads,
pending states, optimistic updates and infinite queries, and it needs the contract's
typed errors to reach the components.

React Query is the server-state layer, wired to oRPC through `createApiQueryUtils` in
`apps/web/src/lib/orpc.ts`. That bridge is the reason for React Query here. It carries
the contract's typed errors into `useQuery` and `useMutation`. Pending states,
optimistic updates and infinite queries are built on top of it.

Read sessions through `sessionQueryOptions` in `apps/web/src/lib/session.ts`.

Route loaders handle the data that a route needs at navigation time.
`defaultPreload: "intent"` and `router.invalidate()` exist for that purpose. They are
not a substitute for query state that outlives a route.

## Consequences

- Do not remove React Query to shrink the client bundle. The saving is not worth
  writing its behaviour by hand, and the bundle is measured again after the starter is
  stripped.
