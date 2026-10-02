import { defineConfig } from "drizzle-kit"

// drizzle-kit runs outside the Effect runtime, and `**/*.config.ts` is exempt
// from the lint rule that bans `process.env`. The empty fallback keeps
// `drizzle-kit generate` working when no database URL is present.
const databaseUrl = process.env.DATABASE_URL ?? ""

export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/schema/**/*.ts"],
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
})
