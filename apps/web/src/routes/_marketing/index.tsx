import { Button } from "@acme/ui/components/button"
import { createFileRoute, Link } from "@tanstack/react-router"

const HomePage = () => (
  <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-8 px-6 py-24">
    <div className="flex flex-col gap-4">
      <h1 className="max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance md:text-5xl">
        Acme
      </h1>
      <p className="max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
        A starter for building full-stack web apps.
      </p>
    </div>
    <div>
      <Button size="lg" nativeButton={false} render={<Link to="/sign-in" />}>
        Sign in with GitHub
      </Button>
    </div>
  </div>
)

const Route = createFileRoute("/_marketing/")({
  head: () => {
    return {
      meta: [
        { title: "Acme" },
        { name: "description", content: "A starter for building full-stack web apps." },
      ],
    }
  },
  component: HomePage,
})

export { Route }
