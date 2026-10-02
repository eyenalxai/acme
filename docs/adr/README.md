# Architecture decision records

Each record holds one decision and the reasoning that a later reader needs. Read the
record before you change the thing that it describes.

| ADR  | Title                                                                                                                             | Summary                                                                                                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 0001 | [Pin Effect to 4.0.0-rc.115, with Drizzle's rc5 build](./0001-pin-effect-to-rc-115.md)                                            | The Effect and Drizzle pre-release APIs constrain each other at runtime, so the pair is pinned exactly.    |
| 0002 | [Varlock declares the environment, Effect Config reads it](./0002-varlock-declares-effect-config-reads.md)                        | Varlock owns validation and secret storage; Effect `Config` owns typed access over a committed `env.d.ts`. |
| 0003 | [Effect is server-only](./0003-effect-is-server-only.md)                                                                          | Browser code uses TanStack Query and oRPC; it never imports `effect`.                                      |
| 0004 | [Secrets never enter the repository](./0004-secrets-never-enter-the-repository.md)                                                | No secret and no live secret reference is committed; deployed environments receive injected values.        |
| 0005 | [The app owns the Effect runtime, the handler borrows it](./0005-the-app-owns-the-effect-runtime.md)                              | One `ManagedRuntime` per process, shared by the handler and server-side clients.                           |
| 0006 | [One wide event per HTTP request, at the HTTP boundary](./0006-one-wide-event-per-http-request.md)                                | Logging wraps the whole request, so a 404 and a typed error are recorded correctly.                        |
| 0007 | [Server-only modules carry a `*.server.ts` suffix; the directory is a convention](./0007-server-only-modules-carry-the-suffix.md) | The suffix is the import boundary, and route handlers stay bare `server` routes.                           |
| 0008 | [`APP_URL` is required, with no default](./0008-app-url-is-required.md)                                                           | Each environment names its own origin, so an OAuth callback cannot silently use the wrong host.            |
| 0009 | [The server-side router client factory lives in `packages/api`](./0009-server-side-router-client-lives-in-api.md)                 | The factory attaches the runtime context, so a call site cannot forget it.                                 |
| 0010 | [Provider tokens are short-lived, and are never read from the account row](./0010-provider-tokens-are-short-lived.md)             | Read provider tokens through `auth.api.getAccessToken`, never from `account.accessToken`.                  |
| 0011 | [The app area lives under `/app`, guarded in `beforeLoad`](./0011-the-app-area-lives-under-app-guarded-in-beforeload.md)          | Protection is positional: the guard lives once in `app.tsx` and every page inherits it.                    |
| 0012 | [Sessions are read through the API contract, not Better Auth's client hook](./0012-sessions-are-read-through-the-api-contract.md) | `sessionQueryOptions` is the single session read; the Better Auth client only signs in and out.            |
| 0013 | [React Query is the server-state layer](./0013-react-query-is-the-server-state-layer.md)                                          | `createApiQueryUtils` carries typed errors, pending states and infinite queries into the UI.               |
