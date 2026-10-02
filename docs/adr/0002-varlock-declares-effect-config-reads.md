# Varlock declares the environment, Effect Config reads it

`.env.schema` is the only place an environment variable is declared, and varlock is
the only thing that reads `.env` files. Application code never touches `process.env`;
it reads config through Effect `Config` recipes declared in `@acme/env`.

The two systems do not overlap. Varlock owns validation, secret storage, leak
scanning and `bunfig.toml`'s `env = false`, which stops Bun's own `.env` loading from
shadowing varlock. Effect `Config` owns typed access and DI-friendly supply. Both are
needed, and neither replaces the other.

## Consequences

- Adding a variable means editing `.env.schema` _and_ adding a `Config` recipe. The
  key name is therefore written twice. That duplication is the cost of not
  hand-writing a varlock→Effect bridge.
- We use varlock's `@generateTsTypes`, declared as
  `@generateTsTypes(path=./packages/env/src/env.d.ts, exposeEnv=none, processEnv=none, importMetaEnv=none, auto=false)`.
  The generated file is a pure, ambient-free types module: no `declare module`, no
  `declare global`, no `namespace NodeJS`, no `import.meta.env` augmentation. That
  design matters, because nothing here can read either global. Browser config reaches
  the client through SSR (router context / loader data), not through injected globals.
- `packages/env/src/env.d.ts` is committed. It is an input, not a build output.
  Without it, every package that imports `@acme/env/config` stops typechecking, and
  the failure is indirect and confusing. Only
  `bun run --filter @acme/env codegen` produces it, and `tsc` already chains that
  command. The file depends on the schema alone, so the output is deterministic in
  every environment. `codegen` formats its own output, because varlock emits trailing
  markdown spaces and semicolons that disagree with the repo's formatter. Without that
  formatting, the committed file is canonical only when `format` runs after `codegen`,
  and Turbo runs the two in parallel.
- `packages/env/src/config.ts` imports `CoercedEnvSchema` from the generated file
  directly and narrows every key through an `envKey()` helper. A misspelled key is
  therefore a compile error (`'"APP_URLL"' is not assignable to parameter of type 'keyof CoercedEnvSchema'`),
  not a boot-time `ConfigError`.
- Do not switch to `exposeEnv=global`. Module augmentation ties correctness to build
  ordering. The augmenting file must be inside each consumer's TypeScript program, and
  `packages/db` compiling `env/src/config.ts` does not include it. That surfaces as
  `Property 'APP_ENV' does not exist on type 'TypedEnvSchema'`.
- `ConfigProvider`'s default reads the environment, so nothing has to be provided for
  the common case.
