import { Button } from "@acme/ui/components/button"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"

import { sessionQueryOptions } from "@/lib/session"

const SiteHeader = () => {
  const { data: user } = useSuspenseQuery(sessionQueryOptions)

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-6">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          Acme
        </Link>
        <nav aria-label="Account" className="ml-auto flex items-center gap-1">
          {user === null ? (
            <Button size="sm" nativeButton={false} render={<Link to="/sign-in" />}>
              Sign in
            </Button>
          ) : (
            <Button variant="secondary" size="sm" nativeButton={false} render={<Link to="/app" />}>
              Open app
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}

export { SiteHeader }
