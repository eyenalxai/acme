import { defineRelationsPart } from "drizzle-orm"

import { account, authRelations, session, user, verification } from "#schema/auth.generated"
import { note } from "#schema/note"

const noteRelations = defineRelationsPart({ note })

const schema = {
  account,
  note,
  session,
  user,
  verification,
}

const relations = { ...authRelations, ...noteRelations }

export { authRelations, relations, schema }
