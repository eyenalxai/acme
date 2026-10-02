import { createPlainDatabase } from "@acme/db/plain"
import { authRelations, schema } from "@acme/db/schema/index"
import { serverConfig } from "@acme/env/config"
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2"
import { betterAuth } from "better-auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { Effect, Redacted } from "effect"

const { appUrl, betterAuthSecret, databaseUrl, githubClientId, githubClientSecret } =
  Effect.runSync(serverConfig)

const database = createPlainDatabase({
  databaseUrl: Redacted.value(databaseUrl),
  relations: authRelations,
})

const auth = betterAuth({
  baseURL: appUrl.origin,
  secret: Redacted.value(betterAuthSecret),
  database: drizzleAdapter(database, {
    provider: "pg",
    schema,
  }),
  socialProviders: {
    github: {
      clientId: githubClientId,
      clientSecret: Redacted.value(githubClientSecret),
    },
  },
  trustedOrigins: [appUrl.origin],
  plugins: [tanstackStartCookies()],
})

export { auth }
