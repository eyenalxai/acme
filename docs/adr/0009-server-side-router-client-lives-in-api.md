# The server-side router client factory lives in `packages/api`

A server-side oRPC client built with `createRouterClient` must carry `effect/context`
(`runtime.context()`) in the context that it passes. Without it, every effectful
procedure fails at runtime with "service not found". Neither oRPC's documentation nor
its types say so, and the failure appears only when a request is made.
`createApiRouterClient(runtime, resolveContext)` in
`packages/api/src/server-client.ts` owns that pairing. It attaches the runtime's context
and lets the app supply only the request-derived context, today the user id resolved
from the auth session.

The factory was first written in `apps/web`, where it was correct but remained a detail
that every later call site had to remember. Behind the package boundary, the app cannot
get it wrong, and `apps/web` no longer depends on `@orpc/server` directly.
