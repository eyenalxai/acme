import type { SessionUser } from "@acme/api/services/session"
import type { QueryClient } from "@tanstack/react-query"
import type { RegisteredRouter } from "@tanstack/react-router"

import { redirect } from "@tanstack/react-router"

import { authClient } from "@/lib/auth-client"
import { orpc } from "@/lib/orpc"

const sessionQueryOptions = orpc.session.me.queryOptions({
  staleTime: 5 * 60 * 1000,
  retry: false,
})

type SignOutOptions = {
  readonly queryClient: QueryClient
  readonly router: RegisteredRouter
}

const redirectToApp = (): void => {
  redirect({ to: "/app", throw: true })
}

const requireSession: (user: SessionUser | null) => asserts user is SessionUser = (user) => {
  if (user === null) {
    redirect({ to: "/sign-in", throw: true })
  }
}

const signInWithGithub = async () =>
  authClient.signIn.social({ provider: "github", callbackURL: "/app" })

const signOut = async ({ queryClient, router }: SignOutOptions): Promise<void> => {
  const { error } = await authClient.signOut()

  if (error !== null) {
    throw new Error(error.message ?? "Sign out failed.")
  }

  queryClient.removeQueries({ queryKey: sessionQueryOptions.queryKey })

  await router.invalidate()

  await router.navigate({ to: "/" })
}

export { redirectToApp, requireSession, sessionQueryOptions, signInWithGithub, signOut }
export type { SignOutOptions }
