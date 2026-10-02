import { implement } from "@orpc/server"
import { Effect } from "effect"

import type { ServerContext } from "#context"
import type { SessionUser } from "#services/session"

import { contract } from "#contract"
import { Note } from "#services/note"

const implementer = implement(contract).$context<ServerContext>()

const authenticatedUser = <E>(
  context: ServerContext,
  errors: {
    readonly UNAUTHORIZED: (options: { readonly data: { readonly reason: string } }) => E
  },
): Effect.Effect<SessionUser, E> =>
  Effect.gen(function* authenticatedUserGen() {
    const { user } = context

    if (user === null) {
      return yield* Effect.fail(errors.UNAUTHORIZED({ data: { reason: "not_signed_in" } }))
    }

    yield* Effect.annotateCurrentSpan("userId", user.id)

    return user
  })

const me = implementer.session.me.effect(function* me({ context }) {
  yield* Effect.annotateCurrentSpan("userId", context.user?.id)

  return context.user
})

const noteList = implementer.note.list.effect(function* noteList({ context, errors }) {
  const user = yield* authenticatedUser(context, errors)

  const note = yield* Note

  return yield* note.list(user.id)
})

const noteCreate = implementer.note.create.effect(function* noteCreate({ input, context, errors }) {
  const user = yield* authenticatedUser(context, errors)

  const note = yield* Note

  return yield* note
    .create(user.id, input.text)
    .pipe(
      Effect.catchTag("EmptyNoteTextError", (error) =>
        Effect.fail(errors.BAD_REQUEST({ message: error.message, data: { reason: "empty_text" } })),
      ),
    )
})

const noteRemove = implementer.note.remove.effect(function* noteRemove({ input, context, errors }) {
  const user = yield* authenticatedUser(context, errors)

  const note = yield* Note

  return yield* note
    .remove(user.id, input.noteId)
    .pipe(
      Effect.catchTag("NoteNotFoundError", (error) =>
        Effect.fail(
          errors.NOT_FOUND({ message: error.message, data: { reason: "note_not_found" } }),
        ),
      ),
    )
})

const router = implementer.router({
  session: { me },
  note: {
    create: noteCreate,
    list: noteList,
    remove: noteRemove,
  },
})

export { router }
