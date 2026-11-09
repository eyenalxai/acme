import "@orpc/effect/extensions/effect"
import "@orpc/effect/extensions/schema"
import { oc } from "@orpc/contract"
import { os } from "@orpc/server"

import type { ServerContext } from "#context"

const base = os.$context<ServerContext>()

export { base, oc }
