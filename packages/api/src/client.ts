import type { ClientContext } from "@orpc/client"
import type { RPCLinkOptions } from "@orpc/client/fetch"
import type { RouterClient } from "@orpc/server"
import type { RouterUtils } from "@orpc/tanstack-query"

import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"

import type { router } from "#router"

type ApiClient = RouterClient<typeof router>

type ApiQueryUtils = RouterUtils<ApiClient>

const createApiClient = (options: RPCLinkOptions<ClientContext>): ApiClient =>
  createORPCClient<ApiClient>(new RPCLink(options))

const createApiQueryUtils = (client: ApiClient): ApiQueryUtils => createTanstackQueryUtils(client)

export { createApiClient, createApiQueryUtils }
export type { ApiClient, ApiQueryUtils }
