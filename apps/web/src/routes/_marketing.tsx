import { Outlet, createFileRoute } from "@tanstack/react-router"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { sessionQueryOptions } from "@/lib/session"

const MarketingLayout = () => (
  <div className="flex min-h-svh flex-col">
    <SiteHeader />
    <main className="flex flex-1 flex-col">
      <Outlet />
    </main>
    <SiteFooter />
  </div>
)

const Route = createFileRoute("/_marketing")({
  beforeLoad: async ({ context }) => {
    await context.queryClient.query({
      ...sessionQueryOptions,
      staleTime: "static",
    })
  },
  component: MarketingLayout,
})

export { Route }
