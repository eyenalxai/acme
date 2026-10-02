import type { OxlintConfig } from "oxlint"

type PluginConfig = NonNullable<OxlintConfig["plugins"]>
type RuleConfig = NonNullable<OxlintConfig["rules"]>
type OverridesConfig = NonNullable<OxlintConfig["overrides"]>
type CategoriesConfig = NonNullable<OxlintConfig["categories"]>

/**
 * Every category is an error. The categories overlap heavily. Many rules below
 * exist only to switch off a category member that we decided against.
 */
const categories: CategoriesConfig = {
  correctness: "error",
  suspicious: "error",
  perf: "error",
  pedantic: "error",
  style: "error",
  restriction: "error",
}

const basePlugins: PluginConfig = ["typescript", "unicorn", "oxc", "promise", "import", "node"]

const baseRules: RuleConfig = {
  // Category members we deliberately do not want.
  "no-console": "error",
  "no-magic-numbers": "off",
  "no-undefined": "off",
  "no-ternary": "off",
  "no-continue": "off",
  "no-void": "off",
  "no-inline-comments": "off",
  "no-warning-comments": "off",
  "no-plusplus": "error",
  "no-negated-condition": "error",
  "no-nested-ternary": "off",
  "no-empty-function": "error",
  "no-use-before-define": "error",
  "no-underscore-dangle": ["error", { allow: ["__dirname", "__filename"] }],
  "no-useless-return": "error",
  "no-duplicate-imports": "off", // Oxfmt merges and reorders imports, and that trips this rule.
  "max-classes-per-file": "off",
  "max-params": "off",
  "max-lines-per-function": "off",
  "max-statements": "off",
  "id-length": "off",
  "func-style": ["error", "expression"],
  complexity: "error",
  "init-declarations": "error",
  "one-var": "off",
  "prefer-destructuring": "off",
  "require-await": "off", // Typescript/require-await is type-aware and better.
  "sort-imports": "off", // Oxfmt owns import ordering.
  "sort-keys": "off",
  "arrow-body-style": ["error", "as-needed", { requireReturnForObjectLiteral: true }],
  "new-cap": ["error", { properties: false }], // Effect's API uses uppercase namespaces, for example Config.String and Schema.Struct.
  "oxc/erasing-op": "error",
  "oxc/no-async-await": "off",
  "oxc/no-barrel-file": "error",
  "oxc/no-map-spread": "off", // The Object.assign alternative reintroduces accidental mutation.
  "oxc/no-optional-chaining": "off",
  "oxc/no-rest-spread-properties": "off",
  "promise/avoid-new": "error",
  "promise/no-multiple-resolved": "error",
  "promise/prefer-await-to-callbacks": "off",
  "promise/prefer-await-to-then": "error",
  "unicorn/no-array-reduce": "error",
  "unicorn/no-await-expression-member": "error",
  "unicorn/no-null": "off", // Drizzle and React both deal in null.
  "unicorn/no-nested-ternary": "off",
  "unicorn/no-process-exit": "off",
  "unicorn/no-useless-collection-argument": "error",
  "unicorn/number-literal-case": "off", // Oxfmt lowercases hex digits.
  "unicorn/prefer-export-from": "off", // This rule conflicts with keeping imports grouped and typed alongside their use.
  "unicorn/prefer-global-this": "off",
  "unicorn/prefer-ternary": "error",
  "unicorn/throw-new-error": "off", // This rule fires on `class X extends Schema.TaggedError<X>()(...)`, where nothing is thrown.
  "unicorn/max-nested-calls": "off",
  "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
  "import/exports-last": "error",
  "import/first": "error",
  "import/group-exports": "error",
  "import/max-dependencies": "off",
  "import/no-default-export": "error",
  "import/no-named-default": "error",
  "import/no-named-export": "off", // The `restriction` category enables this rule. Named exports are the only export style here.
  "import/no-namespace": "off",
  "import/no-nodejs-modules": "off", // These are full-stack workspaces. The bundler catches client-side Node imports.
  "import/no-relative-parent-imports": "error",
  "import/prefer-default-export": "off",
  "import/unambiguous": "error",
  "node/callback-return": "off", // The rule reports false positives in every case.
  "node/no-process-env": "error", // Read config through @acme/env.
  "node/no-top-level-await": "off", // Bun runs ESM natively.
  "typescript/array-type": "error",
  "typescript/consistent-type-definitions": ["error", "type"],
  "typescript/explicit-function-return-type": "off",
  "typescript/explicit-member-accessibility": "off",
  "typescript/explicit-module-boundary-types": "off",
  "typescript/no-import-type-side-effects": "error",
  "typescript/no-non-null-assertion": "error",
  "typescript/no-confusing-void-expression": "error",
  "typescript/parameter-properties": "error",
  "typescript/prefer-readonly-parameter-types": "off",
  "typescript/unified-signatures": "error",
  "typescript/use-unknown-in-catch-callback-variable": "error",
}

const baseIgnorePatterns = [
  "**/node_modules/**",
  "**/dist/**",
  "**/.output/**",
  "**/.tanstack/**",
  "**/.turbo/**",
  "**/drizzle/**",
  "**/*.d.ts",
  "**/*.config.{js,ts,mjs,cjs}",
  "**/routeTree.gen.ts",
  "**/tsconfig.tsbuildinfo",
]

const baseOverrides: OverridesConfig = [
  {
    files: ["oxlint.config.ts", "apps/*/oxlint.config.ts", "packages/*/oxlint.config.ts"],
    rules: {
      "import/exports-last": "off",
      "import/group-exports": "off",
      "import/no-default-export": "off",
      "oxc/no-barrel-file": "off",
    },
  },
]

/**
 * Drizzle's schema modules are the one legitimate aggregation point. The
 * drizzle-kit config globs them, and the client passes the whole namespace to
 * `drizzle({ schema })`. The Better Auth generator emits one `export const`
 * per table, so those files cannot group exports.
 */
const schemaFileOverrides: OverridesConfig = [
  {
    files: ["**/schema.ts", "**/schema/**/*.ts"],
    rules: {
      "import/group-exports": "off",
      "oxc/no-barrel-file": "off",
    },
  },
]

const rootIgnorePatterns = [...baseIgnorePatterns, "packages/ui/src/components/**"]

export {
  baseIgnorePatterns,
  baseOverrides,
  basePlugins,
  baseRules,
  categories,
  rootIgnorePatterns,
  schemaFileOverrides,
}
export type { OverridesConfig, RuleConfig }
