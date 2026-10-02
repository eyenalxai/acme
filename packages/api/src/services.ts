import type { Database } from "@acme/db/client"

import { Layer } from "effect"

import { Note } from "#services/note"

type ServerServices = Note

const ServerServicesLayer: Layer.Layer<ServerServices, never, Database> = Layer.mergeAll(Note.layer)

export { ServerServicesLayer }
export type { ServerServices }
