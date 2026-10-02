import { createFileRoute } from "@tanstack/react-router"

import { handleRpcRequest } from "@/server/rpc.server"

const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      ANY: async ({ request }) => handleRpcRequest(request),
    },
  },
})

export { Route }
