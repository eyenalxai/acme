import { createOxlintConfig } from "@acme/oxlint-config"
import { defineConfig } from "oxlint"

export default defineConfig(
  createOxlintConfig({
    rules: {
      // The oRPC Effect extensions are side-effect modules. They patch the
      // builders and export nothing to assign.
      "import/no-unassigned-import": [
        "error",
        { allow: ["@orpc/experimental-effect/extensions/*"] },
      ],
    },
  }),
)
