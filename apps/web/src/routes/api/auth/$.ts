import { auth } from "@acme/auth/server"
import { createFileRoute } from "@tanstack/react-router"

const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => auth.handler(request),
      POST: async ({ request }) => auth.handler(request),
    },
  },
})

export { Route }
