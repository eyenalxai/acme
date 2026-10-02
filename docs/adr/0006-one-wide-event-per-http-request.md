# One wide event per HTTP request, at the HTTP boundary

`createRpcHandler` wraps the whole request in `withRequestLog`, inside the app's
runtime. The request includes the oRPC `handle` call and the fallback 404.
`summarizeResponse` derives the event's outcome and status from the `Response`. A 404 is
therefore logged as a warning, and a rejected procedure is not recorded as a success.

oRPC's `effect/wrap` hook is deliberately unused. It is handed an already-provided
effect, but it runs the wrapper's result on its own fresh runtime. A logging wrapper
therefore had to re-provide the logging context. Without that step, the wide event fell
back to the default plain-text logger. That failure shows up only in production, where
the logger must be JSON.

The hook also sees matched procedures only: an unmatched route produced no event at all.
A typed procedure error exited successfully, because oRPC turns the error into a
`Response`, not a failed Effect. We verified the re-provide by running the same effect
with and without `Effect.provide`: production logging was JSON with it, and the default
logger without.

The trade-off is granularity: one event per request, not one per procedure. The request
is the unit that has a status. The fields that a reader needs (request id, route, user
id, outcome, duration) are all available at the boundary.
