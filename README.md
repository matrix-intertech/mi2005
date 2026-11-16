# vinext-starter

A clean full-stack starter running on [vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Windows, macOS, or Linux; Git is required only for publishing, and Bash is not required for initialization or the project commands

## Sites Lifecycle

The bundled Sites initializer copies this starter into the project and runs its locked dependency install before returning the checkout. Edit the source under `app/`, use `npm run dev` for the Codex local preview, and run the project validation before hosting. The remote Sites builder also runs `npm run build` against the pushed commit. Do not rerun the dependency install unless dependencies are absent or the lockfile changed.

This starter does not use `wrangler.jsonc`.

`install:ci` runs `npm ci` once against this checkout's bundled lockfile, explicitly targeting the project and disabling parent-workspace discovery. It includes dev and optional dependencies required for builds and previews even when production/omit settings would exclude them. It defaults Sharp to prebuilt binaries unless the caller explicitly configures Sharp or a source build. It uses `--prefer-offline --no-audit --no-fund`, reuses the configured npm cache, and leaves network concurrency, retries, timeouts, and lifecycle-script policy to npm's configuration. Retain the installer session until it finishes; do not overlap installers for the same checkout.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

`npm run dev` uses `vinext dev` for the live Vite preview with HMR, starting at port 5173. Vinext records the running server in ignored `.vinext/` state and rejects another start for the same checkout while that process is alive; reuse its printed URL. It recovers stale state after a stopped process. Pass `--port <port>` or `--hostname <host>` after `npm run dev --` when needed; keep Codex previews on loopback. Like the Sites package, this relies on Vinext's advisory lock; exactly simultaneous starts can race.

The bundled Sites Vite plugin simulates ChatGPT sign-in only for loopback development requests. Visit `/signin-with-chatgpt?return_to=/` to sign in as `local_seedy` (`seedy@sites.test`, display name `Seedy`) and `/signout-with-chatgpt?return_to=/` to sign out. The development cookie preserves that identity across server restarts. This does not exercise real ChatGPT OAuth and is not included in production builds; hosted authentication remains dispatch-owned.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building, `npm start` runs that Worker locally through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site or simulate sign-in. Use the URL printed by the server. Pass `npm start -- --port <port>` to select a different built-preview port.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `@cloudflare/workers-types` provides Worker types; `cloudflare-env.d.ts` declares optional `DB`/`BUCKET` bindings—update these declarations if binding names change
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Use it as the durable user key; use email and name for display or contact purposes.

SIWC-authenticated workspace sites may also receive `oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty `name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use the returned `userId` as the stable user key for user-owned records; do not use email as a durable identifier.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection. Do not implement app routes for those reserved paths. Routes that do not import and call the helper remain anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the Sites hosting platform's access policy controls for workspace-wide restrictions, or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write actions tied to the current ChatGPT user. Leave public content anonymous.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_example.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally with D1/R2 support
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

Like the Sites package, `npm run build` runs `vinext build` directly; it does not require a host `timeout` command.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)

## Matrix Intertech Enquiry Email

The enquiry form sends mail through Office365 SMTP. Configure these environment variables locally and in production:

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=support@matrixspaces.com
SMTP_PASS=
CONTACT_FROM_EMAIL=support@matrixspaces.com
CONTACT_TO_EMAIL=jb.narang@matrixonline.in
CONTACT_CC_EMAIL=it.team@matrixonline.in
```

`CONTACT_CC_EMAIL` is optional. The other variables are required at runtime. Keep the real `SMTP_PASS` only in local or server environment files; never commit it.

For local testing, create `.env.local` in the project root and set the same variables with the real `SMTP_PASS`.

For VPS production:

1. Create `/var/www/matrix-intertech-new/.env.production`.
2. Put the same environment variables there, including the real `SMTP_PASS`.
3. Never commit `.env.production` or print the password in logs.
4. Restart PM2 after environment changes, for example `pm2 restart matrix-intertech-new --update-env`.

## Admin Dashboard and VPS Runtime

The admin dashboard and email/database APIs require a Node.js runtime. Run this project on the VPS with Node.js and PM2, not Cloudflare Workers.

Required environment variables:

```env
MONGODB_URI=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
AUTH_SECRET=
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=support@matrixspaces.com
SMTP_PASS=
CONTACT_FROM_EMAIL=support@matrixspaces.com
CONTACT_TO_EMAIL=jb.narang@matrixonline.in
CONTACT_CC_EMAIL=it.team@matrixonline.in
```

Create `/var/www/matrix-intertech-new/.env.production` with these values. Keep it out of Git. `AUTH_SECRET` must be at least 32 characters.

Generate the password hash on a trusted machine without printing the source password to a file:

```sh
node -e "require('bcryptjs').hash(process.argv[1], 12).then(console.log)" 'choose-a-strong-password'
```

Put the printed hash in `ADMIN_PASSWORD_HASH`, then restart the Node process after changing environment variables:

```sh
pm2 restart matrix-intertech-new --update-env
```


## Portfolio Management (Node.js VPS)

Admin clients are managed at `/dashboard/portfolio` using the existing admin session.
The `portfolioClients` MongoDB collection stores metadata only. All management APIs
under `/api/admin/portfolio` require an admin session, including list requests.
POST creates a client with multipart form data; PATCH `/[id]` updates any submitted
fields, visibility, order, or logo; DELETE `/[id]` removes the record. PATCH requires
its current `updatedAt`; DELETE supplies that value in `If-Unmodified-Since`.
POST requires a UUID `submissionId` so retries cannot create duplicate records.

Run this explicit import once before deploying the database-backed public section:

```sh
npm run seed:portfolio
```

The import uses `lib/portfolio-seed.json` and the existing local logo assets. New
records are Public with display orders 1?11 and company-name alt text. It creates
the required indexes, inserts missing clients and repairs only missing/blank fields.
An immutable `seedKey` identifies each restored company even after admin edits;
legacy company names are recognized. Other manually added clients are untouched.
It does not overwrite admin edits on repeat runs. It never runs during builds or
page requests. Re-running it after deliberately deleting an imported client will
restore that missing client; do not schedule it as part of every deployment.
`portfolio:seed` remains an alias. The command uses the currently configured
`MONGODB_URI` without logging it. The static seed also supplies the public fallback.

Only Public clients are displayed, ordered by display order then company name.
If the collection is empty or MongoDB fails/takes more than three seconds, the
public section displays the original 11 clients as a temporary fallback. Database
and fallback lists are never merged. If records exist but all are Hidden, the
section stays hidden; fallback does not undo deliberate visibility settings.
The admin list always reads MongoDB and defaults to the Public filter.
Updates are read on each public request, including the
home, projects, who-we-are, and clients pages. No rebuild is needed.

Uploads accept PNG, JPEG, WebP and self-contained SVG, up to 2 MB and 16 megapixels.
The server checks extension, MIME and decoded format and converts uploads to WebP
with generated UUID names. SVG scripts, embedded/external resources and entities
are rejected. Files are served through `/api/portfolio-logos/[filename]`, which
supports uploads made after the Next.js process starts. Missing images display the
company name. Replaced/deleted uploaded files are removed only after the database
write succeeds and only when no record references them. Original bundled assets
are never deleted.

### Persistent upload directory and permissions

The default is `public/uploads/clients/`, ignored by Git except `.gitkeep`.
The app creates it if needed, but its parent must be writable by the Node process.
For deployments that replace the checkout, set `PORTFOLIO_UPLOAD_DIR` to a shared
absolute directory outside the release tree. For example, on Linux (replace
`matrix` with the actual PM2 service user and group):

```sh
sudo install -d -o matrix -g matrix -m 0750 /var/lib/matrix/portfolio-clients
# In the server environment, not committed to Git:
# PORTFOLIO_UPLOAD_DIR=/var/lib/matrix/portfolio-clients
pm2 restart matrix-intertech-new --update-env
```

The process needs directory read/write/execute permission; uploaded files are mode
0640. Do not use world-writable permissions. Persist and back up the upload directory
alongside MongoDB. Exclude it from deployment cleanup, `rsync --delete`, and release
replacement. For the default directory, preserve or mount `public/uploads/clients`
between releases. Builds do not delete uploads. Multiple app instances must share
the same persistent directory. Allow multipart requests slightly above 2 MB at the
reverse proxy (for example Nginx `client_max_body_size 3m`); the API still enforces
the 2 MB file limit. Keep Node.js at the version required in `package.json`.

Implementation references: [Next.js route handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
and [Sharp image validation limits](https://sharp.pixelplumbing.com/api-constructor/).
