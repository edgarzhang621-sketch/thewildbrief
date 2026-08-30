# Hosting The Wild Brief Externally

This package contains the source code for **The Wild Brief**. It is a full-stack Node application, not a static HTML site. Your host must support a persistent Node web service and a MySQL-compatible database.

## Required setup

| Item | What to configure |
|---|---|
| Runtime | Node.js 22 and pnpm |
| Database | A MySQL-compatible database, with its connection string supplied as `DATABASE_URL` |
| Build command | `pnpm install --frozen-lockfile && pnpm build` |
| Start command | `pnpm start` |
| Database migration | Run `pnpm drizzle-kit migrate` with `DATABASE_URL` configured before opening the site to visitors |

## Required environment variables

Do **not** place secrets in source files or commit them to a repository. Configure these through your hosting provider’s environment-variable settings.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Connects the application to MySQL and stores email subscribers. |
| `JWT_SECRET` | Signs session cookies. Use a long random value. |
| `OWNER_OPEN_ID` | Identifies the owner account allowed to view/export subscribers. |
| `OWNER_NAME` | Provides the owner’s display name. |
| `VITE_APP_ID` | Used by the existing Manus OAuth sign-in flow. |
| `OAUTH_SERVER_URL` | Used by the existing Manus OAuth sign-in flow. |
| `VITE_OAUTH_PORTAL_URL` | Used by the existing Manus OAuth sign-in flow. |

## Important limitation

The hidden subscriber list uses the project’s current **Manus OAuth** owner authentication. If you host this elsewhere, you must either provide working values for the OAuth variables and register the new domain with that login flow, or replace the owner authentication with another provider before relying on the subscriber-admin panel.

The subscriber database, subscribe API, theme toggle, cited wildlife facts, and public pages remain part of the package. The external host must provide a database and preserve the database tables created by the included migration files.

## Recommended deployment order

1. Create a MySQL database in your hosting account.
2. Add the required environment variables in the host dashboard.
3. Deploy this source package with the build and start commands above.
4. Run the database migration once against the production database.
5. Open the site, subscribe with a test address, and verify the owner-only CSV export after authentication is configured.
