import { Alert, AlertDescription, AlertTitle } from "@acme/ui/components/alert"
import { Button } from "@acme/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acme/ui/components/card"
import { Spinner } from "@acme/ui/components/spinner"
import { createFileRoute } from "@tanstack/react-router"
import { TriangleAlertIcon } from "lucide-react"
import { useState } from "react"

import { GithubMark } from "@/components/github-mark"
import { redirectToApp, sessionQueryOptions, signInWithGithub } from "@/lib/session"

const SignInPage = () => {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSignIn = async (): Promise<void> => {
    setPending(true)
    setError(null)

    try {
      const { error: failure } = await signInWithGithub()

      if (failure !== null) {
        const message = failure.message ?? ""
        setError(message === "" ? "The sign-in request failed." : message)
      }
    } catch {
      setError("The sign-in request could not reach the server.")
    } finally {
      setPending(false)
    }
  }

  const handleSignIn = (): void => {
    void runSignIn()
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-4 px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Sign in to Acme</h1>
          </CardTitle>
          <CardDescription>Acme is private. GitHub is the only door in for now.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button className="w-full" disabled={pending} onClick={handleSignIn}>
            {pending ? <Spinner data-icon="inline-start" /> : <GithubMark />}
            {pending ? "Redirecting to GitHub" : "Continue with GitHub"}
          </Button>
          {error === null ? null : (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>Sign-in failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

const Route = createFileRoute("/sign-in")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query({
      ...sessionQueryOptions,
      staleTime: "static",
    })

    if (user !== null) {
      redirectToApp()
    }
  },
  head: () => {
    return {
      meta: [{ title: "Sign in — Acme" }],
    }
  },
  component: SignInPage,
})

export { Route }
