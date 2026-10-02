# Sessions are read through the API contract, not Better Auth's client hook

`session.me` is the single session read, and it returns `SessionUser | null`. Signed out
is a value, not an error. A visitor without a session is the normal initial state.
The `/app` guard, the `/sign-in` mirror and the account menu each handle two expected
outcomes instead of catching the ordinary one. The procedure's `UNAUTHORIZED` error is
removed. Procedures that require a session keep their typed errors.

Every read goes through `sessionQueryOptions` in `apps/web/src/lib/session.ts`, which
puts the contract's `session.me` through the oRPC↔React Query bridge. `beforeLoad`
primes that query ahead of the render. The priming makes the server render correct. The
server fetches the session from the request's cookies, and the session is already in
the cache when the first component renders. A signed-in visitor therefore never gets a
signed-out first paint. The Better Auth client remains for the actions that change the
session: the sign-in redirect and sign-out. It is not a second way to read the session.

The question that a future reader will ask is why not `authClient.useSession()`. The
hook is a second session source. It has its own browser-side store, its own error shape
and browser-only scope, while the guard and the server read the contract. Two sources
can disagree. A shell rendered signed in while a redirect decided signed out is the bug
that the single source rules out. The client's error story also splits between the
contract's typed errors and Better Auth's. One session source with typed errors is
better than two.

The hook cannot serve the server render either. SSR has no session unless something
fetches it, and that something is the contract read that the query already performs.

## Consequences

- Freshness is ours, not the hook's. Sign-out must invalidate `sessionQueryOptions`
  before the router navigates. Without that step, the `/sign-in` mirror and the `/app`
  guard re-read the cached user and send the visitor straight back. Every other reader
  also keeps the signed-in shell until React Query's rules refresh it.
- `rpc.server.ts` still resolves the request's user with `auth.api.getSession` to fill
  the per-call context. Every procedure rides on that plumbing, and the UI cannot use it
  as a session read.
- A failed read is not a signed-out state. Only `null` redirects. A transport or decode
  failure rejects out of `beforeLoad` and reaches the route's error surface. A transient
  outage therefore cannot quietly send a signed-in visitor back to `/sign-in`.
