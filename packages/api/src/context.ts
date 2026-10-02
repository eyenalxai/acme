import type { WithEffectContext } from "@orpc/experimental-effect"

import type { ServerServices } from "#services"
import type { SessionUser } from "#services/session"

type ServerContext = {
  readonly requestId: string
  readonly user: SessionUser | null
} & WithEffectContext<ServerServices>

export type { ServerContext, ServerServices }
