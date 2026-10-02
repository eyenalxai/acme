import { Database } from "@acme/db/client"
import { note } from "@acme/db/schema/note"
import { and, eq } from "drizzle-orm"
import { Context, Effect, Layer, Schema } from "effect"

const NoteSchema = Schema.Struct({
  id: Schema.String,
  text: Schema.String,
  createdAt: Schema.Date,
})

class NoteNotFoundError extends Schema.TaggedError<NoteNotFoundError>()("NoteNotFoundError", {
  message: Schema.String,
}) {}

class EmptyNoteTextError extends Schema.TaggedError<EmptyNoteTextError>()("EmptyNoteTextError", {
  message: Schema.String,
}) {}

type NoteRecord = Schema.Schema.Type<typeof NoteSchema>

type NoteService = {
  readonly list: (userId: string) => Effect.Effect<NoteRecord[]>
  readonly create: (userId: string, text: string) => Effect.Effect<NoteRecord, EmptyNoteTextError>
  readonly remove: (
    userId: string,
    noteId: string,
  ) => Effect.Effect<{ noteId: string }, NoteNotFoundError>
}

class Note extends Context.Service<Note, NoteService>()("acme/api/services/Note") {
  static readonly layer: Layer.Layer<Note, never, Database> = Layer.effect(
    Note,
    Effect.gen(function* noteLayer() {
      const { database } = yield* Database

      return Note.of({
        list: Effect.fn("Note.list")(function* list(
          userId: string,
        ): Effect.fn.Return<NoteRecord[]> {
          const noteRows = yield* database.query.note
            .findMany({
              where: { userId },
              orderBy: { createdAt: "desc" },
            })
            .pipe(Effect.orDie)

          return noteRows.map((noteRow) => {
            return {
              id: noteRow.id,
              text: noteRow.text,
              createdAt: noteRow.createdAt,
            }
          })
        }),
        create: Effect.fn("Note.create")(function* create(
          userId: string,
          text: string,
        ): Effect.fn.Return<NoteRecord, EmptyNoteTextError> {
          const trimmedText = text.trim()

          if (trimmedText.length === 0) {
            return yield* new EmptyNoteTextError({
              message: "The note text must contain a non-whitespace character.",
            })
          }

          const noteRows = yield* database
            .insert(note)
            .values({ userId, text: trimmedText })
            .returning()
            .pipe(Effect.orDie)

          const noteRow = noteRows[0]

          if (noteRow === undefined) {
            return yield* Effect.die("The note insert returned no row.")
          }

          return {
            id: noteRow.id,
            text: noteRow.text,
            createdAt: noteRow.createdAt,
          }
        }),
        remove: Effect.fn("Note.remove")(function* remove(
          userId: string,
          noteId: string,
        ): Effect.fn.Return<{ noteId: string }, NoteNotFoundError> {
          const removedNotes = yield* database
            .delete(note)
            .where(and(eq(note.id, noteId), eq(note.userId, userId)))
            .returning({ id: note.id })
            .pipe(Effect.orDie)

          if (removedNotes.length === 0) {
            return yield* new NoteNotFoundError({
              message: `The note ${noteId} does not exist.`,
            })
          }

          return { noteId }
        }),
      })
    }),
  )
}

export { EmptyNoteTextError, Note, NoteNotFoundError, NoteSchema }
export type { NoteRecord, NoteService }
