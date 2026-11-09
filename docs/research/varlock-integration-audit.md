# Varlock integration audit

- **Date:** 2026-11-09
- **Status:** Structurally complete. Behind varlock 1.24.0. Not production-safe until the Turbo environment allowlist is fixed and the runtime dependencies are declared.
- **Repository:** `/home/ulezot/.t3/worktrees/acme/t3-9d15b7a4`, HEAD `56bd343`.
- **Varlock checkout:** `/home/ulezot/Projects/other/varlock`, CLI source 1.24.0, Vite integration source 1.5.5.
- **Method:** read the repository files in scope, read the varlock source and docs, checked npm metadata, and ran `bunx varlock@1.24.0` against copies of the schema in `/tmp/opencode`. Also ran a minimal Turbo 2.11.7 workspace to check strict env filtering. No existing repository file changed. `.env.local` was not read.
- **Citation keys:** `varlock/...` is `/home/ulezot/Projects/other/varlock/...`. `node_modules/turbo/...` is `/home/ulezot/Projects/js/acme/node_modules/turbo/...`. All other paths are relative to the repository root.

## Answer

The repository has the full varlock shape. It uses the schema as the only declaration point, validates at load, installs the Vite plugin, wraps DB and auth scripts with `varlock run`, reads values through Effect `Config`, commits generated types, configures 1Password, and enables runtime leak protection. It has no direct `@t3-oss/env` or `dotenvx` dependency.

It is not complete against varlock 1.24.0 and `@varlock/vite-integration` 1.5.5. The main defects are:

1. **Turbo drops almost every varlock value.** `turbo.json` allows only `NODE_ENV`, `APP_ENV`, `VARLOCK_ENV` and `PORTLESS`. It drops `APP_URL`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and `OP_TOKEN`. A production build through Turbo with `APP_ENV=production` fails on the required `APP_URL`. A production migrate through Turbo with `APP_ENV=production` falls back to the committed local `DATABASE_URL` default. This is the highest-risk gap. [`turbo.json:13-14`] [`.env.schema:22`] [`.env.schema:28`] [`packages/db/package.json:15`] [`package.json:21`]
2. **The runtime needs two devDependencies.** `apps/web` starts with `varlock run`. The schema also loads `@varlock/1password-plugin`. Both are devDependencies. A production install that prunes devDependencies cannot start the server. [`apps/web/package.json:11`] [`package.json:31`] [`package.json:39`]
3. **No CI validation and no file-level leak scan.** The routine verification script is `bun run check`. It does not run `varlock load` and it does not run `varlock scan`. [`package.json:19`]
4. **The pins are behind current releases.** The repo pins varlock 1.21.1 and Vite integration 1.5.2. Current is 1.24.0 and 1.5.5. The 1Password plugin is 2.0.4; current is 2.0.6. [`package.json:39`] [`packages/env/package.json:26`] [`apps/web/package.json:39`] [`package.json:31`]
5. **Development validation passes values the app requires.** `varlock load` succeeds with `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` undefined. `packages/auth` would fail at import when they are missing. [`.env.schema:48`] [`.env.schema:60`] [`.env.schema:63`] [`.env.schema:49`] [`packages/env/src/config.ts:26-30`] [`packages/auth/src/server.ts:9-10`]
6. **Node is required but not declared.** Vite 8.3.3 requires Node `^20.19.0 || >=22.12.0`. Varlock 1.24.0 requires Node `>=22.3.0`. The root `engines` lists Bun only. [`package.json:41-42`] [`README.md:12`]
7. **`ssrInjectMode` is implicit.** The plugin defaults to `init-only`. The repo does not state that contract. [`apps/web/vite.config.ts:22`] [`varlock/packages/integrations/vite/src/index.ts:414`]
8. **A repo-wide `varlock scan` fails on the committed database URL.** `DATABASE_URL` is sensitive by default and has a literal default in the schema. `varlock scan` flags the schema file and exits 1. [`.env.schema:1`] [`.env.schema:28`] [`packages/env/src/env.d.ts:27`]

## Evidence

### 1. Schema as the source of truth

- `.env.schema` is the only place that declares environment variables. [`/home/ulezot/.t3/worktrees/acme/t3-9d15b7a4/.env.schema:1`]
- The schema sets `@defaultSensitive=true` and `@defaultRequired=infer`. [`.env.schema:1`]
- The schema sets `@currentEnv=$APP_ENV`. [`.env.schema:2`]
- The schema sets `@generateTsTypes(..., auto=false)`. [`.env.schema:3`]
- The schema loads the 1Password plugin. [`.env.schema:4`]
- The schema initializes 1Password with `token=$OP_TOKEN`, `allowAppAuth=forEnv(development, test)`, `account=my`, and `cacheTtl=1h`. [`.env.schema:5`]
- `APP_ENV` is an enum with four values and defaults to `development`. [`.env.schema:10-12`]
- `APP_URL` is `@type=url`, `@public`, and `@required`. [`.env.schema:19-22`]
- `DATABASE_URL` is `@type=string(startsWith=postgres)` and has a default. [`.env.schema:27-28`]
- `OP_TOKEN` is `@type=opServiceAccountToken`. [`.env.schema:33-34`]
- The three deployed secrets are `@required=forEnv(staging, production)`. [`.env.schema:48`] [`.env.schema:60`] [`.env.schema:63`]
- `GITHUB_CLIENT_ID` is `@public`. [`.env.schema:58`]
- `.env.development` sets only `APP_URL`. [`.env.development:3`]
- `.env.schema` and `.env.development` are the only tracked env files. [`.gitignore:12-15`] Checked `git ls-files`; it lists exactly those two env files.

### 2. Validation

- `varlock load` is the documented validation command. [`AGENTS.md:230`]
- `varlock load` exits 0 in development on a copy of the schema. Verified with `bunx varlock@1.24.0 load` in `/tmp/opencode/varlock-repo-scan`.
- `varlock load` exits 1 in production without the injected values. Verified with `APP_ENV=production bunx varlock@1.24.0 load` in the same directory.
- `varlock load` exits 1 in the test environment without `APP_URL`. Verified with `APP_ENV=test bunx varlock@1.24.0 load` in the same directory.
- `varlock run` validates before it starts the child command. [`varlock/packages/varlock-website/src/content/docs/reference/cli/load-and-run.mdx:106`]
- `bun run check` runs `format`, `lint` and `tsc`. It does not run `varlock load`. [`package.json:19`] [`turbo.json:35-42`]

### 3. Vite plugin

- `apps/web/vite.config.ts` imports `varlockVitePlugin`. [`apps/web/vite.config.ts:3`]
- The plugin is the first entry in the plugin list. [`apps/web/vite.config.ts:22`]
- The varlock TanStack Start test config uses the same order. [`varlock/framework-tests/frameworks/tanstack-start/files/configs/vite.config.node.ts:1-11`]
- `apps/web` points varlock at the repository root with `varlock.loadPath`. [`apps/web/package.json:51-53`]
- The plugin reads that path for all commands and integrations. [`varlock/packages/varlock-website/src/content/docs/integrations/vite.mdx:85-88`]
- The plugin's SSR init call is `initVarlockRuntime()`. [`varlock/packages/integrations/vite/src/index.ts:549-550`]
- `initVarlockRuntime` patches the console, process streams, `ServerResponse` and `Response`. [`varlock/packages/varlock/src/runtime/init.ts:27-31`]
- The plugin injects the init import into the SSR entry. [`varlock/packages/integrations/vite/src/index.ts:899`]
- The plugin defaults `ssrInjectMode` to `init-only`. [`varlock/packages/integrations/vite/src/index.ts:414`]
- The only automatic override is the Cloudflare prerender environment, which uses `resolved-env`. [`varlock/packages/integrations/vite/src/index.ts:434-435`]
- Node target TanStack Start is covered by the framework test suite. [`varlock/framework-tests/frameworks/tanstack-start/tanstack-shared.ts:41-42`] [`varlock/framework-tests/frameworks/tanstack-start/tanstack-vite8.test.ts:1-8`]

### 4. `varlock run` on scripts

- `db:generate`, `db:migrate`, `db:push` and `db:studio` run under `varlock run`. [`packages/db/package.json:14-17`]
- `auth:generate` runs under `varlock run`. [`packages/auth/package.json:14`]
- `apps/web` starts with `varlock run --path ../.. -- bun --bun dist/server/server.js`. [`apps/web/package.json:11`]
- `drizzle.config.ts` reads `process.env.DATABASE_URL`, but `drizzle-kit` runs inside `varlock run`. [`packages/db/drizzle.config.ts:6`] [`packages/db/package.json:15`]
- `vite dev` and `vite build` load and validate env through the plugin. [`varlock/packages/varlock-website/src/content/docs/integrations/vite.mdx:18`]
- `typegen`, `tsc`, `format` and `lint` do not need env values. [`apps/web/package.json:12-15`] [`packages/env/package.json:15-17`]

### 5. Effect Config reads

- `packages/env/src/config.ts` declares every recipe with `Config`. [`packages/env/src/config.ts:18-30`]
- `APP_ENV` uses `Config.Literals`. [`packages/env/src/config.ts:18-20`]
- `APP_URL` uses `Config.URL`. [`packages/env/src/config.ts:22`]
- `DATABASE_URL`, `BETTER_AUTH_SECRET` and `GITHUB_CLIENT_SECRET` use `Config.Redacted`. [`packages/env/src/config.ts:24-30`]
- `serverConfig` combines all six values. [`packages/env/src/config.ts:32-39`]
- `packages/auth` runs `serverConfig` at module load with `Effect.runSync`. [`packages/auth/src/server.ts:9-10`]
- Effect `Config` reads the process environment through the default `ConfigProvider`. [`docs/adr/0002-varlock-declares-effect-config-reads.md:40-41`]
- The generated type file declares `CoercedEnvSchema` and `EnvSchemaAsStrings`. [`packages/env/src/env.d.ts:6-85`]
- `config.ts` imports `CoercedEnvSchema` and narrows every key through `envKey()`. [`packages/env/src/config.ts:3-9`]

### 6. Generated types

- `@generateTsTypes` writes `./packages/env/src/env.d.ts`. [`.env.schema:3`]
- The settings are `exposeEnv=none`, `processEnv=none`, `importMetaEnv=none` and `auto=false`. [`.env.schema:3`]
- `packages/env` runs `varlock codegen --path ../..` and then `oxfmt`. [`packages/env/package.json:14`]
- `packages/env` runs `codegen` before `tsc`. [`packages/env/package.json:15`]
- The generated file is committed, not ignored. [`.gitignore:55-58`]
- `auto=false` disables generation during `load` and `run`. [`varlock/packages/varlock-website/src/content/docs/guides/code-generation.mdx:66-71`]
- `exposeEnv=none` emits type definitions only, with no `ENV` binding. [`varlock/packages/varlock-website/src/content/docs/reference/root-decorators.mdx:740-748`]
- The generated file has `// @ts-nocheck` and `/* eslint-disable */`. [`packages/env/src/env.d.ts:4-5`]
- `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are optional in the generated type. [`packages/env/src/env.d.ts:51`] [`packages/env/src/env.d.ts:66`] [`packages/env/src/env.d.ts:72`]
- The repo does not import `varlock/env` or use `ENV`. Searched `apps` and `packages`; no import. The Vite plugin's `ENV` typing is therefore unused. This is deliberate: Effect `Config` is the read path. [`docs/adr/0002-varlock-declares-effect-config-reads.md:3-10`]
- `exposeEnv=none` means the generated file has no `ENV` binding and no global augmentation. [`docs/adr/0002-varlock-declares-effect-config-reads.md:17-22`]

### 7. 1Password

- The 1Password plugin is a root devDependency. [`package.json:31`]
- The schema loads the plugin without a version. [`.env.schema:4`]
- In a JavaScript project, the plugin must be installed locally and loaded without a version. [`varlock/packages/varlock-website/src/content/docs/guides/plugins.mdx:32`]
- `OP_TOKEN` is typed `opServiceAccountToken`. [`.env.schema:33`]
- That type is `sensitive` and `internal` by default. [`varlock/packages/plugins/1password/src/plugin.ts:896-899`]
- The docs show `@sensitive @internal` in the setup example. [`varlock/packages/varlock-website/src/content/docs/plugins/1password.mdx:71-72`]
- The service account token is the secret-zero. [`varlock/packages/varlock-website/src/content/docs/plugins/1password.mdx:54`]
- `allowAppAuth` is limited to development and test. [`.env.schema:5`]
- `cacheTtl=1h` limits repeated approvals. [`.env.schema:5`]
- No committed file holds an `op()` reference. [`.env.schema:39-40`]
- `varlock load` and `varlock run` can raise a 1Password prompt. [`AGENTS.md:254-255`]
- `varlock codegen`, `tsc`, `lint` and `format` do not resolve secrets. [`AGENTS.md:257`]
- `.env.local` is absent in this worktree. 1Password resolution was not exercised.

### 8. Leak protection and redaction

- `@defaultSensitive=true` makes every unmarked item sensitive. [`.env.schema:1`]
- `@preventLeaks` defaults to `true`. [`varlock/packages/varlock-website/src/content/docs/reference/root-decorators.mdx:427-435`]
- The Vite init calls `initVarlockRuntime()`. [`varlock/packages/integrations/vite/src/index.ts:549-550`]
- The runtime patches `ServerResponse` and `Response`. [`varlock/packages/varlock/src/runtime/init.ts:27-31`]
- `varlock run` redacts the child's piped stdout and stderr by default. [`varlock/packages/varlock-website/src/content/docs/reference/cli/load-and-run.mdx:109`]
- `@redact` redacts `console` methods by default. [`varlock/packages/varlock-website/src/content/docs/reference/root-decorators.mdx:374`]
- In-process stdout redaction is opt-in with `@redact={stdout=true}`. [`varlock/packages/varlock-website/src/content/docs/reference/root-decorators.mdx:391`]
- Effect's logger uses `globalThis.console`. [`/home/ulezot/Projects/other/effect/packages/effect/src/Console.ts:59`]
- Effect's default `ConsoleRef` returns `globalThis.console`. [`/home/ulezot/Projects/other/effect/packages/effect/src/internal/effect.ts:6584-6587`]
- The repo uses `Logger.consoleJson` in production and `Logger.consolePretty()` in other environments. [`packages/api/src/logging.ts:22-30`]
- The repo does not set `@redact={stdout=true}`. [`.env.schema:1-5`]
- Runtime leak protection is per value. A transformed copy is not detected. [`varlock/packages/varlock-website/src/content/docs/guides/secrets.mdx:271`]
- Build-time scanning is a separate command. [`varlock/packages/varlock-website/src/content/docs/guides/secrets.mdx:287`]

### 9. Committed files and dependencies

- `.env` and `.env.*` are ignored. [`.gitignore:12-13`]
- `.env.schema` and `.env.development` are unignored. [`.gitignore:14-15`]
- `git ls-files` returns only those two env files.
- No `@t3-oss` entry exists in `bun.lock`. Searched `bun.lock` for `@t3-oss`; zero matches.
- `@dotenvx/dotenvx` appears only as a transitive dependency of `shadcn` and `@shadcn/registry`. [`bun.lock:621`] [`bun.lock:1365`]
- No workspace `package.json` declares `dotenvx`. Searched every `package.json`; no direct dependency.
- Bun's own `.env` loading is disabled. [`bunfig.toml:2`]
- The Bun docs recommend `env = false` for the same reason. [`varlock/packages/varlock-website/src/content/docs/integrations/bun.mdx:16`]

### 10. Versions

| Package                     | Current | Current source                                        | Notes                                                                                                             |
| --------------------------- | ------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `varlock`                   | 1.21.1  | [`package.json:39`], [`packages/env/package.json:26`] | 1.24.0 is current. [`https://registry.npmjs.org/varlock/1.24.0`]                                                  |
| `@varlock/vite-integration` | 1.5.2   | [`apps/web/package.json:39`]                          | 1.5.5 is current. It peers on `varlock ^1.24.0`. [`https://registry.npmjs.org/@varlock%2Fvite-integration/1.5.5`] |
| `@varlock/1password-plugin` | 2.0.4   | [`package.json:31`]                                   | 2.0.6 is current. It peers on `varlock ^1.24.0`. [`https://registry.npmjs.org/@varlock%2F1password-plugin/2.0.6`] |
| `vite`                      | 8.3.3   | [`apps/web/package.json:45`]                          | Requires Node `^20.19.0                                                                                           |     | >=22.12.0`. [`https://registry.npmjs.org/vite/8.3.3`] |
| `turbo`                     | 2.11.7  | [`package.json:37`]                                   | Defaults to strict env mode. [`node_modules/turbo/docs/reference/configuration.mdx:273-277`]                      |

## Gaps and recommendations

### P0. Add the varlock keys to the Turbo environment allowlist

**State.** `turbo.json` allows `NODE_ENV`, `APP_ENV` and `VARLOCK_ENV` in `globalEnv`, and `PORTLESS` in `globalPassThroughEnv`. [`turbo.json:13-14`]

**Effect.** Turbo 2.11.7 defaults to `envMode: "strict"`. [`node_modules/turbo/docs/reference/configuration.mdx:273-277`] Strict mode passes only variables listed in `env`, `globalEnv` or `globalPassThroughEnv`. [`varlock/packages/varlock-website/src/content/docs/guides/monorepos.mdx:133-139`] The deploy platform injects every value, including `APP_ENV` and the secrets. [`AGENTS.md:246-248`]

**Concrete failures.**

- A `turbo run build` with `APP_ENV=production` loses `APP_URL`. `APP_URL` is `@required`. The plugin exits the build when the config is invalid. [`.env.schema:22`] [`package.json:14`] [`varlock/packages/integrations/vite/src/index.ts:778-779`]
- A `turbo run db:migrate` with `APP_ENV=production` loses `DATABASE_URL`. Varlock falls back to the committed local default. [`.env.schema:28`] [`packages/db/package.json:15`] [`package.json:21`]
- A `turbo run auth:generate` with `APP_ENV=production` loses `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. `packages/auth` would fail at import. [`packages/auth/src/server.ts:9-10`]

**Verified.** A minimal Turbo 2.11.7 workspace with `globalEnv: ["APP_ENV"]` and `globalPassThroughEnv: ["PORTLESS"]` printed `APP_ENV=production APP_URL= DATABASE_URL=`. The test is in `/tmp/opencode/turbo-env-test`. It confirms that unlisted values are removed from the task environment.

**Second failure mode.** If `APP_ENV` is not set, the build uses the schema default `development` and loads `.env.development`. The build then resolves `APP_URL` from `.env.development`. [`.env.schema:12`] [`.env.development:3`]

**Change.** Add `APP_URL` and `GITHUB_CLIENT_ID` to `globalEnv`, next to `APP_ENV`, `NODE_ENV` and `VARLOCK_ENV`. Add `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_SECRET` and `OP_TOKEN` to `globalPassThroughEnv`, next to `PORTLESS`. Add `.env.development` to `globalDependencies` so a change to the committed development origin invalidates the cache. [`turbo.json:4-14`]

**Why the split.** `globalEnv` values contribute to the cache key. `globalPassThroughEnv` values are available but do not. [`node_modules/turbo/docs/reference/configuration.mdx:864`] The varlock guide requires the values to reach the task. [`varlock/packages/varlock-website/src/content/docs/guides/monorepos.mdx:133-139`] `globalPassThroughEnv` meets that requirement. Secrets should not invalidate a build that does not inline them.

**Alternative.** Put every key in `globalEnv` if a secret change must invalidate the build cache. The trade-off is cache churn on every secret rotation.

**Do not** set `envMode: "loose"`. That passes every ambient variable and weakens cache correctness. [`node_modules/turbo/docs/reference/configuration.mdx:277`]

**Risk.** Low. No runtime code changes. The change restores values that the platform already injects.

### P0. Declare the runtime dependencies and the Node engine

**State.** `apps/web` starts with `varlock run`. [`apps/web/package.json:11`] `varlock` is a root devDependency. [`package.json:39`] The schema loads `@varlock/1password-plugin`, which is also a root devDependency. [`package.json:31`] [`.env.schema:4`]

**Effect.** A production install that prunes devDependencies has no `varlock` CLI. The start command fails before Bun starts. [`varlock/packages/varlock-website/src/content/docs/integrations/bun.mdx:46`] The same install has no 1Password plugin. Varlock cannot load the schema, because `@plugin` and `@initOp` need the plugin. [`varlock/packages/varlock-website/src/content/docs/guides/plugins.mdx:32`]

**Change.** Declare `varlock` and `@varlock/1password-plugin` as production dependencies in the workspace that owns the deployed `node_modules`, or make the deploy image install devDependencies. [`varlock/packages/varlock-website/src/content/docs/integrations/bun.mdx:55`] Add `"node": ">=22.12.0"` to the root `engines`. [`package.json:41-42`] Add Node 22.12 or later to the README requirements. [`README.md:12`]

**Why Node.** Vite 8.3.3 requires Node `^20.19.0 || >=22.12.0`. [`https://registry.npmjs.org/vite/8.3.3`] Varlock 1.24.0 requires Node `>=22.3.0`. [`https://registry.npmjs.org/varlock/1.24.0`] The `varlock` CLI entry has a Node shebang. [`varlock/packages/varlock/bin/cli.js:1`] The start script uses `bun --bun` for the server, so the image needs both Node and Bun. [`apps/web/package.json:11`]

**Alternative.** Use the standalone varlock binary to remove the Node requirement for the CLI. [`varlock/packages/varlock-website/src/content/docs/getting-started/installation.mdx`]

**Risk.** Low. This is a packaging change. Verify the deploy image after the change.

### P1. Upgrade varlock, the Vite integration and the 1Password plugin

**State.** The repo pins 1.21.1, 1.5.2 and 2.0.4. [`package.json:31`] [`package.json:39`] [`packages/env/package.json:26`] [`apps/web/package.json:39`]

**Target.** `varlock@1.24.0`, `@varlock/vite-integration@1.5.5`, `@varlock/1password-plugin@2.0.6`. The Vite integration and the 1Password plugin both peer on `varlock ^1.24.0`. [`https://registry.npmjs.org/@varlock%2Fvite-integration/1.5.5`] [`https://registry.npmjs.org/@varlock%2F1password-plugin/2.0.6`]

**Relevant changes.**

- 1.22 fixes `varlock scan --install-hook` in git worktrees. [`varlock/packages/varlock/CHANGELOG.md:92`] This repository is a linked worktree; `.git` is a file. [`/home/ulezot/.t3/worktrees/acme/t3-9d15b7a4/.git:1`]
- 1.22 renames `@redactLogs` to `@redact` and adds `@redact={stdout=true}`. [`varlock/packages/varlock/CHANGELOG.md:78`]
- 1.22 bundles built-in icons, so `@generateTsTypes` does not fetch them. [`varlock/packages/varlock/CHANGELOG.md:76`]
- 1.23 tightens the `url` data type. `APP_URL` uses `@type=url` and is valid. [`varlock/packages/varlock/CHANGELOG.md:59`] [`.env.schema:20`]
- 1.24 adds `varlock/auto-init` and `initVarlockRuntime`. The Vite integration 1.5.5 uses `varlock/init`. [`varlock/packages/varlock/CHANGELOG.md:43-47`] [`varlock/packages/integrations/vite/CHANGELOG.md:27-29`]
- 1.24 puts `/* eslint-disable */` above `// @ts-nocheck` in generated types. Regenerate `env.d.ts`. [`varlock/packages/varlock/CHANGELOG.md:51-52`]
- 1Password 2.0.5 fixes invalid service-account token reporting and an `op()` hang. [`varlock/packages/plugins/1password/CHANGELOG.md:21-30`]
- 1Password 2.0.6 fixes 1Password Environments with stable `op` releases. The repo does not use `opLoadEnvironment`. [`varlock/packages/plugins/1password/CHANGELOG.md:15-19`]

**Change.** Update the `varlock` pins in the root and `packages/env`, the `@varlock/vite-integration` pin in `apps/web`, and the `@varlock/1password-plugin` pin in the root. Run `bun install` and commit `bun.lock`. Run `bun run --filter @acme/env codegen` and commit `packages/env/src/env.d.ts`. [`packages/env/package.json:14`]

**Risk.** Low. The release age rule passes: 1.24.0 and 1.5.5 were published 2026-10-29, and the 3-day minimum is satisfied. [`bunfig.toml:6`] [`varlock/packages/varlock/CHANGELOG.md:39`] [`varlock/packages/integrations/vite/CHANGELOG.md:21`]

### P1. Add CI validation and a codegen drift check

**State.** No CI workflow exists. Checked the repository root and `.github`; only `docker-compose.yml` is present. [`/home/ulezot/.t3/worktrees/acme/t3-9d15b7a4/docker-compose.yml:1`] The routine verification script is `bun run check`. [`package.json:19`]

**Change.** Add a CI job with these steps:

1. `bun install --frozen-lockfile`
2. `bunx varlock load --agent` with `APP_ENV=development` for pull requests, or with staging secrets on a protected branch. [`README.md:31-32`]
3. `bun run --filter @acme/env codegen && git diff --exit-code -- packages/env/src/env.d.ts`
4. `bun run check`
5. `bun run build`
6. `bunx varlock scan ./apps/web/dist` after the build. [`varlock/packages/varlock-website/src/content/docs/reference/cli/project.mdx:52`]

**Why a drift check.** `varlock codegen` writes the file in place. It does not have a `--check` flag. [`varlock/packages/varlock-website/src/content/docs/reference/cli/cache-and-codegen.mdx:56-73`] `tsc` regenerates the file, so a stale committed file does not fail the build by itself. [`packages/env/package.json:15`]

**Why `--agent`.** `--agent` redacts sensitive values in the JSON output. [`varlock/packages/varlock-website/src/content/docs/reference/cli/load-and-run.mdx:24`]

**Risk.** Low. The load step can prompt for 1Password if `.env.local` has `op()` references. Use `OP_TOKEN` for a headless run. [`docs/adr/0004-secrets-never-enter-the-repository.md:38-41`]

### P1. Resolve the `varlock scan` conflict before adding a hook

**State.** `DATABASE_URL` is sensitive by default. [`.env.schema:1`] The generated type marks it sensitive. [`packages/env/src/env.d.ts:27`] The schema contains a literal default. [`.env.schema:28`]

**Effect.** `varlock scan` collects every non-empty sensitive string. [`varlock/packages/varlock/src/cli/commands/scan.command.ts:466`] It scans every git-tracked file by default. [`varlock/packages/varlock/src/cli/commands/scan.command.ts:484-486`] It reads the schema file. [`varlock/packages/varlock/src/cli/commands/scan.command.ts:214-250`] A run against a copy of the schema exited 1 and flagged `DATABASE_URL` in `.env.schema`. Verified with `bunx varlock@1.24.0 scan` in `/tmp/opencode/varlock-repo-scan`.

**Consequence.** A repo-wide pre-commit hook from `varlock scan --install-hook` fails on every commit in a clean checkout. [`varlock/packages/varlock/src/cli/commands/scan.command.ts:337-338`] The hook command is plain `varlock scan`, not `--staged`. [`varlock/packages/varlock/src/cli/commands/scan.command.ts:337`]

**Do not** mark `DATABASE_URL` as `@public` or `@sensitive=false`. That disables redaction and leak protection for the production database URL. [`docs/adr/0004-secrets-never-enter-the-repository.md:20-25`]

**Change.** Use `varlock scan ./apps/web/dist` as a post-build check. Explicit paths bypass git filtering and include `dist`. [`varlock/packages/varlock-website/src/content/docs/reference/cli/project.mdx:52`] If a source-level scan is mandatory, move the local database URL to `.env.local`, which is gitignored. [`.gitignore:13`] This changes the quickstart: a fresh clone then needs `.env.local` before `db:migrate`. [`README.md:17-21`] Another option is to build the URL from non-sensitive parts, so the resolved value never appears in a tracked file.

**Risk.** Medium for a repo-wide hook. Low for a build-output scan.

### P1. Align the schema requiredness with the app

**State.** The three deployed secrets are required only in staging and production. [`.env.schema:48`] [`.env.schema:60`] [`.env.schema:63`] The generated type marks them optional. [`packages/env/src/env.d.ts:51`] [`packages/env/src/env.d.ts:66`] [`packages/env/src/env.d.ts:72`]

**Effect.** `packages/env/src/config.ts` declares `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` as required `Config` values. [`packages/env/src/config.ts:26-30`] `packages/auth` runs `serverConfig` at module load. [`packages/auth/src/server.ts:9-10`] A development load with those values undefined exited 0. Verified with `bunx varlock@1.24.0 load` in `/tmp/opencode/varlock-repo-scan`. The app would fail at import in that state.

**Change.** Choose one contract:

- Mark the three items `@required` for all environments, so `varlock load` catches a missing `.env.local` value. [`.env.schema:48`] [`.env.schema:60`] [`.env.schema:63`]
- Or make GitHub OAuth optional in `packages/auth`, so the app can start without `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. [`packages/auth/src/server.ts:24-29`]

**Why it matters.** `AGENTS.md` tells developers to run `bunx varlock load` to validate. [`AGENTS.md:230`] The current schema says the environment is valid when the app cannot start.

**Risk.** Low. The first option makes local setup stricter. The second changes auth behavior.

### P1. Add a test environment file or inject `APP_URL` for tests

**State.** `APP_ENV` includes `test`. [`.env.schema:11`] `APP_URL` is required. [`.env.schema:22`] Only `.env.development` sets `APP_URL`. [`.env.development:3`]

**Effect.** `APP_ENV=test` fails the load on the missing `APP_URL`. Verified with `APP_ENV=test bunx varlock@1.24.0 load` in `/tmp/opencode/varlock-repo-scan`.

**Change.** Commit `.env.test` with a test origin, or inject `APP_URL` in the test command. [`.gitignore:14-15`] If the file is committed, add `!.env.test` after the `.env.*` rule. [`.gitignore:13`] The repo has no tests today, so this is a future-proofing step. [`AGENTS.md:133`]

**Risk.** Low.

### P2. Make `ssrInjectMode` explicit

**State.** `apps/web/vite.config.ts` calls `varlockVitePlugin()` with no options. [`apps/web/vite.config.ts:22`] The source defaults to `init-only`. [`varlock/packages/integrations/vite/src/index.ts:414`] The docs say the plugin infers the mode, then defaults to `init-only`. [`varlock/packages/varlock-website/src/content/docs/integrations/vite.mdx:123-128`]

**Change.** Pass `{ ssrInjectMode: 'init-only' }`. [`varlock/packages/integrations/vite/src/index.ts:263`] This states the contract: the server must boot through `varlock run`. [`apps/web/package.json:11`]

**Risk.** None. The behavior does not change.

**Conflict.** The docs overstate the inference. The source only overrides the default for the Cloudflare prerender environment. [`varlock/packages/integrations/vite/src/index.ts:434-435`] Follow the source.

### P2. Optional hardening: `icons=false` and `@redact={stdout=true}`

**`icons=false`.** The generated file embeds SVG data URIs. [`packages/env/src/env.d.ts:11`] The docs recommend `icons=false` when the file is committed and checked for drift. [`varlock/packages/varlock-website/src/content/docs/reference/root-decorators.mdx:752`] Built-in icons are bundled since 1.22, so there is no network fetch today. [`varlock/packages/varlock/CHANGELOG.md:76`] This is a size and determinism improvement, not a fix.

**`@redact={stdout=true}`.** The current Effect logger writes through `globalThis.console`, which the console patch covers. [`/home/ulezot/Projects/other/effect/packages/effect/src/Console.ts:59`] The parent `varlock run` also redacts piped output. [`varlock/packages/varlock-website/src/content/docs/reference/cli/load-and-run.mdx:109`] The option adds coverage for direct `process.stdout.write` calls when the server is not under `varlock run`. [`varlock/packages/varlock-website/src/content/docs/reference/root-decorators.mdx:391`] It is optional. It adds stream-processing overhead.

**Risk.** Low for both.

### P2. Not needed

- **`varlock/auto-load` in the Bun entrypoint.** The Vite plugin already injects `initVarlockRuntime()`. [`varlock/packages/integrations/vite/src/index.ts:549-550`] Adding `auto-load` would call the CLI a second time or add a second init path. [`varlock/packages/varlock-website/src/content/docs/integrations/javascript.mdx:14-20`]
- **`varlock/auto-init`.** The plugin already does the same work. [`varlock/packages/varlock/CHANGELOG.md:43-47`]
- **`@encryptInjectedEnv` and `ssrInjectMode: 'resolved-env'`.** These are for serverless builds that bake the env into the artifact. [`varlock/packages/varlock-website/src/content/docs/integrations/vite.mdx:123-131`] The repo uses `init-only` and `varlock run`, so secrets are not baked. [`apps/web/vite.config.ts:22`] [`apps/web/package.json:11`] Use them only if the deploy target cannot run `varlock run`.
- **`varlock freeze`.** This is for apps with no framework integration or no CLI at runtime. [`varlock/packages/varlock-website/src/content/docs/reference/cli/project.mdx:170-180`] The repo has a CLI at runtime.
- **`varlock audit`.** The repo already bans `process.env` with `node/no-process-env`. [`packages/oxlint-config/src/base-config.ts:92`] The only runtime read is `drizzle.config.ts`, and `*.config.ts` is excluded from lint. [`packages/db/drizzle.config.ts:3-6`] [`packages/oxlint-config/src/base-config.ts:116`] `audit` adds little.
- **`varlock doctor`.** Optional diagnostic. No gap.
- **`useCliWithServiceAccount`.** This is for memory-constrained environments. [`varlock/packages/varlock-website/src/content/docs/plugins/1password.mdx:86-94`] No evidence of a memory limit.
- **`@internal` on `OP_TOKEN`.** The type already sets it. [`varlock/packages/plugins/1password/src/plugin.ts:896-899`] Adding it is harmless but redundant.

### P2. Evaluate, do not rush: `@varlock/effect-plugin`

The official Effect plugin generates an Effect `Config` module. It supports Effect 4 from `4.0.0-rc.113`. [`varlock/packages/varlock-website/src/content/docs/plugins/effect.mdx:19-24`] The repo uses `4.0.0-rc.115`. [`packages/env/package.json:20`] The plugin could remove the hand-written `config.ts` and the duplicated key names. [`docs/adr/0002-varlock-declares-effect-config-reads.md:14-16`]

**Why not now.** The generated module mirrors the schema's optionality. [`varlock/packages/varlock-website/src/content/docs/plugins/effect.mdx:86-90`] The three deployed secrets are optional in the schema. [`packages/env/src/env.d.ts:51`] [`packages/env/src/env.d.ts:66`] [`packages/env/src/env.d.ts:72`] The generated `generated` effect would expose `Option` values, not the required values that `packages/auth` expects. [`packages/env/src/config.ts:26-30`] The change also adds a generated `.ts` file that must pass the repo's strict lint and `verbatimModuleSyntax` rules. [`packages/typescript-config/base.json:35`]

**Verdict.** A viable long-term simplification after the requiredness fix. It is not a gap in the current integration.

### Compatibility notes

- **Effect Config.** The current path is safe. Varlock 1.24 injects resolved values into `process.env`, and Effect `Config` reads them. [`AGENTS.md:231`] The Vite plugin calls `initVarlockRuntime`, which performs the injection. [`varlock/packages/integrations/vite/src/index.ts:549-550`] The upgrade does not change the injection model. The Effect plugin would change optionality; evaluate it separately. [`varlock/packages/varlock-website/src/content/docs/plugins/effect.mdx:86-90`]
- **TanStack Start SSR.** The current path is safe. `init-only` expects `varlock run` at boot, and the repo has that start script. [`apps/web/package.json:11`] Do not switch to `resolved-env` without `@encryptInjectedEnv`; that mode bakes the resolved env into the build. [`varlock/packages/varlock-website/src/content/docs/integrations/vite.mdx:123-131`]
- **Bun server entrypoint.** The current path is safe. The server runs under `bun --bun`, and the injected init is edge-safe and works on Bun. [`varlock/packages/varlock/CHANGELOG.md:43-47`] The `varlock` CLI is a separate Node process, so the image needs Node or the standalone binary. [`varlock/packages/varlock/bin/cli.js:1`]
- **Turbo.** The compatibility risk is in `turbo.json`, not varlock. The strict allowlist removes the values. [`turbo.json:13-14`]

## Safe, recommended, and risky

| Change                                                   | Verdict         | Reason                                                                                                                  |
| -------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Add varlock keys to `turbo.json`                         | **Required**    | Restores the deploy values. [`.env.schema:22`]                                                                          |
| Add `.env.development` to `globalDependencies`           | **Recommended** | Fixes stale cache on `APP_URL` change. [`turbo.json:4-12`]                                                              |
| Declare `varlock` and the plugin as runtime dependencies | **Required**    | `start` runs the CLI. [`apps/web/package.json:11`]                                                                      |
| Declare Node `>=22.12.0`                                 | **Required**    | Vite and varlock need it. [`https://registry.npmjs.org/vite/8.3.3`] [`https://registry.npmjs.org/varlock/1.24.0`]       |
| Upgrade to varlock 1.24.0 / 1.5.5 / 2.0.6                | **Recommended** | Peer alignment and fixes. [`varlock/packages/varlock/CHANGELOG.md:38`]                                                  |
| Set `ssrInjectMode: 'init-only'`                         | **Recommended** | Documents the boot contract. [`varlock/packages/integrations/vite/src/index.ts:414`]                                    |
| Add CI `varlock load --agent`                            | **Recommended** | Catches schema errors before build. [`README.md:31-32`]                                                                 |
| Add codegen drift check                                  | **Recommended** | Catches stale `env.d.ts`. [`packages/env/package.json:14`]                                                              |
| Add `varlock scan ./apps/web/dist`                       | **Recommended** | Catches secrets in the build output. [`varlock/packages/varlock-website/src/content/docs/reference/cli/project.mdx:52`] |
| Add repo-wide `varlock scan` pre-commit hook             | **Risky**       | Fails on the committed `DATABASE_URL` default. [`.env.schema:28`]                                                       |
| Mark `DATABASE_URL` public to satisfy scan               | **Do not**      | Loses redaction and leak protection. [`docs/adr/0004-secrets-never-enter-the-repository.md:20-25`]                      |
| Set `envMode: "loose"`                                   | **Do not**      | Weakens cache correctness. [`node_modules/turbo/docs/reference/configuration.mdx:277`]                                  |
| Add `varlock/auto-load`                                  | **Not needed**  | The Vite plugin already initializes. [`varlock/packages/integrations/vite/src/index.ts:549-550`]                        |
| Add `@encryptInjectedEnv` now                            | **Not needed**  | `init-only` does not bake secrets. [`apps/web/vite.config.ts:22`]                                                       |
| Add `@redact={stdout=true}`                              | **Optional**    | Console redaction covers Effect logs. [`/home/ulezot/Projects/other/effect/packages/effect/src/Console.ts:59`]          |
| Add `icons=false`                                        | **Optional**    | Smaller generated file. [`varlock/packages/varlock-website/src/content/docs/reference/root-decorators.mdx:752`]         |
| Adopt `@varlock/effect-plugin`                           | **Evaluate**    | Changes optionality and generated code. [`varlock/packages/varlock-website/src/content/docs/plugins/effect.mdx:86-90`]  |

## Conflicts

### 1. Vite docs say the SSR mode is inferred; the source defaults to `init-only`

The docs say the plugin infers the mode and otherwise defaults to `init-only`. [`varlock/packages/varlock-website/src/content/docs/integrations/vite.mdx:123-128`] The source sets `init-only` by default and only overrides it for the Cloudflare prerender environment. [`varlock/packages/integrations/vite/src/index.ts:414`] [`varlock/packages/integrations/vite/src/index.ts:434-435`]

**Follow the source.** Set `ssrInjectMode: 'init-only'` explicitly. The repo starts the server with `varlock run`, so `init-only` is correct. [`apps/web/package.json:11`]

### 2. Bun docs say import `varlock/auto-load`; the Vite/TanStack path injects init

The Bun page says to import `varlock/auto-load` for `ENV`, redaction and leak detection. [`varlock/packages/varlock-website/src/content/docs/integrations/bun.mdx:42`] The TanStack Start page says to use the Vite plugin. [`varlock/packages/varlock-website/src/content/docs/integrations/tanstack-start.mdx:25`] The Vite plugin injects `initVarlockRuntime()`. [`varlock/packages/integrations/vite/src/index.ts:549-550`]

**Follow the TanStack Start/Vite path.** Do not add `auto-load`. It would duplicate the init path and may call the CLI again.

### 3. `varlock scan` docs recommend a hook; the schema makes a repo-wide hook fail

The scan docs recommend a pre-commit hook. [`varlock/packages/varlock-website/src/content/docs/reference/cli/project.mdx:45`] The schema has a sensitive default literal. [`.env.schema:28`] A repo-wide scan flags the schema. Verified with `bunx varlock@1.24.0 scan` in `/tmp/opencode/varlock-repo-scan`.

**Follow ADR 0004.** Keep `DATABASE_URL` sensitive. [`docs/adr/0004-secrets-never-enter-the-repository.md:20-25`] Scan the build output instead. [`varlock/packages/varlock-website/src/content/docs/reference/cli/project.mdx:52`]

### 4. The schema says development is valid; the app says it is not

The schema requires the three deployed secrets only outside development. [`.env.schema:48`] [`.env.schema:60`] [`.env.schema:63`] The app declares them as required `Config` values. [`packages/env/src/config.ts:26-30`] The app requires them at import. [`packages/auth/src/server.ts:9-10`]

**Follow the app's runtime requirement.** Mark them required, or make GitHub OAuth optional. Do not leave a load that passes and an app that fails.

### 5. `bun run check` is the routine verification path; it does not validate the environment

`bun run check` runs `format`, `lint` and `tsc`. [`package.json:19`] It does not run `varlock load`. [`AGENTS.md:257`] A schema error that only appears at load is not caught.

**Follow the documented validation step.** Add `varlock load --agent` to CI. [`README.md:31-32`]

### 6. The plugin guide says install the plugin; the repo uses a devDependency

The guide says a JavaScript project must install the plugin as a dependency. [`varlock/packages/varlock-website/src/content/docs/guides/plugins.mdx:32`] The repo has it in `devDependencies`. [`package.json:31`] The runtime `start` command needs it. [`apps/web/package.json:11`]

**Follow the runtime requirement.** Declare both `varlock` and the plugin as production dependencies in the deployed workspace, or install devDependencies in the image.

### 7. Turbo strict mode conflicts with the current allowlist

Varlock's monorepo guide says every ambient variable that varlock reads must be declared in `turbo.json`. [`varlock/packages/varlock-website/src/content/docs/guides/monorepos.mdx:133-139`] The current allowlist has only `NODE_ENV`, `APP_ENV` and `VARLOCK_ENV`. [`turbo.json:13-14`]

**Follow the varlock guide.** Add the missing keys. Do not rely on `envMode: "loose"`.

### 8. `@currentEnv` overrides `--env`

The `@currentEnv` decorator overrides the `--env` CLI flag. [`varlock/packages/varlock-website/src/content/docs/reference/root-decorators.mdx:39`] The repo sets `@currentEnv=$APP_ENV`. [`.env.schema:2`]

**Follow the decorator.** Set `APP_ENV=production` in the environment. Do not use `varlock load --env production`. [`varlock/packages/varlock-website/src/content/docs/guides/environments.mdx:120-128`]

## Not found

- **Deploy target.** No Dockerfile, Vercel config, Railway config, Fly config or CI workflow exists. Only `docker-compose.yml` is present. [`/home/ulezot/.t3/worktrees/acme/t3-9d15b7a4/docker-compose.yml:1`] The audit cannot decide between `init-only` and `resolved-env` for production. `start` implies a long-running server. [`apps/web/package.json:11`]
- **`.env.local`.** The file is absent in this worktree. The audit did not read it. 1Password resolution was not exercised.
- **The 1Password account shorthand.** `account=my` is committed. [`.env.schema:5`] The repo does not document whether `my` is the correct shorthand. The plugin passes the value to the `op` CLI. [`varlock/packages/plugins/1password/src/plugin.ts:211-217`]
- **Installed dependencies.** The worktree has no `node_modules`. The audit could not run the repo's pinned `varlock`. It ran `bunx varlock@1.24.0` in `/tmp/opencode` against copies of the schema.
- **Tests.** No test files exist. Searched for `*.test.ts`, `*.test.tsx` and `*.spec.ts`; none found. The policy is in [`AGENTS.md:133`]. The dev-time app failure was inferred from the module-load `Effect.runSync` and the required `Config` recipes. [`packages/auth/src/server.ts:9-10`] [`packages/env/src/config.ts:26-30`]
- **Production dependency policy.** No deploy config shows whether the image installs or prunes devDependencies.
- **A pre-commit hook.** No hook manager is configured. `git config core.hooksPath` is empty. Checked the repository root for `lefthook` and `.husky`; none exist.
- **A `varlock scan` ignore or allowlist.** The CLI reference and source have no such option. [`varlock/packages/varlock-website/src/content/docs/reference/cli/project.mdx:39-75`] [`varlock/packages/varlock/src/cli/commands/scan.command.ts:214-250`]
- **`varlock scan`, `varlock audit` or `varlock doctor` scripts.** No package script uses them. Searched every `package.json`.
- **`ssrInjectMode`, `@encryptInjectedEnv`, `@redact`, `icons=false`, `envMode` and a Node engine.** None are present. [`.env.schema:1-5`] [`apps/web/vite.config.ts:22`] [`turbo.json:1-14`] [`package.json:41-42`]

## References

### Repository files

- `.env.schema`, `.env.development`, `bunfig.toml`, `.gitignore`
- `packages/env/src/config.ts`, `packages/env/src/env.d.ts`, `packages/env/package.json`
- `apps/web/vite.config.ts`, `apps/web/package.json`
- `packages/db/package.json`, `packages/db/drizzle.config.ts`, `packages/auth/package.json`
- `packages/auth/src/server.ts`
- `docs/adr/0002-varlock-declares-effect-config-reads.md`
- `docs/adr/0004-secrets-never-enter-the-repository.md`
- `docs/adr/0008-app-url-is-required.md`
- `AGENTS.md`, `README.md`, `package.json`, `turbo.json`, `bun.lock`
- `packages/oxlint-config/src/base-config.ts`
- `packages/typescript-config/base.json`

### Varlock source

- `varlock/packages/varlock/CHANGELOG.md`
- `varlock/packages/varlock/src/runtime/init.ts`
- `varlock/packages/varlock/src/runtime/patch-console.ts`
- `varlock/packages/varlock/src/cli/commands/scan.command.ts`
- `varlock/packages/plugins/1password/src/plugin.ts`
- `varlock/packages/plugins/1password/CHANGELOG.md`
- `varlock/packages/integrations/vite/src/index.ts`
- `varlock/packages/integrations/vite/CHANGELOG.md`
- `varlock/framework-tests/frameworks/tanstack-start/files/configs/vite.config.node.ts`
- `varlock/framework-tests/frameworks/tanstack-start/tanstack-shared.ts`
- `varlock/framework-tests/frameworks/tanstack-start/tanstack-vite8.test.ts`

### Varlock docs

- [Vite integration](https://varlock.dev/integrations/vite/)
- [TanStack Start](https://varlock.dev/integrations/tanstack-start/)
- [Bun](https://varlock.dev/integrations/bun/)
- [JavaScript / Node.js](https://varlock.dev/integrations/javascript/)
- [Monorepos](https://varlock.dev/guides/monorepos/)
- [Environments](https://varlock.dev/guides/environments/)
- [Secrets](https://varlock.dev/guides/secrets/)
- [Code generation](https://varlock.dev/guides/code-generation/)
- [Root decorators](https://varlock.dev/reference/root-decorators/)
- [`varlock load` and `varlock run`](https://varlock.dev/reference/cli/load-and-run/)
- [`varlock scan`](https://varlock.dev/reference/cli/project/)
- [`varlock codegen`](https://varlock.dev/reference/cli/cache-and-codegen/)
- [1Password plugin](https://varlock.dev/plugins/1password/)
- [Effect plugin](https://varlock.dev/plugins/effect/)
- [Encrypted deployments](https://varlock.dev/guides/encrypted-deployments/)
- [Frozen env](https://varlock.dev/guides/frozen-env/)

### Registry metadata

- `https://registry.npmjs.org/varlock/1.24.0`
- `https://registry.npmjs.org/@varlock%2Fvite-integration/1.5.5`
- `https://registry.npmjs.org/@varlock%2F1password-plugin/2.0.6`
- `https://registry.npmjs.org/vite/8.3.3`

### Installed Turbo docs

- `/home/ulezot/Projects/js/acme/node_modules/turbo/docs/reference/configuration.mdx`

### Commands run

```bash
# In /tmp/opencode/varlock-scan-test, a minimal schema with a sensitive default.
bunx varlock@1.24.0 scan

# In /tmp/opencode/varlock-repo-scan, a copy of .env.schema without the 1Password lines.
bunx varlock@1.24.0 load
APP_ENV=production bunx varlock@1.24.0 load
APP_ENV=test bunx varlock@1.24.0 load
bunx varlock@1.24.0 scan

# In /tmp/opencode/turbo-env-test, a minimal Turbo workspace.
APP_ENV=production APP_URL=https://prod.example DATABASE_URL=postgres://prod/db PORTLESS=1 \
  /home/ulezot/Projects/js/acme/node_modules/.bin/turbo run show
```
