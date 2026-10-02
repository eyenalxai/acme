import { Schema } from "effect"

const SessionUserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  image: Schema.NullOr(Schema.String),
})

const SessionOutputSchema = Schema.NullOr(SessionUserSchema)

type SessionUser = Schema.Schema.Type<typeof SessionUserSchema>

type SessionOutput = Schema.Schema.Type<typeof SessionOutputSchema>

export { SessionOutputSchema, SessionUserSchema }
export type { SessionOutput, SessionUser }
