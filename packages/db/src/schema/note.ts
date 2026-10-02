import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { user } from "#schema/auth.generated"

const note = pgTable("note", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export { note }
