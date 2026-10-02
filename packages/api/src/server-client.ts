import { createRouterClient } from "@orpc/server"

import type { ApiClient } from "#client"
import type { ServerContext, ServerServices } from "#context"
import type { RpcRequestContext } from "#handler"
import type { ApiRuntime } from "#runtime"

import { router } from "#router"

const createApiRouterClient = <RuntimeError>(
  runtime: ApiRuntime<ServerServices, RuntimeError>,
  resolveContext: () => Promise<RpcRequestContext>,
): ApiClient =>
  createRouterClient(router, {
    context: async (): Promise<ServerContext> => {
      return {
        ...(await resolveContext()),
        requestId: crypto.randomUUID(),
        "effect/context": await runtime.context(),
      }
    },
  })

export { createApiRouterClient }
