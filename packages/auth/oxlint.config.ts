import { createOxlintConfig } from "@acme/oxlint-config"
import { defineConfig } from "oxlint"

export default defineConfig(
  createOxlintConfig({
    rules: {
      // The auth instance must exist at module scope, so the Better Auth CLI can
      // read it. That location forces one synchronous Config read during bootstrap.
      "node/no-sync": ["error", { allowAtRootLevel: true }],
    },
  }),
)
