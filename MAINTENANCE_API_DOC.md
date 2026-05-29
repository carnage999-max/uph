# Maintenance API — External Service Integration

## Overview
This API exposes maintenance-request management endpoints for an external task manager to list, inspect, and update maintenance requests (the same actions available to the admin UI). Updating certain statuses triggers an email to the request creator.

## Configuration (External Task Manager)
- **API Base URL:** `https://ultimatepropertyholdings.com` (or your deployed domain)
- **API Key:** Obtain from the UPH admin and set as `MAINTENANCE_API_KEY` in your task manager environment.

## Authentication
- Provide a single API key via one of the headers:
  - `Authorization: Bearer <API_KEY>`
  - `x-api-key: <API_KEY>`
- The server-side expected key is set in the environment as `MAINTENANCE_API_KEY` (or `UPH_MAINTENANCE_API_KEY`).

## Endpoints
- Base path: `/api/external/maintenance`

**List requests**
- Method: `GET`
- URL: `/api/external/maintenance?status=<status>&search=<term>&page=<n>`
- Query params:
  - `status` (optional): filter by status (e.g., `new`, `in-progress`, `completed`, `closed`)
  - `search` (optional): case-insensitive substring match against `name`
  - `page` (optional): 1-based page number (defaults to 1)
- Response: JSON `{ requests: [...], pagination: { page, pageSize, total, totalPages } }`
- Example:

```bash
curl -H "Authorization: Bearer $MAINT_API_KEY" "https://your-app.example.com/api/external/maintenance?page=1&status=new"
```

**Get single request**
- Method: `GET`
- URL: `/api/external/maintenance/:id`
- Response: JSON maintenance-request object or `404`
- Example:

```bash
curl -H "x-api-key: $MAINT_API_KEY" "https://your-app.example.com/api/external/maintenance/<TICKET_ID>"
```

**Update request (status / admin comment / attachment)**
- Method: `PATCH`
- URL: `/api/external/maintenance/:id`
- Two supported content-types:
  1. JSON
     - Body: `{ "status": "in-progress|completed|closed|...", "comment": "Optional admin message" }`
     - Example:

```bash
curl -X PATCH \
  -H "Authorization: Bearer $MAINT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","comment":"Replaced faucet in kitchen."}' \
  https://your-app.example.com/api/external/maintenance/<TICKET_ID>
```

  2. multipart/form-data (allows attaching a file)
     - Form fields: `status` (required), `comment` (optional), `media` (file, optional)
     - Example:

```bash
curl -X PATCH \
  -H "x-api-key: $MAINT_API_KEY" \
  -F "status=completed" \
  -F "comment=Fixed and verified." \
  -F "media=@/path/to/photo.jpg" \
  https://your-app.example.com/api/external/maintenance/<TICKET_ID>
```

- Side effects: if the maintenance request record has an `email` and the new status is one of `in-progress`, `completed`, or `closed`, the system will send a status-update email to the tenant. The email includes the mandatory admin comment (if provided) and a link to any attached file.

## Responses / Error Codes
- `200` — success (returns resource or updated object)
- `400` — bad request (e.g., missing `status` for PATCH)
- `401` — unauthorized (invalid or missing API key)
- `404` — not found (ticket id doesn't exist)
- `500` — server error

## Security & Operational Notes
- Keep the API key secret and rotate periodically.
- All requests must use HTTPS.
- **CORS:** Set `MAINTENANCE_API_CORS_ORIGIN` (or `UPH_MAINTENANCE_API_CORS_ORIGIN`) to allow requests from your task manager origin (e.g., `https://tasks.myapp.com`). Defaults to `*` if not set.
- Attachments are uploaded to object storage — ensure bucket, region, access key, and secret key env vars are configured on the server. For Amplify, use the `UPH_*` variants.
- Email sending uses Resend — set `RESEND_API_KEY` and `CONTACT_FROM`/`CONTACT_TO` as needed.

## Implementation references
- External list endpoint: [app/api/external/maintenance/route.ts](app/api/external/maintenance/route.ts)
- External detail/update endpoint: [app/api/external/maintenance/[id]/route.ts](app/api/external/maintenance/[id]/route.ts)
- API-key helper: [lib/auth/index.ts](lib/auth/index.ts)

## Example workflow (external task manager)
1. Poll list for `status=new`:
   - GET `/api/external/maintenance?status=new`
2. Claim / work on a ticket in your system.
3. When work starts, PATCH `/api/external/maintenance/:id` with `{ "status": "in-progress", "comment": "Technician dispatched." }` -> tenant receives an "in-progress" email.
4. When finished, PATCH with `{ "status": "completed", "comment": "Replaced unit and tested." }` (optionally attach photo) -> tenant receives a completion email.

---

If you'd like, I can also:
- Create a small Postman collection or OpenAPI snippet for this surface
- Add request signing or rotateable API keys stored in the database
