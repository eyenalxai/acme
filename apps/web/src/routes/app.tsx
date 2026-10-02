import { useQueryClient } from "@tanstack/react-query"
import { Outlet, createFileRoute, getRouteApi, useRouter } from "@tanstack/react-router"

import { AppShell } from "@/components/app-shell"
import { requireSession, sessionQueryOptions, signOut } from "@/lib/session"
import { readSidebarDefaultOpen } from "@/lib/sidebar-state"

const appRoute = getRouteApi("/app")

const AppLayout = () => {
  const { sidebarDefaultOpen, user } = appRoute.useRouteContext()
  const queryClient = useQueryClient()
  const router = useRouter()

  const handleSignOut = async (): Promise<void> => signOut({ queryClient, router })

  return (
    <AppShell user={user} defaultOpen={sidebarDefaultOpen} onSignOut={handleSignOut}>
      <Outlet />
    </AppShell>
  )
}

const Route = createFileRoute("/app")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query({
      ...sessionQueryOptions,
      staleTime: "static",
    })

    requireSession(user)

    return { sidebarDefaultOpen: readSidebarDefaultOpen(), user }
  },
  head: () => {
    return {
      meta: [{ title: "Acme" }],
    }
  },
  component: AppLayout,
})

export { Route }
