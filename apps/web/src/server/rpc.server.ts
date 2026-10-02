import type { SessionUser } from "@acme/api/services/session"

import { createRpcHandler } from "@acme/api/handler"
import { createApiRuntime } from "@acme/api/runtime"
import { ServerServicesLayer } from "@acme/api/services"
import { auth } from "@acme/auth/server"
import { Database } from "@acme/db/client"
import { Layer } from "effect"
import process from "node:process"

const runtime = createApiRuntime(ServerServicesLayer.pipe(Layer.provide(Database.live)))

const rpcHandler = createRpcHandler(runtime)

const resolveSessionUser = async (headers: Headers): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers })

  if (session === null) {
    return null
  }

  const { user } = session

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
  }
}

const handleRpcRequest = async (request: Request): Promise<Response> => {
  const user = await resolveSessionUser(request.headers)

  return rpcHandler.handle(request, { context: { user } })
}

const disposeRpc = async (): Promise<void> => {
  await runtime.dispose()
}

const shutdown = async (signal: "SIGINT" | "SIGTERM"): Promise<void> => {
  try {
    await disposeRpc()
  } finally {
    process.kill(process.pid, signal)
  }
}

process.once("SIGINT", () => {
  void shutdown("SIGINT")
})

process.once("SIGTERM", () => {
  void shutdown("SIGTERM")
})

import.meta.hot?.dispose(() => {
  void disposeRpc()
})

export { disposeRpc, handleRpcRequest, resolveSessionUser, runtime }
