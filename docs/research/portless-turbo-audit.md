# Portless and Turborepo audit

- Date: 2026-11-09
- Status: Research complete. No repository code changed. This file is the only deliverable. The `PORTLESS=0` bypass is no longer documented and is no longer passed through Turbo; the remainder of the audit remains the evidence for the 0.17.0 upgrade.
- Repository: `/home/ulezot/.t3/worktrees/acme/t3-9d15b7a4`
- Installed versions: `portless@0.15.7`, `turbo@2.11.7`
- Latest registry versions: `portless@0.17.0`, `turbo@2.11.10`

## Answer

### Verdict

The portless package key and the `Turbo -> portless` order are correct for this monorepo. Two defects need a fix:

1. Portless prefixes the hostname with the last branch segment in a linked worktree. The app has one fixed origin, `https://acme.localhost` (`.env.development:3`). The prefix breaks `APP_URL`, Better Auth `baseURL`, and `trustedOrigins`.
2. Turbo strict mode strips `APP_URL` and every injected secret from Turbo-run task runtimes. This breaks the environment contract in ADR 0004.

The remaining findings are smaller: one redundant Turbo task, one wrong output path, and three incomplete input lists.

### Root `bun dev` in this T3 worktree

The current chain:

1. `bun dev` runs `turbo run dev --framework-inference=false` (`package.json:13`).
2. Turbo runs the `@acme/web#dev` task (`turbo.json:60-64`).
3. The task runs `portless` (`apps/web/package.json:8`).
4. Portless loads the `"portless"` key: name `acme`, script `dev:app` (`apps/web/package.json:47-50`).
5. `dev:app` runs `vite dev` (`apps/web/package.json:9`).
6. The worktree is a linked worktree with `gitdir: /home/ulezot/Projects/js/acme/.git/worktrees/t3-9d15b7a4` (`.git:1`).
7. The branch is `chore/deps-shadcn-varlock-portless` (`/home/ulezot/Projects/js/acme/.git/worktrees/t3-9d15b7a4/HEAD:1`).
8. Portless detects the linked worktree and prepends the last branch segment (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:90-92`).
9. Portless sets `PORT`, `HOST`, `PORTLESS_URL`, and the Vite allowed-host variable, then runs `bun run dev:app` (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:1831-1834`).
10. Portless injects `--port <4000-4999> --strictPort --host 127.0.0.1` into `vite dev` (`/home/ulezot/Projects/other/portless/packages/portless/src/cli-utils.ts:2041-2058`).
11. The URL is `https://deps-shadcn-varlock-portless.acme.localhost`.

The URL was verified without a server. The command `bunx portless@0.15.7 get acme` printed:

```text
https://deps-shadcn-varlock-portless.acme.localhost
```

`.env.development` sets `APP_URL=https://acme.localhost` (`.env.development:3`). Better Auth uses that origin for `baseURL` and `trustedOrigins` (`packages/auth/src/server.ts:18`, `packages/auth/src/server.ts:30`). The prefixed host is not that origin. OAuth callbacks and trusted-origin checks therefore use the wrong host.

After the fix, every worktree uses `https://acme.localhost`. The root `bun dev` chain stays the same.

### Portless setup

The package key is the right place for the name and the script. The current package key is correct. A root `portless.json` is not needed for this setup.

- A root `portless.json` `apps` entry does not set `name` or `script` when portless runs inside a package. Only `worktree` inherits from the workspace root (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:23`).
- A root `portless.json` is for root multi-app mode. It starts every package that has the script (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:120-141`). This repo does not use that mode.
- The `package.json` `"portless"` key takes precedence over a `portless.json` app entry (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:118`).
- Bare `portless` runs the configured script (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:5-9`).
- `portless run` with no command does the same, and it accepts `--prefix` (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:1958-1976`).
- Portless resolves the package manager and runs `bun run dev:app` (`/home/ulezot/Projects/other/portless/packages/portless/src/config.ts:220`, `/home/ulezot/Projects/other/portless/packages/portless/src/config.ts:258`).
- Portless uses its Turbo integration only when it runs from the workspace root (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:4027-4049`). Here Turbo is the outer orchestrator and portless is the inner dev command. That is the documented Turborepo pattern (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:145-157`).
- `PORTLESS=0` runs the command directly, without the proxy (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:252-255`). It resolves `dev:app` and skips route registration (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:5470-5500`).
- `PORTLESS` is in `globalPassThroughEnv`, so Turbo passes it to the portless process (`turbo.json:14`). This is correct.
- The default worktree label is the last branch segment (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:90-92`).
- A hostname template cannot remove the label. The template must contain `{worktree}` (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:92`).
- `portless@0.15.7` has no `--prefix` flag and no `PORTLESS_PREFIX` support. Both first appear in `0.17.0` (`/home/ulezot/Projects/other/portless/CHANGELOG.md:8-10`).
- `portless@0.17.0` accepts an empty `--prefix` value to disable the label (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:2021-2026`). It sets `PORTLESS_PREFIX` from that value (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:4736`).

The package-local way to keep one stable origin on `0.17.0` is:

```json
"dev": "portless run --prefix \"\""
```

The package key still supplies `name` and `script`. `portless run` with no command reads both (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:4741`).

Trade-off: two worktrees that run `bun dev` at the same time now compete for `acme.localhost`. The second route fails unless the owner stops or uses `--force` (`/home/ulezot/Projects/other/portless/packages/portless/src/routes.ts:87-88`). This is acceptable here, because the auth contract needs one origin. The alternative, per-worktree origins, needs a dynamic `APP_URL` and a matching OAuth callback for every branch. The repository has neither.

### Turbo environment

Turbo strict mode is the default (`/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/crafting-your-repository/using-environment-variables.mdx:90-95`). Strict mode makes only four keys available to a task: `env`, `passThroughEnv`, `globalEnv`, and `globalPassThroughEnv` (`/tmp/opencode/turbo-21110/package/docs/reference/run.mdx:245-255`).

- `globalEnv` puts a value in every task hash (`/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/reference/configuration.mdx:60-70`).
- `globalPassThroughEnv` makes a value available without hashing it (`/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/reference/configuration.mdx:72-90`).

The current split is correct for the three selectors:

- `NODE_ENV`, `APP_ENV`, and `VARLOCK_ENV` are in `globalEnv` (`turbo.json:13`). `NODE_ENV` selects the Node mode. `APP_ENV` and `VARLOCK_ENV` select the varlock file set. All three change output.
- `PORTLESS` is in `globalPassThroughEnv` (`turbo.json:14`). It changes routing only, not output. `dev` is not cached (`turbo.json:18`).

The list is incomplete. `APP_URL` is absent (`turbo.json:13-14`). It is required (`.env.schema:20-22`). `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `OP_TOKEN` are absent (`turbo.json:13-14`).

ADR 0004 says staging and production receive every value as an injected environment variable, and that `process.env` has the highest precedence (`docs/adr/0004-secrets-never-enter-the-repository.md:6-8`). Turbo removes those values before varlock or Effect Config can read them (`/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/crafting-your-repository/using-environment-variables.mdx:90-95`). The ADR contract is therefore broken for every Turbo-run task.

In development the files hide the defect. Varlock loads `.env.development` and `.env.local` (`AGENTS.md:242-246`). In staging and production there is no committed file (`docs/adr/0004-secrets-never-enter-the-repository.md:27-29`). The load fails, or the code uses the local default for `DATABASE_URL`.

### Turbo tasks

- `dev` has `cache: false` and `persistent: true` (`turbo.json:16-20`). That matches the documented dev task (`/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/crafting-your-repository/developing-applications.mdx:30-45`).
- `dependsOn: ["^tsc"]` is valid. It is a fail-fast preflight, not a Turbo requirement. Keep it if a dependency type error must stop dev. Remove it if startup time matters.
- `@acme/web#dev` repeats the same three values (`turbo.json:60-64`). A `package#task` entry in the root `turbo.json` completely overwrites the base task, with no inheritance (`/tmp/opencode/turbo-21110/package/docs/reference/package-configurations.mdx:381`). The entry is redundant today. It will silently diverge if the base task changes. Delete it.
- `typegen` writes `src/routeTree.gen.ts` (`turbo.json:32`). That matches `tsr.config.json` (`apps/web/tsr.config.json:4`). The inputs include `src/routes/**` and `tsr.config.json` (`turbo.json:33`). This is correct.
- `tsc` inputs omit `vite.config.ts`. That file is in the web tsconfig program (`apps/web/tsconfig.json:14`). They also omit `tsr.config.json`. The `tsc` script runs `bun run typegen` first (`apps/web/package.json:13`). A change to either file can therefore hit a stale `tsc` cache.
- `build` inputs omit `tsr.config.json` (`turbo.json:24`). The TanStack Start Vite plugin runs the router generator at build time (`/home/ulezot/Projects/other/tanstack-router/packages/start-plugin-core/src/vite/start-router-plugin/plugin.ts:8-12`). The generator reads `tsr.config.json` (`/home/ulezot/Projects/other/tanstack-router/packages/router-generator/src/config.ts:91`). Add the config glob.
- `lint` inputs omit `tsconfig.json` (`turbo.json:41`). Type-aware lint reads the tsconfig. Add it.
- `auth:generate` writes `packages/db/src/schema/auth.generated.ts` (`packages/auth/package.json:14`). The `outputs` path is `src/database/schema/auth.generated.ts` (`turbo.json:58`). That path is under `packages/auth`, and it does not exist. The task has `cache: false` (`turbo.json:57`), so the `outputs` key is unused. Remove the key.
- `db:generate`, `db:migrate`, and `db:push` have `cache: false` (`turbo.json:43-51`). `db:studio` has `cache: false` and `persistent: true` (`turbo.json:52-55`). These settings are correct. Keep them.
- `ui: "tui"` is valid (`/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/reference/configuration.mdx:92-106`). Keep it.
- `$schema` points at `https://turborepo.com/schema.json` (`turbo.json:2`). That URL returns a 301 to `https://turborepo.dev/schema.json`. The 2.11.10 docs use `turborepo.dev` (`/tmp/opencode/turbo-21110/package/docs/getting-started/add-to-existing-repository.mdx:138`). Change it for a direct fetch.
- `agentGuidance` changed default. In `2.11.7` it defaults to `true`. In `2.11.10` it defaults to `false` (`/tmp/opencode/turbo-2117/package/docs/reference/configuration.mdx:118-132`, `/tmp/opencode/turbo-21110/package/docs/reference/configuration.mdx:118-132`). The block in `AGENTS.md` matches the `2.11.7` text (`AGENTS.md:331`). Add `"agentGuidance": true` before the upgrade. The same key is harmless on `2.11.7`.

### Exact changes

| File | Key | Current | New | Reason |
| --- | --- | --- | --- | --- |
| `apps/web/package.json:42` | `devDependencies.portless` | `0.15.7` | `0.17.0` | Adds `--prefix` and `PORTLESS_PREFIX`. |
| `apps/web/package.json:8` | `scripts.dev` | `portless` | `portless run --prefix \"\"` | Keeps `https://acme.localhost` in linked worktrees. |
| `turbo.json:14` | `globalPassThroughEnv` | `["PORTLESS"]` | `["PORTLESS", "APP_URL", "BETTER_AUTH_SECRET", "DATABASE_URL", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "OP_TOKEN"]` | Restores the ADR 0004 contract under strict mode. |
| `turbo.json:60-64` | `tasks["@acme/web#dev"]` | present | delete | Full overwrite of `dev`; identical and redundant. |
| `turbo.json:58` | `tasks["auth:generate"].outputs` | `["src/database/schema/auth.generated.ts"]` | delete | Wrong path; `cache: false` makes it unused. |
| `turbo.json:28` | `tasks.tsc.inputs` | `["src/**/*.ts", "src/**/*.tsx", "tsconfig.json", "package.json"]` | `["src/**/*.ts", "src/**/*.tsx", "*.config.*", "tsconfig.json", "package.json"]` | Covers `vite.config.ts`, `drizzle.config.ts`, and `tsr.config.json`. |
| `turbo.json:24` | `tasks.build.inputs` | `["src/**", "public/**", "vite.config.*", "tsconfig.json"]` | `["src/**", "public/**", "*.config.*", "tsconfig.json"]` | Covers `tsr.config.json`. |
| `turbo.json:41` | `tasks.lint.inputs` | `["src/**", "oxlint.config.ts", "package.json"]` | `["src/**", "*.config.*", "tsconfig.json", "package.json"]` | Type-aware lint reads the tsconfig. |
| `turbo.json:2` | `$schema` | `https://turborepo.com/schema.json` | `https://turborepo.dev/schema.json` | Canonical URL; no redirect. |
| `turbo.json` (root key) | `agentGuidance` | absent | `true` | Keeps the `AGENTS.md` block current on `2.11.10`. |
| `package.json:37` | `devDependencies.turbo` | `2.11.7` | `2.11.10` | Latest patch release. No config key requires it. Optional. |

Run `bun install` after the version changes and commit `bun.lock` (`AGENTS.md:33-34`).

Do not add the `portless` package to `minimumReleaseAgeExcludes`. `0.17.0` was published at `2026-11-08T22:08:31Z`. The three-day gate in `bunfig.toml:6` clears at `2026-11-11T22:08:31Z`. Until then, `bun add portless@0.17.0` fails with `blocked by minimum-release-age: 259200 seconds`. The check ran with Bun 1.4.3; the repository declares Bun 1.4.2 (`package.json:42`).

Apply the `dev` script change only after the upgrade. On `0.15.7`, `--prefix` is an unknown flag and portless exits (`/tmp/opencode/portless-0157/package/dist/cli.js:5651-5658`).

If the maintainer will not upgrade portless, the alternative is to keep the prefixed URL and make `APP_URL` dynamic. That needs a new variable and a matching OAuth callback per branch. The repository has no such wiring. This report recommends the fixed origin.

### Check without a long-lived server

Run these from the repository root. Each block starts at the repository root.

```bash
# 1. Show the URL that portless derives today.
cd apps/web
bunx portless@0.15.7 get acme
# -> https://deps-shadcn-varlock-portless.acme.localhost
```

```bash
# 2. Show the URL without worktree naming. This is the target after the fix.
cd apps/web
bunx portless@0.15.7 get acme --no-worktree
# -> https://acme.localhost

# On 0.17.0, after 2026-11-11T22:08:31Z, the same result comes from the prefix override:
PORTLESS_PREFIX="" bunx portless@0.17.0 get acme
# -> https://acme.localhost
```

`portless get` reads the worktree config and prints the URL. It does not start the proxy or a dev server (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:2691-2701`).

```bash
# 3. Show the pass-through list that Turbo will use, without running the task.
bunx turbo@2.11.10 run dev --dry=json --cache-dir=/tmp/acme-turbo-check \
  | jq -r '.globalCacheInputs.environmentVariables.specified.passThroughEnv[]'
# -> PORTLESS, APP_URL, BETTER_AUTH_SECRET, DATABASE_URL,
#    GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, OP_TOKEN
```

A dry run does not execute tasks (`/tmp/opencode/turbo-21110/package/docs/reference/run.mdx:204-225`). The `--cache-dir` redirect keeps the local cache out of the repository.

```bash
# 4. Optional runtime check. Stop it with Ctrl+C.
bun dev
# -> https://acme.localhost
```

Portless needs a trusted local CA for HTTPS. Run `portless trust` once if the browser rejects the certificate (`/home/ulezot/Projects/other/portless/README.md:44`). In a non-interactive shell, start the proxy first with `portless proxy start`. Portless exits when it needs sudo and no TTY exists (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:1416-1433`).

### Already correct, do not churn

- The `"portless"` key with `name: "acme"` and `script: "dev:app"` in `apps/web/package.json:47-50`. Keep it. It gives the bare `acme.localhost` name and the separate app command.
- `"dev": "portless"` as the package dev script. The change above only adds `run --prefix ""`. The documented Turborepo pattern is the same (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:145-157`).
- `"dev:app": "vite dev"` (`apps/web/package.json:9`). Keep the real command separate from the proxy wrapper.
- `vite.config.ts` `server.port: 3000` (`apps/web/vite.config.ts:8-10`). Keep it for `PORTLESS=0`. Portless overrides it with `--port` when the proxy is active (`/home/ulezot/Projects/other/portless/packages/portless/src/cli-utils.ts:2041-2058`).
- `PORTLESS` in `globalPassThroughEnv` (`turbo.json:14`). Keep it there. Moving it to `globalEnv` adds an unrelated cache input to every task.
- `NODE_ENV`, `APP_ENV`, and `VARLOCK_ENV` in `globalEnv` (`turbo.json:13`). Keep them. `NODE_ENV` selects the runtime mode. `APP_ENV` and `VARLOCK_ENV` select the varlock file set.
- `dev` `cache: false` and `persistent: true` (`turbo.json:18-19`). Keep them.
- `db:*` `cache: false` and `db:studio` `persistent: true` (`turbo.json:43-55`). Keep them.
- `typegen` `outputs: ["src/routeTree.gen.ts"]` and its `src/routes/**` and `tsr.config.json` inputs (`turbo.json:32-33`). Keep them.
- `build` `outputs: [".output/**", "dist/**"]` (`turbo.json:23`). `dist/**` covers the server entry that `start` runs (`apps/web/package.json:11`). `.output/**` is unused but harmless.
- The root `dev` script runs Turbo, not portless (`package.json:13`). Keep Turbo as the outer orchestrator.
- `.env.development` sets `APP_URL=https://acme.localhost` (`.env.development:3`). Keep it after the worktree prefix is disabled.
- `--framework-inference=false` on the root `dev` script (`package.json:13`). It is a valid flag (`/tmp/opencode/turbo-21110/package/docs/reference/run.mdx:372-383`). The app uses no `VITE_*` variables.
- `ui: "tui"` (`turbo.json:3`). It is a valid value.
- No root `portless.json`. Keep it absent. The package key is the correct source for this single-app Turbo setup.

## Evidence

1. The root dev script is `turbo run dev --framework-inference=false` (`package.json:13`).
2. The web dev script is `portless` (`apps/web/package.json:8`).
3. The web app command is `vite dev` (`apps/web/package.json:9`).
4. The portless key sets `name: "acme"` and `script: "dev:app"` (`apps/web/package.json:47-50`).
5. The installed portless version is `0.15.7` (`apps/web/package.json:42`, `bun.lock:1281`).
6. The installed Turbo version is `2.11.7` (`package.json:37`, `bun.lock:16`).
7. The latest Turbo version is `2.11.10` (`https://registry.npmjs.org/turbo`).
8. The latest portless version is `0.17.0` (`https://registry.npmjs.org/portless`).
9. Portless `0.17.0` was published at `2026-11-08T22:08:31Z` (`https://registry.npmjs.org/portless`).
10. The worktree gitdir is outside the main checkout (`.git:1`).
11. The branch is `chore/deps-shadcn-varlock-portless` (`/home/ulezot/Projects/js/acme/.git/worktrees/t3-9d15b7a4/HEAD:1`).
12. Portless prefixes a linked worktree with the last branch segment by default (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:90-92`).
13. Portless `0.15.7` has no `--prefix` flag (`/tmp/opencode/portless-0157/package/dist/cli.js:5611-5626`).
14. Portless `0.17.0` adds the worktree option and the prefix override (`/home/ulezot/Projects/other/portless/CHANGELOG.md:8-10`).
15. An empty `--prefix` disables the label (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:1976`). The override reads `PORTLESS_PREFIX` and returns no prefix for an empty value (`/home/ulezot/Projects/other/portless/packages/portless/src/auto.ts:218-221`).
16. `portless run` with no command reads the configured script (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:4741`).
17. `PORTLESS=0` spawns the resolved script without the proxy (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:5470-5500`).
18. Turbo strict mode is the default (`/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/crafting-your-repository/using-environment-variables.mdx:90-95`).
19. Strict mode exposes only the four env keys (`/tmp/opencode/turbo-21110/package/docs/reference/run.mdx:245-255`).
20. `globalPassThroughEnv` makes values available without hashing (`/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/reference/configuration.mdx:72-90`).
21. ADR 0004 says injected values win through `process.env` (`docs/adr/0004-secrets-never-enter-the-repository.md:6-8`).
22. `APP_URL` is required and has no default (`docs/adr/0008-app-url-is-required.md:1-9`).
23. Better Auth uses `APP_URL` for `baseURL` (`packages/auth/src/server.ts:18`).
24. Better Auth uses `APP_URL` for `trustedOrigins` (`packages/auth/src/server.ts:30`).
25. A `package#task` entry completely overwrites the base task (`/tmp/opencode/turbo-21110/package/docs/reference/package-configurations.mdx:381`).
26. `dev` needs `cache: false` and `persistent: true` (`/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/crafting-your-repository/developing-applications.mdx:30-45`).
27. `auth:generate` writes to `../db/src/schema/auth.generated.ts` (`packages/auth/package.json:14`).
28. The web tsconfig includes `vite.config.ts` (`apps/web/tsconfig.json:14`).
29. The `tsc` script runs `bun run typegen` first (`apps/web/package.json:13`).
30. `tsr.config.json` writes `./src/routeTree.gen.ts` (`apps/web/tsr.config.json:4`).
31. Turbo `2.11.7` defaults `agentGuidance` to `true` (`/tmp/opencode/turbo-2117/package/docs/reference/configuration.mdx:118-132`).
32. Turbo `2.11.10` defaults `agentGuidance` to `false` (`/tmp/opencode/turbo-21110/package/docs/reference/configuration.mdx:118-132`).
33. The `AGENTS.md` block uses the `2.11.7` opt-out text (`AGENTS.md:331`).
34. The canonical schema URL in the `2.11.10` docs is `https://turborepo.dev/schema.json` (`/tmp/opencode/turbo-21110/package/docs/getting-started/add-to-existing-repository.mdx:138`).
35. The repository schema URL redirects with a 301 (`https://turborepo.com/schema.json`).
36. The canonical schema URL returns 200 (`https://turborepo.dev/schema.json`).

## Conflicts

| Source A | Source B | Conflict | Follow | Why |
| --- | --- | --- | --- | --- |
| Portless default worktree prefix (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:90-92`) | Repo `APP_URL` and docs (`.env.development:3`, `README.md:21`) | The URL differs in a linked worktree. | Repo | Better Auth trusts one origin (`packages/auth/src/server.ts:18`, `packages/auth/src/server.ts:30`). A per-branch callback needs external OAuth setup that the repo does not have. |
| Portless README says `portless run` detects worktrees (`/home/ulezot/Projects/other/portless/README.md:45`) | Portless configuration docs say bare `portless` runs the script (`/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx:5-9`) | Wording suggests different commands. | Configuration docs plus source | The source applies the prefix in both modes (`/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:4085-4089`, `/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts:4784-4788`). There is no functional conflict. |
| Turbo `2.11.7` defaults `agentGuidance` to `true` | Turbo `2.11.10` defaults it to `false` | The `AGENTS.md` block stops refreshing after the upgrade. | Add `agentGuidance: true` | The key is correct for both versions and keeps the block current. |
| Turbo docs show `dev` with only `cache` and `persistent` (`/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/crafting-your-repository/developing-applications.mdx:30-45`) | Repo `dev` adds `dependsOn: ["^tsc"]` (`turbo.json:17`) | Extra preflight before dev. | Repo | The extra work is valid. It fails fast on dependency type errors. Remove it only if startup time matters. |
| ADR 0004 says injected values win (`docs/adr/0004-secrets-never-enter-the-repository.md:6-8`) | Turbo strict mode filters undeclared values (`/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/crafting-your-repository/using-environment-variables.mdx:90-95`) | Injected secrets never reach varlock or Effect Config. | ADR 0004 | The ADR defines the deployment contract. Turbo must pass the values through. |
| Portless `0.17.0` is the latest release (`https://registry.npmjs.org/portless`) | `bunfig.toml:6` sets a three-day minimum release age | The fix is not installable on the audit date. | `bunfig.toml` | The age gate is a repository policy. Keep it. Wait until `2026-11-11T22:08:31Z`. |
| `AGENTS.md:70` and `README.md:21` say `https://acme.localhost` | The current worktree URL is prefixed | The documented URL is wrong in a worktree. | Docs, after the fix | Disabling the prefix makes the existing docs true. No doc rewrite is needed. |

## Not found

- No root `portless.json`. The only portless config is the package key in `apps/web/package.json:47-50`.
- No ADR about portless, Turborepo, the dev URL, or worktree hostnames. The ADR index has 13 entries, and none covers these topics (`docs/adr/README.md`).
- No CI workflow and no deploy configuration in the repository. I could not verify the exact staging or production build command. The only statement is in `AGENTS.md:247-248`.
- No `node_modules` in this worktree. I did not run the repository's `bun dev`. The URL comes from the portless `0.15.7` source and the `portless get` check.
- No release notes for Turbo `2.11.10` beyond the bundled docs. I compared the `2.11.7` and `2.11.10` configuration, run, and environment docs.
- No `--prefix` or `PORTLESS_PREFIX` in portless `0.15.7`. The feature first appears in `0.17.0`. The `0.16.0` feature list does not add it (`/home/ulezot/Projects/other/portless/CHANGELOG.md:35-45`).
- No exact test of the age gate with Bun 1.4.2. The check used Bun 1.4.3. The `bunfig.toml` rule is the same.
- No remote Turbo cache configuration. The cache-correctness findings apply to the local cache only.
- No evidence that the deploy platform runs `turbo run build`. The repository root script does (`package.json:14`), and no other build entry point exists.

## References

### Registry

- https://registry.npmjs.org/portless
- https://registry.npmjs.org/turbo
- https://registry.npmjs.org/portless/-/portless-0.15.7.tgz
- https://registry.npmjs.org/turbo/-/turbo-2.11.7.tgz
- https://registry.npmjs.org/turbo/-/turbo-2.11.10.tgz
- https://www.npmjs.com/package/portless
- https://www.npmjs.com/package/turbo

### Portless

- https://portless.sh/configuration
- https://portless.sh/commands
- https://github.com/vercel-labs/portless/blob/main/CHANGELOG.md
- `/home/ulezot/Projects/other/portless/README.md`
- `/home/ulezot/Projects/other/portless/AGENTS.md`
- `/home/ulezot/Projects/other/portless/apps/docs/content/docs/configuration.mdx`
- `/home/ulezot/Projects/other/portless/apps/docs/content/docs/commands.mdx`
- `/home/ulezot/Projects/other/portless/packages/portless/src/cli.ts`
- `/home/ulezot/Projects/other/portless/packages/portless/src/config.ts`
- `/home/ulezot/Projects/other/portless/packages/portless/src/auto.ts`
- `/home/ulezot/Projects/other/portless/packages/portless/src/routes.ts`
- `/home/ulezot/Projects/other/portless/packages/portless/src/turbo.ts`

### Turborepo

- https://turborepo.dev/docs/reference/configuration
- https://turborepo.dev/docs/reference/run
- https://turborepo.dev/docs/reference/package-configurations
- https://turborepo.dev/docs/crafting-your-repository/using-environment-variables
- https://turborepo.dev/docs/crafting-your-repository/developing-applications
- https://turborepo.dev/schema.json
- `/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/reference/configuration.mdx`
- `/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/reference/run.mdx`
- `/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/reference/package-configurations.mdx`
- `/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/crafting-your-repository/using-environment-variables.mdx`
- `/home/ulezot/Projects/other/turborepo/apps/docs/content/docs/crafting-your-repository/developing-applications.mdx`
- `/tmp/opencode/turbo-2117/package/docs` (docs from `turbo@2.11.7`)
- `/tmp/opencode/turbo-21110/package/docs` (docs from `turbo@2.11.10`)

### TanStack

- `/home/ulezot/Projects/other/tanstack-router/packages/start-plugin-core/src/vite/start-router-plugin/plugin.ts`
- `/home/ulezot/Projects/other/tanstack-router/packages/router-generator/src/config.ts`

### Repository

- `package.json`
- `turbo.json`
- `bunfig.toml`
- `bun.lock`
- `AGENTS.md`
- `README.md`
- `.env.schema`
- `.env.development`
- `apps/web/package.json`
- `apps/web/vite.config.ts`
- `apps/web/tsconfig.json`
- `apps/web/tsr.config.json`
- `packages/auth/package.json`
- `packages/auth/src/server.ts`
- `docs/adr/README.md`
- `docs/adr/0004-secrets-never-enter-the-repository.md`
- `docs/adr/0008-app-url-is-required.md`
