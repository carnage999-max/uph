# Cloudflare R2 Migration

This repo is now prepared to use Cloudflare R2 without changing the upload code. The cutover is driven by environment variables plus a one-time database URL rewrite after your objects are copied.

## What you need to do in Cloudflare

1. Create a Cloudflare account.
2. Open `R2 object storage`.
3. Create a bucket for uploads.
4. Create an API token with object read/write access for that bucket.
5. Decide how files will be publicly served:
   - easiest: public bucket URL
   - better: custom domain
6. Copy these values:
   - `bucket name`
   - `account ID`
   - `access key ID`
   - `secret access key`
   - `public URL base`

Cloudflare official docs:

- R2 pricing: https://developers.cloudflare.com/r2/pricing/
- R2 S3 API: https://developers.cloudflare.com/r2/get-started/s3/
- R2 migration: https://developers.cloudflare.com/r2/data-migration/super-slurper/

## Environment values

### Local `.env.local`

```bash
S3_BUCKET_NAME=your-r2-bucket
AWS_REGION=auto
AWS_ACCESS_KEY_ID=your-r2-access-key-id
AWS_SECRET_ACCESS_KEY=your-r2-secret-access-key
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_PUBLIC_URL_BASE=https://<your-public-bucket-url-or-custom-domain>
S3_FORCE_PATH_STYLE=
```

### Amplify environment variables

Use the `UPH_*` variants in Amplify:

```bash
S3_BUCKET_NAME=your-r2-bucket
UPH_S3_BUCKET=your-r2-bucket
UPH_AWS_REGION=auto
UPH_AWS_ACCESS_KEY_ID=your-r2-access-key-id
UPH_AWS_SECRET_ACCESS_KEY=your-r2-secret-access-key
UPH_S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
UPH_S3_PUBLIC_URL_BASE=https://<your-public-bucket-url-or-custom-domain>
UPH_S3_FORCE_PATH_STYLE=
```

Notes:

- `region=auto` is correct for R2.
- `S3_PUBLIC_URL_BASE` is required for user-facing asset URLs. The API endpoint is not the public asset base.
- Leave `S3_FORCE_PATH_STYLE` empty for R2 unless you have a specific reason to change it.

## Recommended migration path

1. Create the R2 bucket and API token.
2. Set the new R2 env vars locally and in Amplify.
3. Copy your existing objects from S3 to R2 while preserving object keys.
4. Run a dry-run of the DB rewrite script:

```bash
pnpm storage:rewrite-urls -- --base=https://<your-public-bucket-url-or-custom-domain>
```

5. If the preview looks correct, apply it:

```bash
pnpm storage:rewrite-urls -- --base=https://<your-public-bucket-url-or-custom-domain> --apply
```

6. Deploy.
7. Verify:
   - property hero images
   - property galleries
   - unit cover/gallery images
   - maintenance attachments
   - application uploads
8. After verification, decommission the old S3 bucket/credentials.

## Copying objects

Best option: use Cloudflare `Super Slurper` if you want Cloudflare-managed migration from S3-compatible storage into R2.

Important requirement:

- preserve object keys exactly as they are today

The database rewrite script depends on stored keys such as:

- `heroImageKey`
- `storageKey`
- `coverImageKey`
- `attachmentKey`
- `commentAttachmentKey`

If keys are preserved, the script can regenerate every public URL deterministically.

## What the rewrite script updates

The script rewrites URLs from keys for:

- `Property.heroImageUrl`
- `PropertyImage.url`
- `Unit.coverImage`
- `UnitImage.url`
- `MaintenanceRequest.attachmentUrl`
- `MaintenanceRequest.commentAttachmentUrl`

It does not modify the keys themselves.

## Rollback

If you need to roll back before deleting S3:

1. switch env vars back to S3
2. rerun the rewrite script with your old S3 public base instead of the R2 base

Example:

```bash
pnpm storage:rewrite-urls -- --base=https://your-bucket.s3.us-east-1.amazonaws.com --apply
```
