# Database Migration Guide

## 1. Backup First

Before any schema change on staging or production:

1. Export a full MongoDB backup.
2. Save the current deployment commit SHA.
3. Keep a copy of the current `.env` values outside the server.

## 2. Prepare a Staging Database

Never run the migration flow on production first.

Use a separate `DATABASE_URL` for staging and verify:

- Prisma can connect
- the app boots
- the admin login works

## 3. Validate the Database

```bash
npm run database:validate
```

This checks basic connectivity and reports core collection counts.

## 4. Apply the Schema Update on Staging

```bash
npx prisma generate
npm run db:push
```

## 5. Run Dry Run Backfill

All of the following are safe on staging:

```bash
npm run database:dry-run
node scripts/backfill-configs.mjs --dry-run --limit=10
node scripts/backfill-configs.mjs --dry-run --slug=your-invitation-slug
```

Dry run reports:

- scanned records
- updated records
- skipped records
- failed records

## 6. Execute the Backfill

Only after the dry run looks correct:

```bash
npm run database:backfill
```

Optional targeted runs:

```bash
node scripts/backfill-configs.mjs --limit=50
node scripts/backfill-configs.mjs --slug=your-invitation-slug
```

## 7. Verify the Result

```bash
npm run database:verify
```

This checks a sample of invitations and fails if required JSON config fields are still missing.

## 8. Run Quality Checks

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

## 9. Production Rollout

Apply to production only after explicit approval.

Recommended order:

1. Backup production.
2. Point environment to production database.
3. Run `npx prisma generate`
4. Run `npm run db:push`
5. Run `npm run database:validate`
6. Run `npm run database:dry-run`
7. Run `npm run database:backfill`
8. Run `npm run database:verify`
9. Smoke test admin, editor, invite pages, RSVP, media, and openings.

## 10. Rollback

If something fails:

1. Stop the rollout.
2. Restore the previous deployment.
3. Restore the MongoDB backup if data integrity is affected.
4. Review `migrationState`, `InvitationRevision`, and server logs.
5. Fix the issue and rerun on staging before another production attempt.

## Notes

- Legacy fields are intentionally preserved in the first migration phase.
- The backfill creates a legacy revision before updating an unmigrated invitation when possible.
- The script is resumable and can be rerun safely.
