import type { EffectPgDatabase } from "drizzle-orm/effect-postgres"

import { databaseUrl } from "@acme/env/config"
import { PgClient } from "@effect/sql-pg"
import { makeWithDefaults } from "drizzle-orm/effect-postgres"
import { Context, Effect, Layer } from "effect"

import { relations } from "#schema/index"

type DatabaseShape = {
  readonly database: EffectPgDatabase<typeof relations>
}

class Database extends Context.Service<Database, DatabaseShape>()("@acme/db/Database") {
  static readonly layer = Layer.effect(
    Database,
    Effect.gen(function* layer() {
      const database = yield* makeWithDefaults({ relations })

      return Database.of({ database })
    }),
  )

  static readonly live = Database.layer.pipe(
    Layer.provide(PgClient.layerConfig({ url: databaseUrl })),
  )
}

export { Database }
