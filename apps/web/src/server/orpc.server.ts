import type { ApiClient } from "@acme/api/client"

import { createApiRouterClient } from "@acme/api/server-client"
import { getRequestHeaders } from "@tanstack/react-start/server"

import { resolveSessionUser, runtime } from "@/server/rpc.server"

const createServerApiClient = (): ApiClient =>
  createApiRouterClient(runtime, async () => {
    const user = await resolveSessionUser(getRequestHeaders())

    return { user }
  })

export { createServerApiClient }
