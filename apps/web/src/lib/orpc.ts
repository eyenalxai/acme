import type { ApiClient, ApiQueryUtils } from "@acme/api/client"

import { createApiClient, createApiQueryUtils } from "@acme/api/client"
import { createIsomorphicFn } from "@tanstack/react-start"

import { createServerApiClient } from "@/server/orpc.server"

const getApiClient = createIsomorphicFn()
  .client((): ApiClient => createApiClient({ url: "/api/rpc" }))
  .server((): ApiClient => createServerApiClient())

const client: ApiClient = getApiClient()

const orpc: ApiQueryUtils = createApiQueryUtils(client)

export { client, orpc }
export type { ApiClient, ApiQueryUtils }
