import { Cause, Clock, Config, Effect, Exit, Layer, Logger, References } from "effect"

type RequestLogFields = {
  readonly requestId: string
  readonly route: string
  readonly userId?: string
}

type RequestSummary = {
  readonly outcome: "success" | "failure"
  readonly status: number
}

// `APP_ENV` has a default, so a `ConfigError` here can only mean that the
// `ConfigProvider` itself is broken. That is a defect, not a condition worth
// Surfacing. Dying keeps the defect out of the runtime's error type. Otherwise
// Every consumer must carry the error, and the linter reads that union as
// Redundant.
const environment = Config.String("APP_ENV").pipe(Config.withDefault("development"), Effect.orDie)

const loggerLayer = (appEnvironment: string) =>
  appEnvironment === "production"
    ? Layer.merge(
        Logger.layer([Logger.consoleJson]),
        Layer.succeed(References.MinimumLogLevel, "Info"),
      )
    : Layer.merge(
        Logger.layer([Logger.consolePretty()]),
        Layer.succeed(References.MinimumLogLevel, "Debug"),
      )

const LoggingLayer = Layer.unwrap(
  Effect.gen(function* loggingLayer() {
    const appEnvironment = yield* environment
    return loggerLayer(appEnvironment)
  }),
)

const annotations = (fields: Partial<RequestLogFields>): Record<string, string> => {
  return {
    ...(fields.requestId === undefined ? {} : { requestId: fields.requestId }),
    ...(fields.route === undefined ? {} : { route: fields.route }),
    ...(fields.userId === undefined ? {} : { userId: fields.userId }),
  }
}

const annotateRequestLog =
  (fields: Partial<RequestLogFields>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
    Effect.gen(function* annotateRequest() {
      yield* Effect.annotateCurrentSpan(annotations(fields))
      return yield* effect.pipe(Effect.annotateLogs(annotations(fields)))
    })

const logWideEvent = <A>(
  exit: Exit.Exit<A, unknown>,
  durationMs: number,
  summarize: (value: A) => RequestSummary,
): Effect.Effect<void> =>
  Exit.match(exit, {
    onFailure: (cause) =>
      Effect.logError("http request failed").pipe(
        Effect.annotateLogs({ outcome: "failure", durationMs, cause: Cause.pretty(cause) }),
      ),
    onSuccess: (value) => {
      const { outcome, status } = summarize(value)

      return (
        outcome === "success"
          ? Effect.logInfo("http request completed")
          : Effect.logWarning("http request rejected")
      ).pipe(Effect.annotateLogs({ outcome, status, durationMs }))
    },
  })

const withRequestLog = <A, E, R>(
  fields: RequestLogFields,
  effect: Effect.Effect<A, E, R>,
  summarize: (value: A) => RequestSummary,
): Effect.Effect<A, E, R> =>
  Effect.gen(function* runWithRequestLog() {
    const startedAt = yield* Clock.currentTimeMillis
    return yield* effect.pipe(
      Effect.onExit((exit) =>
        Effect.gen(function* logExit() {
          const durationMs = (yield* Clock.currentTimeMillis) - startedAt
          yield* logWideEvent(exit, durationMs, summarize)
        }),
      ),
    )
  }).pipe(annotateRequestLog(fields))

export { LoggingLayer, annotateRequestLog, withRequestLog }
export type { RequestLogFields, RequestSummary }
