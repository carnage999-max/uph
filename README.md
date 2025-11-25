# Ultimate Property Holdings

Modern property marketing site built with **Next.js App Router**, **TypeScript**, and **Tailwind**.  
It now includes a secure admin console for managing listings, units, and maintenance tickets backed by **PostgreSQL (Prisma)** and **Amazon S3** for media storage.

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
  - Edit flow covering hero/galleries, metadata, unit availability/reactivation, and S3-backed media management.
- **Backend**
  - Prisma ORM with PostgreSQL schema for properties, units, images, and maintenance requests.
  - API routes for admin CRUD operations + maintenance intake.
  - S3 helper that stores object keys for easy cleanup when records are removed.

---

## System architecture

| Layer | Responsibilities |
| ----- | ---------------- |
| Next.js App Router | Renders public pages and server components; hosts admin UI. |
| Prisma ORM | Data access, migrations, and type-safe client. |
| PostgreSQL | Persistent storage for properties, units, media, and maintenance tickets. |
| Amazon S3 | File storage for property/unit imagery and maintenance attachments. |
| JWT session | `ADMIN_EMAIL` / `ADMIN_PASSWORD` auth with `ADMIN_JWT_SECRET` signed cookie. |

---

## Prerequisites

- Node.js ≥ 20
- pnpm (or npm/yarn) – repo uses pnpm
- PostgreSQL instance (Neon, RDS, etc.) reachable via `DATABASE_URL`
- Amazon S3 bucket + IAM credentials with `s3:PutObject`/`s3:DeleteObject`

---

## Environment variables

Add the following to `.env` (and mirror them in your hosting provider):

```bash
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public

# Admin authentication (use UPH_ prefix for Amplify)
UPH_ADMIN_EMAIL=admin@ultimatepropertyholdings.com
UPH_ADMIN_PASSWORD=AiaHU!Ak1Ruh^AAU!6tO
UPH_ADMIN_JWT_SECRET=uWayC7DbppWk9cdwbL7m_BV7sXBmnCGFENn6iKeyjlIn3jvx0DD1BnPZjzuwoYjW

# S3 / AWS credentials (use UPH_ prefixed env vars for deployment providers that
# reserve the AWS_ prefix like AWS Amplify)
UPH_AWS_REGION=us-east-1
UPH_AWS_ACCESS_KEY_ID=...
UPH_AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=uph-media-bucket  # or set UPH_S3_BUCKET

# Optional contact/notification destinations
RESEND_API_KEY=...
CONTACT_TO=nathan@membershipauto.com
MAINTENANCE_TO=nathan@membershipauto.com
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
   - Uploads go directly to S3; generated URLs + keys are stored in the DB.
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
- Optional photo/video uploads are stored in S3 with stored object keys for auditing.
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
  storage.ts                  – S3 upload/delete utilities
prisma/
  schema.prisma               – data model
  prisma.config.ts            – CLI config
```

---

## Next steps

- Seed properties via the admin wizard using the historical data in `data/properties.json`.
- Integrate Resend (or preferred email service) for contact & maintenance notifications.
- Harden admin with multi-user support or role-based access if needed.
