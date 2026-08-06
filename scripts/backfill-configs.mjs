import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const argMap = new Map(
  args
    .filter((arg) => arg.startsWith('--'))
    .map((arg) => {
      const [key, value] = arg.replace(/^--/, '').split('=');
      return [key, value ?? '1'];
    }),
);

const dryRun = process.env.BACKFILL_DRY_RUN === '1' || argMap.has('dry-run');
const limit = argMap.get('limit') ? Number(argMap.get('limit')) : null;
const invitationSlug = argMap.get('slug') || null;

const templates = [
  ['jathuandthanu', 'Jathu & Thanu', 'جاثو وثانو', '/jathuandthanu/preview.png'],
  ['royal', 'Royal', 'الملكي', '/majestic/intro-poster-new.jpg'],
  ['majestic', 'Majestic', 'ماجستيك', '/majestic/intro-poster-new.jpg'],
  ['twilight', 'Twilight', 'توايلايت', '/twilight/preview.jpg'],
  ['imperial', 'Imperial', 'إمبريال', '/imperial/preview.jpg'],
  ['toscana', 'Toscana', 'توسكانا', '/toscana/preview.jpg'],
  ['sacredgarden', 'The Sacred Garden', 'الحديقة المقدسة', '/sacredgarden/preview.png'],
  ['blossomoud', 'Blossom Oud', 'بلوسوم عود', '/blossomoud/preview.png'],
  ['dolcevita', 'Dolce Vita', 'دولتشي فيتا', '/dolcevita/preview.png'],
  ['destinationlove', 'Destination Love', 'حب السفر', '/destinationlove/preview.jpg'],
  ['classic', 'Classic', 'كلاسيك', '/classic/assets/preloader-poster.jpg'],
  ['bab', 'Bab', 'باب الفرح', '/bab/assets/door-poster.jpg'],
  ['reverie', 'Reverie', 'حلم وردي', '/reverie/assets/envelope-poster.jpg'],
  ['ring', 'Ring', 'الخاتم', '/ring/assets/video-poster.jpg'],
  ['letter', 'Letter', 'رسالة', '/letter/assets/letter-open.jpg'],
  ['disney', 'Disney', 'ديزني', '/disney/assets/door-poster.jpg'],
  ['rozana', 'Rozana', 'روزنة', '/rozana/assets/poster.jpg'],
  ['hadeel', 'Hadeel', 'هديل', '/hadeel/assets/poster.jpg'],
  ['wisal', 'Wisal', 'وصال', '/wisal/assets/poster.jpg'],
  ['vangogh', 'Vangogh', 'ليلة النجوم', '/vangogh/assets/preloader-poster.jpg'],
  ['blush', 'Blush', 'وردة', '/blush/assets/share.jpg'],
];

const openings = [
  ['native-template', 'Native Template Opening', 'الافتتاحية الأصلية للقالب', 'native-template'],
  ['minimal-fade', 'Minimal Fade', 'تلاشي بسيط', 'shared-overlay'],
  ['no-opening', 'No Opening', 'بدون افتتاحية', 'none'],
];

function parseJsonSafely(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function buildContentConfig(invitation) {
  const story = parseJsonSafely(invitation.coupleStory, {});
  return {
    groomName: invitation.groomName || '',
    brideName: invitation.brideName || '',
    welcomeMessage: invitation.welcomeMessage || story.heroSub || '',
    verseText: story.verseText || story.verse || '',
    invitationText: story.invitationText || '',
    groomParentsLabel: story.groomParentsLabel || 'عائلة العريس',
    groomParents: story.groomParents || '',
    brideParentsLabel: story.brideParentsLabel || 'عائلة العروس',
    brideParents: story.brideParents || '',
    venueName: invitation.venueName || '',
    venueAddress: invitation.venueAddress || '',
    locationLink: story.locationLink || story.mapUrl || '',
    contactLabel: story.contactLabel || 'للاستفسار والتأكيد',
    contactName: story.contactName || '',
    contactPhone: story.contactPhone || '',
    closingNote: story.closingNote || '',
    closingHashtag: story.closingHashtag || story.hashtag || '',
    closingFamilies: story.closingFamilies || '',
    musicUrl: invitation.musicUrl || '',
    venueImage: story.venueImage || invitation.coverImage || '',
    galleryImages: Array.isArray(story.galleryImages) ? story.galleryImages : [],
    program: Array.isArray(story.program) ? story.program : [],
    notes: Array.isArray(story.notes) ? story.notes : [],
  };
}

async function seedTemplates() {
  for (const [slug, name, nameAr, previewImage] of templates) {
    if (dryRun) {
      console.log(`[dry-run] upsert template ${slug}`);
      continue;
    }

    await prisma.template.upsert({
      where: { slug },
      update: { name, nameAr, previewImage },
      create: { slug, name, nameAr, previewImage },
    });
  }
}

async function seedOpenings() {
  for (const [slug, name, nameAr, type] of openings) {
    if (dryRun) {
      console.log(`[dry-run] upsert opening ${slug}`);
      continue;
    }

    await prisma.opening.upsert({
      where: { slug },
      update: { name, nameAr, type, status: 'ACTIVE', isActive: true },
      create: { slug, name, nameAr, type, status: 'ACTIVE', isActive: true },
    });
  }
}

async function createLegacyRevision(invitation) {
  const latest = await prisma.invitationRevision.findFirst({
    where: { invitationId: invitation.id },
    orderBy: { revisionNumber: 'desc' },
  });

  if (latest) {
    return;
  }

  await prisma.invitationRevision.create({
    data: {
      invitationId: invitation.id,
      revisionNumber: 1,
      status: invitation.status || 'DRAFT',
      changeSummary: 'Legacy snapshot before config backfill',
      snapshot: {
        legacy: true,
        coupleStory: invitation.coupleStory,
        sections: invitation.sections,
        customColors: invitation.customColors,
        customFonts: invitation.customFonts,
      },
    },
  });
}

async function backfillInvitations() {
  const nativeOpening = dryRun
    ? { id: 'dry-run-opening' }
    : await prisma.opening.findUnique({ where: { slug: 'native-template' } });

  const invitations = await prisma.invitation.findMany({
    where: invitationSlug ? { slug: invitationSlug } : undefined,
    include: { template: true },
    take: limit || undefined,
    orderBy: { createdAt: 'asc' },
  });

  const report = {
    scanned: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    failures: [],
  };

  for (const invitation of invitations) {
    report.scanned += 1;

    try {
      const needsContent = !invitation.contentConfig;
      const needsTheme = !invitation.themeConfig;
      const needsSections = !invitation.sectionConfig;
      const needsOpening = !invitation.openingId && nativeOpening;

      if (!needsContent && !needsTheme && !needsSections && !needsOpening) {
        report.skipped += 1;
        continue;
      }

      if (dryRun) {
        console.log(`[dry-run] would backfill invitation ${invitation.slug}`);
        report.updated += 1;
        continue;
      }

      await createLegacyRevision(invitation);

      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          contentConfig: needsContent ? buildContentConfig(invitation) : invitation.contentConfig,
          themeConfig: needsTheme
            ? {
                ...parseJsonSafely(invitation.customColors, {}),
                ...parseJsonSafely(invitation.customFonts, {}),
              }
            : invitation.themeConfig,
          sectionConfig: needsSections
            ? {
                hero: true,
                details: true,
                timeline: true,
                gallery: true,
                rsvp: true,
                calendar: true,
                ...parseJsonSafely(invitation.sections, {}),
              }
            : invitation.sectionConfig,
          openingConfig: invitation.openingConfig || { allowSkip: true },
          openingId: needsOpening ? nativeOpening.id : invitation.openingId,
          legacyConfig: invitation.legacyConfig || parseJsonSafely(invitation.coupleStory, {}),
          migrationState: {
            migratedAt: new Date().toISOString(),
            source: 'legacy-columns',
          },
        },
      });

      report.updated += 1;
    } catch (error) {
      report.failed += 1;
      report.failures.push({
        slug: invitation.slug,
        message: error.message,
      });
      console.error(`Backfill failed for invitation ${invitation.slug}:`, error.message);
    }
  }

  return report;
}

async function main() {
  console.log(dryRun ? 'Running backfill in dry-run mode...' : 'Running backfill against the configured database...');
  console.log(`Filters: slug=${invitationSlug || 'ALL'}, limit=${limit || 'ALL'}`);

  await seedTemplates();
  await seedOpenings();
  const report = await backfillInvitations();

  console.log('Backfill report:');
  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
