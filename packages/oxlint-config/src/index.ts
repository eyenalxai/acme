import type { OxlintConfig } from "oxlint"

import type { OverridesConfig, RuleConfig } from "#base-config"

import {
  baseOverrides,
  basePlugins,
  baseRules,
  categories,
  rootIgnorePatterns,
  schemaFileOverrides,
} from "#base-config"
import {
  frontendJsPlugins,
  frontendOverrides,
  frontendPlugins,
  frontendRules,
  frontendSettings,
  webIgnorePatterns,
} from "#frontend-config"

type PluginConfig = NonNullable<OxlintConfig["plugins"]>
type SettingsConfig = NonNullable<OxlintConfig["settings"]>
type JsPluginsConfig = NonNullable<OxlintConfig["jsPlugins"]>

type CreateOxlintConfigOptions = {
  jsPlugins?: JsPluginsConfig
  ignorePatterns?: readonly string[]
  overrides?: OverridesConfig
  plugins?: PluginConfig
  rules?: RuleConfig
  settings?: SettingsConfig
}

type CreateFrontendOxlintConfigOptions = {
  ignorePatterns?: readonly string[]
  overrides?: OverridesConfig
}

const createOxlintConfig = ({
  ignorePatterns = rootIgnorePatterns,
  jsPlugins,
  overrides = [],
  plugins = basePlugins,
  rules = {},
  settings,
}: CreateOxlintConfigOptions = {}): OxlintConfig => {
  return {
    categories,
    env: {
      builtin: true,
    },
    ignorePatterns: [...ignorePatterns],
    overrides: [...baseOverrides, ...schemaFileOverrides, ...overrides],
    plugins,
    rules: {
      ...baseRules,
      ...rules,
    },
    ...(jsPlugins === undefined ? {} : { jsPlugins }),
    ...(settings === undefined ? {} : { settings }),
  }
}

const createFrontendOxlintConfig = ({
  ignorePatterns = webIgnorePatterns,
  overrides = [],
}: CreateFrontendOxlintConfigOptions = {}): OxlintConfig =>
  createOxlintConfig({
    ignorePatterns,
    jsPlugins: frontendJsPlugins,
    overrides: [...frontendOverrides, ...overrides],
    plugins: frontendPlugins,
    rules: frontendRules,
    settings: frontendSettings,
  })

export { createFrontendOxlintConfig, createOxlintConfig }
