# acme

A full-stack web-app starter with no product domain. TanStack Start and React 19 run in
the browser. Effect v4, oRPC, Drizzle and Better Auth run on the server. varlock manages
the environment, shadcn/ui provides the components, and Bun and Turbo provide the
tooling. The Notes example is the end-to-end reference that shows how to wire a
feature. [AGENTS.md](./AGENTS.md) is the operating manual, [GLOSSARY.md](./GLOSSARY.md)
holds the domain vocabulary, and [docs/adr](./docs/adr) holds the decisions.

## Requirements

- Bun 1.4.2
- Node >=22.12.0
- Docker, for the local Postgres

## Quickstart

Create `.env.local` with `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` before
you run `bun run db:migrate`. That command runs `varlock run`, so the load fails without them.

```bash
bun install
bun run up             # Postgres on host port 5434
bun run db:migrate     # apply migrations
bun dev                # https://acme.localhost via portless
```

## Secrets

Every variable is declared in [.env.schema](./.env.schema). Secrets and machine-specific
values go in a gitignored `.env.local`, which varlock validates on load. Development
needs `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env.local`.
The load fails in every environment when one of them is missing. Staging and production
receive every value as an injected environment variable. `bunx varlock load` checks the
current environment. `bunx varlock load --agent` prints the environment as redacted JSON.
The full arrangement is in [AGENTS.md](./AGENTS.md#environment): which file wins, and
which commands can reach 1Password.

## GitHub sign-in

Create a GitHub OAuth app with the callback URL
`${APP_URL}/api/auth/callback/github`. In development, `APP_URL` is
`https://acme.localhost`. Put the app credentials in `.env.local` as `GITHUB_CLIENT_ID`
and `GITHUB_CLIENT_SECRET`.

## Checks

```bash
bun run check          # format, lint and typecheck every workspace
bun run check:env      # validate the environment and scan the source for leaks
```
