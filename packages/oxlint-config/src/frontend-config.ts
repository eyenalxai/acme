import type { OxlintConfig } from "oxlint"

import type { OverridesConfig, RuleConfig } from "#base-config"

import { baseIgnorePatterns, basePlugins } from "#base-config"
import { buildReactDoctorRules } from "#react-doctor/rules"

type PluginConfig = NonNullable<OxlintConfig["plugins"]>
type SettingsConfig = NonNullable<OxlintConfig["settings"]>
type JsPluginsConfig = NonNullable<OxlintConfig["jsPlugins"]>

const frontendPlugins: PluginConfig = [...basePlugins, "react", "react-perf"]

const frontendJsPlugins: JsPluginsConfig = [
  { name: "react-doctor", specifier: "oxlint-plugin-react-doctor" },
]

const frontendRules: RuleConfig = {
  ...buildReactDoctorRules(),
  "react-perf/jsx-no-new-array-as-prop": "off", // React Compiler hoists these.
  "react-perf/jsx-no-new-function-as-prop": "off",
  "react-perf/jsx-no-jsx-as-prop": "off",
  "react-perf/jsx-no-new-object-as-prop": "off",
  "react/forbid-component-props": "off",
  "react/function-component-definition": "off",
  "react/hook-use-state": "off",
  "react/jsx-filename-extension": "off",
  "react/jsx-handler-names": "off",
  "react/jsx-max-depth": "off",
  "react/jsx-no-literals": "off",
  "react/no-children-prop": "error",
  "react/no-multi-comp": "off",
  "react/only-export-components": "off",
  "react/react-in-jsx-scope": "off",
  "react/todo": "off",
}

const frontendSettings: SettingsConfig = {
  react: {
    version: "19.3.0",
  },
  "react-doctor": {
    forbidComponentProps: {
      forbid: ["style"],
    },
    // Stacked providers and layout components routinely reach 10-13 levels.
    jsxMaxDepth: {
      max: 14,
    },
    onlyExportComponents: {
      allowConstantExport: true,
    },
  },
}

/**
 * TanStack Start's entry points are the only files in the app that must use
 * default exports. `src/client.tsx` hydrates at module scope.
 */
const startConventionFileOverrides: OverridesConfig = [
  {
    files: ["src/start.ts", "src/client.tsx", "src/server.ts"],
    rules: {
      "import/exports-last": "off",
      "import/group-exports": "off",
      "import/no-default-export": "off",
      "oxc/no-barrel-file": "off",
    },
  },
]

const frontendOverrides: OverridesConfig = [
  ...startConventionFileOverrides,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-console": "off", // Browser code logs to the browser console. There is no Effect logger there.
    },
  },
  {
    files: ["src/server/**/*.{ts,tsx}", "src/routes/api/**/*.{ts,tsx}"],
    rules: {
      "no-console": "error", // Server code logs through Effect.log.
    },
  },
]

const webIgnorePatterns = [...baseIgnorePatterns, "src/components/ui/**"]

const uiIgnorePatterns = [...baseIgnorePatterns, "src/components/**"]

export {
  frontendJsPlugins,
  frontendOverrides,
  frontendPlugins,
  frontendRules,
  frontendSettings,
  startConventionFileOverrides,
  uiIgnorePatterns,
  webIgnorePatterns,
}
