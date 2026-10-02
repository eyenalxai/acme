import type { QueryClient } from "@tanstack/react-query"
import type { ErrorComponentProps } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { Spinner } from "@acme/ui/components/spinner"
import globalsCss from "@acme/ui/globals.css?url"
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router"

import { ErrorSurface } from "@/components/error-surface"
import { NotFoundSurface } from "@/components/not-found-surface"
import { Toaster } from "@/components/toaster"

type RouterContext = {
  queryClient: QueryClient
}

const RootPendingComponent = () => (
  <div className="flex min-h-[60svh] items-center justify-center">
    <Spinner className="size-5" />
  </div>
)

const RootDocument = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <head>
      <HeadContent />
    </head>
    <body className="min-h-svh antialiased">
      {children}
      <Toaster />
      <Scripts />
    </body>
  </html>
)

const RootComponent = () => (
  <RootDocument>
    <Outlet />
  </RootDocument>
)

const RootErrorComponent = ({ error, reset }: ErrorComponentProps) => (
  <RootDocument>
    <ErrorSurface error={error} reset={reset} />
  </RootDocument>
)

const Route = createRootRouteWithContext<RouterContext>()({
  head: () => {
    return {
      meta: [
        { charSet: "utf8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      links: [{ rel: "stylesheet", href: globalsCss }],
    }
  },
  component: RootComponent,
  pendingComponent: RootPendingComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: NotFoundSurface,
})

export { Route }
