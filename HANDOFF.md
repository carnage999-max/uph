# Project Handoff

## Project and deployment

- Workspace: `/Users/Apple/Desktop/11011/uph`
- Product/domain: Atlas Properties, `atlasproperties.net` and `www.atlasproperties.net`
- Stack: Next.js App Router, Prisma, PostgreSQL, local filesystem media storage.
- Coolify runs the app on container port `3000`; suggested host mapping is `127.0.0.1:3007:3000`.
- System Nginx handles domains, TLS, proxying, and `/media/` delivery. Traefik is disabled.
- Server media directory: `/mnt/data/media/ultimate-property-holdings/`, mounted as `/app/media` in the app container.
- Nginx must include `client_max_body_size 25m;` and a `/media/` alias to the server media directory.
- The local `.env` points at a Coolify-only database hostname, so local builds log an expected Prisma connection warning while still succeeding.

## Previous storage and upload work

- Media storage was changed from S3 to local filesystem in `lib/storage.ts` using `MEDIA_ROOT` and `MEDIA_URL`.
- Database media URLs can be rewritten with `scripts/rewrite-storage-urls.mjs` and `--base=/media`.
- `components/MediaImage.tsx` bypasses Next image optimization for `/media/` and legacy S3 URLs to prevent `/_next/image` 400 responses.
- Application image uploads allow up to 10 MB and use browser-side iterative JPEG compression with object URLs for mobile camera photos.
- `DEPLOY_COOLIFY.md` documents the Nginx body-size setting.

## Current admin styling work

- Added light-theme admin control and button classes in `lib/constants.ts`.
- Replaced dark public-site controls throughout `app/(admin)` so selects, inputs, textareas, file controls, and secondary buttons are readable on white cards.
- Added `app/(admin)/admin/AdminNav.tsx` with icons, active states, consistent button sizing, spacing, keyboard focus, and mobile horizontal overflow.
- Made the admin header sticky at `top-16`, directly below the 64px main navbar.
- Replaced the fixed `html/body` height with minimum heights so the main sticky navbar remains visible across long admin pages instead of being constrained to the first viewport.
- `pnpm build` succeeds. The only database error is the expected local inability to resolve the Coolify PostgreSQL host.
- The embedded browser was unavailable, so visual browser verification could not be completed in this session.

## Single-family homes and availability

- Added `Property.available Boolean @default(false)`.
- This database predates Prisma Migrate and has no migration baseline. `pnpm start` runs `prisma db push --skip-generate` before Next.js so Coolify applies the additive column without triggering Prisma P3005. Do not replace this with `migrate deploy` until the production database is formally baselined.
- Creation automatically disables units when `Single-Family Home` is selected and exposes an `Available for rent` switch when units are off.
- Editing exposes both `Individual units` and property-level availability. Existing unit records are retained but hidden publicly when units are disabled.
- Admin summaries show property-level availability for single residences and unit counts for multi-unit properties.
- Public cards and details show `Available Now` for available single residences and only show `Join Waitlist` when unavailable.
- Multi-unit rent labels derive a range from priced available units, falling back to all visible units, when property-level rent summary fields are empty.
- Available property detail pages link to the application with the property preselected. The application unit selector now lists only visible, available units.
- `pnpm exec prisma validate` and `pnpm build` pass. Local builds still log the expected Coolify-only database hostname warning.

## Working tree at handoff

- The current uncommitted changes implement property-level availability, unit-derived rent labels, the admin controls, public display behavior, and the Prisma migration.
- Do not revert unrelated user changes if any appear later.
