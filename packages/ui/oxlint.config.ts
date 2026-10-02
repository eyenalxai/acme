import { createFrontendOxlintConfig } from "@acme/oxlint-config"
import { uiIgnorePatterns } from "@acme/oxlint-config/frontend-config"
import { defineConfig } from "oxlint"

export default defineConfig(
  createFrontendOxlintConfig({
    ignorePatterns: uiIgnorePatterns,
  }),
)
