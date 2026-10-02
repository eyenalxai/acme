# Secrets never enter the repository

The repository stores no secret, and no committed file holds a live reference to one.
`.env.schema` declares every item, validates its shape and holds the
environment-independent defaults. Development reads its values from `.env.local`,
which is gitignored. Staging and production receive every value as an injected
environment variable. `process.env` has the highest precedence, so an injected value
always wins.

A reference in a shared file is a correctness risk. `op()` names exactly one vault
item, and every environment shares `.env.schema`. A reference written there can name
only `op://Acme/Local/...`, and every environment resolves it. A deploy that lacks an
injected value would then serve development credentials and report nothing wrong. A
missing value must fail the load instead.

A developer who wants 1Password locally puts `op()` references in `.env.local`. The
vault stays the source of truth for that developer, and no committed file holds a live
`op()` reference. `.env.schema` holds one commented example, which nothing resolves.

`@defaultSensitive=true` is in the schema header. A new item is sensitive unless it is
explicitly marked `@public`. Only `APP_ENV`, `APP_URL` and `GITHUB_CLIENT_ID` are
public today. Never relax this default. The same key holds throwaway credentials
locally and real ones in staging and production. Sensitivity is a property of the key,
not of the current environment. varlock redacts sensitive values in its output.
`PublicTypedEnvSchema` excludes them, and the Vite plugin refuses them in client code.

`.env.schema` and `.env.development` are committed. Staging and production have no
committed environment file. The deploy platform injects every value for them,
including `APP_ENV` and the secrets. `.env.local` and `.env.[env].local` are
gitignored, and a developer's real values go there.

## Consequences

- A missing value fails the load in staging and production. `.env.schema` marks the
  deployed secrets `@required=forEnv(staging, production)`.
- Nothing committed can raise a 1Password approval prompt. A prompt appears only when
  someone resolves a reference that they added to `.env.local`.
- A 1Password service account makes resolution headless. Its token goes in `.env.local`
  as `OP_TOKEN`. `allowAppAuth` is consulted only when that token is empty. We scope the
  shared `@initOp(..., allowAppAuth=forEnv(development, test))` to development and test.
  A deployed environment can never fall back to a human's 1Password session.
- `varlock codegen`, `tsc`, `lint` and `format` never resolve a secret at all, so
  `bun run check` cannot prompt.
- `@initOp` is inert until something resolves a reference, which is what makes the
  arrangement safe. We verified this by loading a schema that declared
  `@initOp(allowAppAuth=false)` with no token and no `op()` call, and the schema
  resolved cleanly.
- CI and deployed environments need no 1Password access when the platform injects the
  values. varlock never evaluates a reference for an item that is already provided. We
  verified this by pointing a reference at a nonexistent vault. The load exited
  non-zero alone and zero with the values injected.
- A reference that cannot be resolved is a hard failure. `varlock load` exits 1, even
  for an item that is `@required=forEnv(...)` only outside development. The plugin's
  `allowMissing` yields `undefined` for an item that does not exist instead. We do not
  use it, so a missing secret stops the process and does not surface as `undefined` at
  runtime. `allowMissing` does not rescue a wrong vault name either, because
  authentication and format errors throw regardless.
