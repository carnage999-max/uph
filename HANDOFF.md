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
- `pnpm build` succeeds. The only database error is the expected local inability to resolve the Coolify PostgreSQL host.
- The embedded browser was unavailable, so visual browser verification could not be completed in this session.

## Single-family homes

- The schema already supports properties without units through `Property.hasUnits Boolean @default(false)` and an empty `units` relation.
- The create wizard already has an `Enable units` toggle and sends no units when disabled, but it defaults to enabled.
- The edit form/API can persist `hasUnits`, but the edit UI does not expose a toggle and always renders `UnitsManager`.
- The admin overview always displays unit counts, so a no-unit property appears as `0/0 available`.
- Public property details only render visible units when present, and the application form only requires a unit when visible units exist.
- The next functional change should expose property-level availability for single-family listings, add an edit toggle, conditionally hide unit management, and replace unit-count language for no-unit properties. This should not require a disruptive Prisma redesign; decide whether property-level availability is represented by status or a dedicated boolean before implementation.

## Working tree at handoff

- The current uncommitted changes are the admin styling/navigation work plus this handoff file.
- Do not revert unrelated user changes if any appear later.
