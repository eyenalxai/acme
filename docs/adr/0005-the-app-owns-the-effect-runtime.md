# The app owns the Effect runtime, the handler borrows it

`createApiRuntime(layer)` builds the one `ManagedRuntime` that a server process needs.
It merges `LoggingLayer` with the layers that the app supplies.
`createRpcHandler(runtime)` takes that runtime and does not build its own. The
server-side router client takes the same value: `createApiRouterClient(runtime, ...)`.
The HTTP handler and every server-side client therefore share one runtime and one set of
service instances, including whatever database layer the app provides. The runtime is
built once per process, not once per pathway.

The handler originally built its own runtime from a layer, and an app had no way to
share it. Both workarounds were worse than the problem. The first workaround re-provided
an already-built `Context` through `Layer.succeedContext` inside `Layer.unwrap`. The
second kept a partial runtime that failed on any procedure that needed a service the
second runtime omitted. We verified the arrangement by driving three requests through
one handler: the layer set is built once.

## Consequences

- Runtime lifetime belongs to the app. `apps/web` disposes the runtime on
  `SIGINT`/`SIGTERM` and on Vite's HMR teardown. The handler does not own a `dispose()`.
- `ServerServices` in `packages/api/src/context.ts` names the service set that the oRPC
  procedures can use. Widening that set for a new procedure is a one-line change.
