# `APP_URL` is required, with no default

`APP_URL` has no default and is declared `@required`. Better Auth derives its OAuth
redirect URIs and its absolute links from it. A value set in the shared schema (the
obvious `http://localhost:3000`) is inherited by every environment. A wrong callback
host fails at the provider, not at boot. That failure is easy to ship and hard to
notice. Each environment names its own origin instead. `.env.development` sets the
development origin. Staging and production receive theirs as an injected environment
variable.

## Consequences

- A fresh environment cannot load until it provides `APP_URL`. The failure arrives at
  environment load, before the deploy can serve a callback that cannot work.
