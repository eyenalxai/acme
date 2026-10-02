import type { SubmitEvent } from "react"

import { Button } from "@acme/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@acme/ui/components/empty"
import { Input } from "@acme/ui/components/input"
import { Item, ItemActions, ItemContent, ItemTitle } from "@acme/ui/components/item"
import { Spinner } from "@acme/ui/components/spinner"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { PlusIcon, StickyNoteIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import { orpc } from "@/lib/orpc"

const NotesPage = () => {
  const queryClient = useQueryClient()
  const [text, setText] = useState("")
  const { data: notes } = useSuspenseQuery(orpc.note.list.queryOptions())

  const refreshNotes = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: orpc.note.list.queryKey() })
  }

  const createNote = useMutation({
    ...orpc.note.create.mutationOptions(),
    onSuccess: async () => {
      setText("")
      await refreshNotes()
    },
  })

  const removeNote = useMutation({
    ...orpc.note.remove.mutationOptions(),
    onSuccess: refreshNotes,
  })

  const trimmedText = text.trim()
  const canSubmit = trimmedText !== "" && !createNote.isPending

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    createNote.mutate({ text: trimmedText })
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <header>
          <h1 className="text-lg font-semibold tracking-tight">Notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The worked example. Every note travels through oRPC, Effect and Drizzle, then back
            through React Query.
          </p>
        </header>

        <form className="mt-6 flex items-start gap-2" onSubmit={handleSubmit}>
          <Input
            aria-label="Note text"
            placeholder="Write a note"
            value={text}
            onChange={(event) => {
              setText(event.target.value)
            }}
          />
          <Button type="submit" disabled={!canSubmit}>
            {createNote.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <PlusIcon data-icon="inline-start" />
            )}
            Add note
          </Button>
        </form>

        {createNote.isError ? (
          <p role="status" className="mt-2 text-xs text-destructive">
            The note could not be saved. Try again.
          </p>
        ) : null}

        {notes.length === 0 ? (
          <Empty className="mt-8 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <StickyNoteIcon />
              </EmptyMedia>
              <EmptyTitle>No notes yet</EmptyTitle>
              <EmptyDescription>Write the first note to fill this list.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="mt-8 flex flex-col gap-2">
            {notes.map((note) => {
              const removing = removeNote.isPending && removeNote.variables?.noteId === note.id

              return (
                <li key={note.id}>
                  <Item variant="outline" size="sm">
                    <ItemContent>
                      <ItemTitle className="line-clamp-none font-normal break-words whitespace-pre-wrap">
                        {note.text}
                      </ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete note: ${note.text}`}
                        disabled={removing}
                        onClick={() => {
                          removeNote.mutate({ noteId: note.id })
                        }}
                      >
                        {removing ? <Spinner /> : <Trash2Icon />}
                      </Button>
                    </ItemActions>
                  </Item>
                </li>
              )
            })}
          </ul>
        )}

        {removeNote.isError ? (
          <p role="status" className="mt-2 text-xs text-destructive">
            The note could not be deleted. Try again.
          </p>
        ) : null}
      </div>
    </div>
  )
}

const Route = createFileRoute("/app/notes")({
  loader: async ({ context }) => {
    await context.queryClient.query(orpc.note.list.queryOptions())
  },
  head: () => {
    return {
      meta: [{ title: "Notes — Acme" }],
    }
  },
  component: NotesPage,
})

export { Route }
