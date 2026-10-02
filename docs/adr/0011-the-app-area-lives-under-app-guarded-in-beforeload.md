# The app area lives under `/app`, guarded in `beforeLoad`

The signed-in area is a route subtree at `/app`. `apps/web/src/routes/app.tsx` is the
layout that every page under `src/routes/app/` nests inside. Its `beforeLoad` redirects
to `/sign-in` when the session is absent. Every page therefore inherits the check, and a
new protected page cannot be added without a guard. `/sign-in` is the mirror: its
`beforeLoad` sends a visitor who already has a session on to `/app`.

Both alternatives were worse. A check inside each page component runs after the
component starts to render, so the protected UI can flash before the redirect. A page
that forgets the check ships unprotected and looks fine, so the failure is silent. A
single pathname check in the root hides the rule from the route that it protects. The
guard lives in a file that does not name the areas. Every new protected area edits that
file, and reading `app.tsx` no longer tells a reader what its pages require. `beforeLoad`
is the first hook that runs before the route renders and before its loader. A redirect
can therefore happen before anything protected renders.

## Consequences

- Protection is positional: a page under `src/routes/app/` is guarded, and a page
  anywhere else is public. There is no list to keep in sync and no per-page check to
  remember. There is also no error when someone creates a page outside the subtree that
  must be protected.
- The guard is a navigation rule, not the authorization boundary. The RPC handler
  resolves the user from the request headers, and each procedure still decides what that
  user can read. The guard keeps protected UI out of a signed-out render. It cannot be
  the thing that protects data.
- The root route renders no chrome, and each area owns its own chrome. `/` keeps
  marketing chrome through the pathless `_marketing` layout, `/sign-in` is bare, and
  `/app/**` gets the sidebar shell. One area's header can therefore never leak into
  another's.
