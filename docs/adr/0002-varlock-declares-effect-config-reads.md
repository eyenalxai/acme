# Varlock declares the environment, Effect Config reads it

`.env.schema` is the only place an environment variable is declared, and varlock is
the only thing that reads `.env` files. Application code never touches `process.env`;
it reads config through Effect `Config` recipes declared in `@acme/env`.

The two systems do not overlap. Varlock owns validation, secret storage, leak
scanning and `bunfig.toml`'s `env = false`. Effect `Config` owns typed access and
DI-friendly supply. Both are needed, and neither replaces the other.

## Consequences

- Adding a variable means editing `.env.schema` _and_ adding a `Config` recipe. The
  key name is therefore written twice. That duplication is the cost of not
  hand-writing a varlock→Effect bridge.
- We deliberately do **not** use varlock's `@generateTsTypes`. Its generated
  `env.d.ts` augments the `process.env` and `import.meta.env` globals, and that
  augmentation is useless when code cannot read either global. It is also a per-package
  generated file that must be gitignored and kept fresh. Browser config reaches the
  client through SSR (router context / loader data), not through injected globals.
- `ConfigProvider`'s default reads the environment, so nothing has to be provided for
  the common case.
