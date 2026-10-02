import "@orpc/experimental-effect/extensions/effect"
import "@orpc/experimental-effect/extensions/input-output"
import { oc } from "@orpc/contract"
import { os } from "@orpc/server"

import type { ServerContext } from "#context"

const base = os.$context<ServerContext>()

export { base, oc }
