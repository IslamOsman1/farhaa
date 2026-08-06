import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const invitations = await prisma.invitation.findMany({
    take: 25,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      contentConfig: true,
      themeConfig: true,
      sectionConfig: true,
      openingConfig: true,
      migrationState: true,
    },
  });

  const report = {
    checked: invitations.length,
    valid: 0,
    invalid: 0,
    invalidIds: [],
  };

  invitations.forEach((invitation) => {
    const valid =
      invitation.contentConfig &&
      invitation.themeConfig &&
      invitation.sectionConfig &&
      invitation.openingConfig;

    if (valid) {
      report.valid += 1;
    } else {
      report.invalid += 1;
      report.invalidIds.push(invitation.slug);
    }
  });

  console.log(JSON.stringify(report, null, 2));

  if (report.invalid > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('Database verification failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
