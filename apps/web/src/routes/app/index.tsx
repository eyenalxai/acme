import { Button } from "@acme/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acme/ui/components/card"
import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowRightIcon } from "lucide-react"

const HomePage = () => (
  <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-16">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <h1>You’re signed in</h1>
        </CardTitle>
        <CardDescription>
          This is the Acme starter. The Notes example shows how a feature moves from the contract to
          the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button nativeButton={false} render={<Link to="/app/notes" />}>
          Open Notes
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  </div>
)

const Route = createFileRoute("/app/")({
  head: () => {
    return {
      meta: [{ title: "Home — Acme" }],
    }
  },
  component: HomePage,
})

export { Route }
