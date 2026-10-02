import { RPCHandler } from "@orpc/server/fetch"
import { Effect } from "effect"

import type { ServerContext, ServerServices } from "#context"
import type { RequestSummary } from "#logging"
import type { ApiRuntime } from "#runtime"

import { withRequestLog } from "#logging"
import { router } from "#router"

type RpcRequestContext = Omit<ServerContext, "effect/context" | "effect/wrap" | "requestId">

type RpcHandleOptions = {
  readonly prefix?: `/${string}`
  readonly context: RpcRequestContext
}

const summarizeResponse = (response: Response): RequestSummary => {
  return {
    outcome: response.ok ? "success" : "failure",
    status: response.status,
  }
}

const createRpcHandler = <RuntimeError>(runtime: ApiRuntime<ServerServices, RuntimeError>) => {
  const handler = new RPCHandler(router)

  const respond = async (
    request: Request,
    prefix: `/${string}`,
    context: ServerContext,
  ): Promise<Response> => {
    const { response } = await handler.handle(request, { prefix, context })

    return response ?? new Response("Not Found", { status: 404 })
  }

  const handle = async (request: Request, options: RpcHandleOptions): Promise<Response> => {
    const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID()

    const context: ServerContext = {
      ...options.context,
      requestId,
      "effect/context": await runtime.context(),
    }

    return runtime.runPromise(
      withRequestLog(
        {
          requestId,
          route: new URL(request.url).pathname,
          userId: options.context.user?.id,
        },
        Effect.promise(async () => respond(request, options.prefix ?? "/api/rpc", context)),
        summarizeResponse,
      ),
    )
  }

  return { handle }
}

export { createRpcHandler }
export type { RpcHandleOptions, RpcRequestContext }
