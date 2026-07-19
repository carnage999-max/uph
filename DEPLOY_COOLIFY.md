# Coolify Deployment: Atlas Properties

Project-specific settings for deploying this repo to se7en via Coolify.

## Project

- Project name: `ultimate-property-holdings`
- Domain: `atlasproperties.net`
- Stack: Next.js App Router, Prisma, PostgreSQL
- Internal app port: `3000`
- Host port: use an available `30xx` port, recommended `3007`
- Background workers: none
- WebSockets: none

## Coolify Build Settings

Use Nixpacks with explicit commands:

```bash
Install: pnpm install --frozen-lockfile
Build: pnpm build
Start: pnpm start
Port: 3000
```

If pnpm causes a Nixpacks workspace/package detection issue, use:

```bash
Install: npm install
Build: npm run build
Start: npm start
Port: 3000
```

## Coolify Port Mapping

Set Configuration -> Network -> Port Mappings:

```bash
127.0.0.1:3007:3000
```

If `3007` is already taken on se7en, choose another free `30xx` host port.

## Persistent Storage

Add one Directory Mount:

```bash
Source: /mnt/data/media/ultimate-property-holdings/
Destination: /app/media
```

Nginx should serve `/media/` directly from the host source path.

## Environment Variables

Set these in Coolify. Do not commit secret values.

```bash
NODE_ENV=production
DATABASE_URL=postgresql://<user>:<password>@<coolify-postgres-container>:5432/<dbname>
DATABASE_URL_UNPOOLED=postgresql://<user>:<password>@<coolify-postgres-container>:5432/<dbname>

MEDIA_ROOT=/app/media
MEDIA_URL=/media/

APP_ORIGIN=https://atlasproperties.net
NEXT_PUBLIC_APP_ORIGIN=https://atlasproperties.net

ADMIN_EMAIL=<admin-email>
ADMIN_PASSWORD=<admin-password>
ADMIN_JWT_SECRET=<long-random-secret>

RESEND_API_KEY=<resend-api-key>
CONTACT_FROM=Atlas Properties <noreply@atlasproperties.net>
CONTACT_TO=<destination-email>

NEXT_PUBLIC_TURNSTILE_SITE_KEY=<turnstile-site-key>
TURNSTILE_SECRET_KEY=<turnstile-secret-key>

MAINTENANCE_API_KEY=<optional-api-key>
MAINTENANCE_API_CORS_ORIGIN=https://atlasproperties.net
```

Remove S3/AWS storage variables from the Coolify environment. This app now writes uploads to `MEDIA_ROOT` and stores relative `/media/...` URLs.

## Data Migration

The local `.env` points at Neon, so production data likely needs to be migrated to the Coolify Postgres container:

```bash
~/db-migrate.sh \
  '<neon-connection-string>' \
  '<target-postgres-container-name>' \
  '<db-name>' \
  '<db-user>'
```

After the app deploys:

```bash
docker exec -it <app-container> pnpm prisma db push
```

## Media Migration

Copy existing object-storage files to:

```bash
/mnt/data/media/ultimate-property-holdings/
```

Preserve the existing object keys as relative paths, for example:

```bash
properties/example-property/hero/file.jpg
```

Then rewrite DB URLs to local `/media/...` URLs:

```bash
pnpm storage:rewrite-urls -- --base=/media --apply
```

## Nginx

Use this host config shape:

```nginx
server {
    listen 80;
    server_name atlasproperties.net www.atlasproperties.net;

    location /media/ {
        alias /mnt/data/media/ultimate-property-holdings/;
        sendfile on;
        tcp_nopush on;
        expires 30d;
        add_header Cache-Control "public";
    }

    location / {
        proxy_pass http://localhost:3007;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;
        proxy_buffering off;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
```

Then enable the site, reload Nginx, and issue SSL:

```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d atlasproperties.net -d www.atlasproperties.net
```
