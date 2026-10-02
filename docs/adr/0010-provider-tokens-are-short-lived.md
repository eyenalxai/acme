# Provider tokens are short-lived, and are never read from the account row

GitHub enables expiring user access tokens by default for new OAuth apps, and it keeps
that setting enabled here. The access token lives eight hours, and the refresh token
lives six months. A refresh rotates the pair. Both the web application flow and the
device flow support expiry ([GitHub changelog, August
2026](https://github.blog/changelog/2026-08-14-multiple-redirect-uris-and-token-refresh-for-oauth-apps)).
Better Auth stores what the provider returned on the account row. That storage makes
the arrangement worth a record: `account.accessToken` is a token that expired hours ago
most of the time that something reads it.

Reach provider tokens through `auth.api.getAccessToken({ body: { accountId } })`, which
refreshes an expired token before it returns the token. A provider's
`refreshAccessToken` override is the fallback if the built-in refresh is broken for
GitHub. Reading the stored token to call GitHub's API looks correct and fails eight
hours after sign-in. The failure surfaces at GitHub, not here.

The alternative was disabling expiry, which yields a long-lived token that simply
works. It costs rotation and an eight-hour exposure window for a leaked token, and it
cannot be undone for accounts that are already signed in. Enabling expiry later affects
only tokens issued after it, so those users must go through the OAuth flow again.

## Consequences

- Acme uses GitHub only for identity. The token is read during sign-in and never used
  again, so nothing refreshes it and nothing notices when it expires. That is expected,
  not a bug.
- The refresh path is unverified on our pinned `better-auth`. Its GitHub page still
  says that OAuth apps receive no refresh tokens, because the page predates the change
  above. Verify the refresh path when a feature first calls GitHub's API, and do not
  assume that it works. `better-auth` issues 2765 and 7999 describe the two ways that it
  fails.
- `offline_access` exists to roll this out while the app-level setting is off, which is
  not our situation. Do not add the scope without a reason.
