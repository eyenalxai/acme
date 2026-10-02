import type { AnyRelations } from "drizzle-orm/relations"

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

type PlainDatabaseOptions<TRelations extends AnyRelations> = {
  readonly databaseUrl: string
  readonly relations: TRelations
}

const createPlainDatabase = <TRelations extends AnyRelations>({
  databaseUrl,
  relations,
}: PlainDatabaseOptions<TRelations>) =>
  drizzle({
    client: new Pool({ connectionString: databaseUrl }),
    relations,
  })

export { createPlainDatabase }
