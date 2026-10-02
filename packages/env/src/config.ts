import { Config } from "effect"

import type { CoercedEnvSchema } from "./env"

type AppEnv = CoercedEnvSchema["APP_ENV"]

type EnvKey = keyof CoercedEnvSchema

const envKey = <K extends EnvKey>(name: K): K => name

const APP_ENV_VALUES = [
  "development",
  "test",
  "staging",
  "production",
] as const satisfies readonly AppEnv[]

const appEnv = Config.Literals(APP_ENV_VALUES, envKey("APP_ENV")).pipe(
  Config.withDefault("development"),
)

const appUrl = Config.URL(envKey("APP_URL"))

const databaseUrl = Config.Redacted(envKey("DATABASE_URL"))

const betterAuthSecret = Config.Redacted(envKey("BETTER_AUTH_SECRET"))

const githubClientId = Config.String(envKey("GITHUB_CLIENT_ID"))

const githubClientSecret = Config.Redacted(envKey("GITHUB_CLIENT_SECRET"))

const serverConfig = Config.all({
  appEnv,
  appUrl,
  databaseUrl,
  betterAuthSecret,
  githubClientId,
  githubClientSecret,
})

export {
  APP_ENV_VALUES,
  appEnv,
  appUrl,
  betterAuthSecret,
  databaseUrl,
  githubClientId,
  githubClientSecret,
  serverConfig,
}
export type { AppEnv }
