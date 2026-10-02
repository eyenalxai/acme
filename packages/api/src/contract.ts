import { Schema } from "effect"

import { oc } from "#orpc"
import { NoteSchema } from "#services/note"
import { SessionOutputSchema } from "#services/session"

const reasonSchema = Schema.toStandardSchemaV1(Schema.Struct({ reason: Schema.String }))

const unauthorizedError = {
  message: "Sign in to use the API.",
  data: reasonSchema,
}

const notFoundError = {
  message: "The requested record does not exist.",
  data: reasonSchema,
}

const badRequestError = {
  message: "The request was rejected.",
  data: reasonSchema,
}

const NoteCreateInputSchema = Schema.Struct({ text: Schema.String })

const NoteIdInputSchema = Schema.Struct({ noteId: Schema.String })

const NoteIdOutputSchema = Schema.Struct({ noteId: Schema.String })

const contract = oc.router({
  session: {
    me: oc.output(SessionOutputSchema),
  },
  note: {
    list: oc.errors({ UNAUTHORIZED: unauthorizedError }).output(Schema.Array(NoteSchema)),
    create: oc
      .errors({ UNAUTHORIZED: unauthorizedError, BAD_REQUEST: badRequestError })
      .input(NoteCreateInputSchema)
      .output(NoteSchema),
    remove: oc
      .errors({ UNAUTHORIZED: unauthorizedError, NOT_FOUND: notFoundError })
      .input(NoteIdInputSchema)
      .output(NoteIdOutputSchema),
  },
})

export { contract }
