# FARHA CMS Upgrade

FARHA is a Next.js 16 + Prisma (MongoDB) application for wedding invitation templates, public invitation delivery, and an Arabic-first admin CMS.

This repository now includes a schema-driven foundation for templates and openings, a shared invitation render configuration, a unified preview/public runtime bridge, safer admin authentication, and backfill/bootstrap scripts for production rollout.

## What Changed

### Schema-driven templates

- Templates now have a manifest-backed registry in `src/lib/template-system.js`.
- Every registered template exposes:
  - metadata
  - editable fields
  - section definitions
  - theme options
  - opening compatibility
  - runtime bindings
  - preservation rules for template switching
- Diagnostics are available through `src/lib/template-diagnostics.js` and are surfaced in the admin templates page.

### Shared render runtime

- Public invitations and editor preview now use the same render flow:
  1. server builds `InvitationRenderConfig`
  2. `RenderFrame` loads the raw template HTML from `public/<slug>/index.html`
  3. `public/generic_script.js` receives structured `postMessage` payloads
  4. runtime applies fields, media, sections, dates, RSVP behavior, and openings
- The old `srcDoc`-based HTML rewriting path has been replaced for `/invite/[slug]`.

### Openings library

- Openings are modeled separately from templates.
- The current registry includes:
  - `native-template`
  - `minimal-fade`
  - `no-opening`
- Openings are available through `/api/openings` and the admin openings page.

### Admin security

- Hardcoded fallback credentials and fallback secrets were removed from `src/lib/auth.js`.
- Admin authentication now uses `AdminUser` in the database.
- Supporting utilities were added in:
  - `src/lib/admin-security.js`
  - `src/lib/admin-session.js`
- Login rate limiting and audit logging hooks are included.

### Database foundation

`prisma/schema.prisma` was expanded with production-oriented models and JSON-backed configuration fields, including:

- `Template`
- `Opening`
- `InvitationRevision`
- `MediaAsset`
- `AdminUser`
- `AuditLog`
- `Client`
- `OrderRequest`

Existing legacy invitation columns were preserved for backward compatibility.

## Main Runtime Files

- Template + opening registry: `src/lib/template-system.js`
- Template diagnostics: `src/lib/template-diagnostics.js`
- Shared frame renderer: `src/components/invitation/RenderFrame.js`
- Public runtime bridge: `public/generic_script.js`
- Invitation editor page: `src/app/edit/[slug]/page.js`
- Invitation editor client: `src/app/edit/[slug]/EditorClient.js`
- Public invitation page: `src/app/invite/[slug]/page.js`
- Editor save API: `src/app/api/editor/[slug]/route.js`

## Admin Pages

- `/admin/templates`
- `/admin/openings`
- `/admin/invitations`
- `/admin/packages`
- `/admin/settings`

The templates page now reads from manifests and diagnostics instead of a static read-only table.

## Environment Variables

Copy `.env.example` and set the required values:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_USERNAME`
- `ADMIN_BOOTSTRAP_PASSWORD`
- `ADMIN_BOOTSTRAP_NAME`

Optional media-related values:

- `CLOUDINARY_URL`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

## Setup

```bash
npm install
npx prisma generate
npm run db:push
npm run seed
npm run bootstrap:admin
```

## Backfill Legacy Data

The repository includes `scripts/backfill-configs.mjs`.

Dry run:

```bash
$env:BACKFILL_DRY_RUN="1"
npm run backfill:configs
```

Real run:

```bash
npm run backfill:configs
```

The backfill:

- seeds templates and openings
- parses legacy `coupleStory`
- migrates legacy sections/theme values into JSON fields
- keeps legacy values instead of deleting them
- assigns a default native opening when needed

## Testing and Verification

Available commands:

```bash
npm run lint
npm test
npm run build
```

Current automated unit coverage includes:

- manifest validation
- legacy normalization
- render config building
- template-switch preservation
- permission checks

## Deployment Notes

1. Set production environment variables first.
2. Run `npm run db:push` against the target database.
3. Run `npm run seed`.
4. Run `npm run bootstrap:admin`.
5. Run `npm run backfill:configs`.
6. Deploy and verify `/admin/login`, `/edit/[slug]`, `/invite/[slug]`, and RSVP submission.

## Current Limitations

- Several templates are registered as `tilda-static` and are flagged by diagnostics as requiring deeper native adapters for full field-level coverage.
- `generic_script.js` now supports the shared structured runtime, but some Tilda-heavy templates still need dedicated selector maps before they can claim full schema-driven parity.
- Lint currently passes with warnings about legacy `<img>` usage in older components that were not part of the core CMS runtime rewrite.

## Rollback Guidance

- The legacy invitation columns are still present in the schema.
- Existing template directories under `public/` were preserved.
- Existing invitation slugs and public URLs were preserved.
- If a rollout issue appears, restore the previous deployment, keep the new database fields in place, and re-run the backfill later after fixing adapters.
