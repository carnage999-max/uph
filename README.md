# Ultimate Property Holdings

Modern property marketing site built with **Next.js App Router**, **TypeScript**, and **Tailwind**.  
It includes a secure admin console for managing listings, units, and maintenance tickets backed by **PostgreSQL (Prisma)** and local filesystem media storage.

---

## Table of contents
- [Features](#features)
- [System architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Getting started](#getting-started)
- [Database schema](#database-schema)
- [Development scripts](#development-scripts)
- [Admin workflow](#admin-workflow)
- [Maintenance intake](#maintenance-intake)
- [Project structure](#project-structure)

---

## Features

- **Public site**
  - Property listing, detail pages (with unit galleries), and maintenance request form.
  - Responsive UI using reusable card/button components and Tailwind utility tokens.
- **Admin experience**
  - Authenticated dashboard with JWT-secured cookie sessions.
  - Three-step “Create Property” wizard with tooltips, hero/gallery uploads, and optional multi-unit creation.
  - Edit flow covering hero/galleries, metadata, unit availability/reactivation, and object-storage-backed media management.
- **Backend**
  - Prisma ORM with PostgreSQL schema for properties, units, images, and maintenance requests.
  - API routes for admin CRUD operations + maintenance intake.
  - Storage helper that stores object keys for easy cleanup when records are removed.

---

## System architecture

| Layer | Responsibilities |
| ----- | ---------------- |
| Next.js App Router | Renders public pages and server components; hosts admin UI. |
| Prisma ORM | Data access, migrations, and type-safe client. |
| PostgreSQL | Persistent storage for properties, units, media, and maintenance tickets. |
| Local filesystem media storage | File storage for property/unit imagery and maintenance attachments. |
| JWT session | `ADMIN_EMAIL` / `ADMIN_PASSWORD` auth with `ADMIN_JWT_SECRET` signed cookie. |

---

## Prerequisites

- Node.js ≥ 20
- pnpm (or npm/yarn) – repo uses pnpm
- PostgreSQL instance reachable via `DATABASE_URL`
- Writable media directory exposed through `MEDIA_ROOT`

---

## Environment variables

Add the following to `.env.local` for local development (and mirror the same contract in your hosting provider):

```bash
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public
DATABASE_URL_UNPOOLED=postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public

# Admin authentication
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-me
ADMIN_JWT_SECRET=replace-me-with-a-long-random-secret

# Storage
MEDIA_ROOT=/app/media
MEDIA_URL=/media/

# Optional contact/notification destinations
RESEND_API_KEY=...
CONTACT_FROM=Ultimate Property Holdings <noreply@example.com>
CONTACT_TO=ops@example.com
APP_ORIGIN=http://localhost:3000
NEXT_PUBLIC_APP_ORIGIN=http://localhost:3000

# External maintenance API (optional)
MAINTENANCE_API_KEY=
MAINTENANCE_API_CORS_ORIGIN=

# CAPTCHA (Cloudflare Turnstile - optional but recommended)
# Get your site key from https://dash.cloudflare.com/?to=/:account/turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

> **Security note**  
> These values should never be committed to source control. Use deployment-level secrets for production/staging environments.

---

## Getting started

```bash
# install dependencies
pnpm install

# generate Prisma client
pnpm prisma:generate

# push schema to your PostgreSQL database (creates tables)
pnpm db:push

# start local dev server
pnpm dev
```

---

## Database schema



![Database Schema](docs/uph-db-schema.png)

Key entities:

- `Property` with hero image, amenities, and optional geo coordinates.
- `PropertyImage` ordered gallery images linked to a property.
- `Unit` with availability flags, pricing, and optional cover image.
- `UnitImage` additional ordered media per unit.
- `MaintenanceRequest` storing tenant submissions (with optional attachment).

---

## Development scripts

| Script | Description |
| ------ | ----------- |
| `pnpm dev` | Start Next.js dev server with hot reload. |
| `pnpm build` | Production build (Turbopack). |
| `pnpm start` | Run production build locally. |
| `pnpm prisma:generate` | Regenerate Prisma client. |
| `pnpm db:push` | Apply Prisma schema changes to the database. |

---

## Admin workflow

1. Browse to `/admin/login` and authenticate using `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
2. Dashboard (`/admin`) lists all properties with availability snapshots and quick actions.
3. Use `/admin/create` wizard to add new properties (hero image + optional units).  
  - Uploads are written to `MEDIA_ROOT`; generated `/media/...` URLs + keys are stored in the DB.
4. `/admin/edit/[id]` allows:
   - Updating hero image & gallery.
   - Editing core metadata and amenity lists.
   - Adding/removing units, toggling availability/waitlist, hiding/reactivating units.
   - Uploading per-unit cover/gallery and cleaning up assets.
5. Logout via the **Sign out** button in the admin header (clears the signed cookie).

---

## Maintenance intake

- Public `/maintenance` page contains the online request form.
- Submissions hit `POST /api/maintenance`, saving data to `MaintenanceRequest`.
- Optional photo/video uploads are stored in `MEDIA_ROOT` with stored object keys for auditing.
- Admin reporting endpoints can be added later (e.g., `/admin/maintenance`) to display/request status changes.

---

## Project structure

```
app/
  (auth)/admin/login          – admin login page
  (admin)/admin               – authenticated admin routes
  maintenance/                – public maintenance form
  properties/                 – property listings + slug detail page
  api/                        – REST endpoints (admin + public)
docs/
  db-schema.mmd               – Mermaid ER diagram definition
generated/
  prisma/                     – Prisma client output (gitignored)
lib/
  auth/                       – session helpers
  constants.ts                – shared className tokens
  prisma.ts                   – Prisma client singleton
  properties.ts               – read helpers mapping Prisma models
  storage.ts                  – local media upload/delete utilities
prisma/
  schema.prisma               – data model
  prisma.config.ts            – CLI config
```

---

## Next steps

- Seed properties via the admin wizard using the historical data in `data/properties.json`.
- Integrate Resend (or preferred email service) for contact & maintenance notifications.
- Harden admin with multi-user support or role-based access if needed.
- For Coolify deployment on se7en, follow [DEPLOY_COOLIFY.md](/Users/Apple/Desktop/11011/uph/DEPLOY_COOLIFY.md).
