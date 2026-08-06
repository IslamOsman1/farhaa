import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [templates, openings, invitations] = await Promise.all([
    prisma.template.count(),
    prisma.opening.count(),
    prisma.invitation.count(),
  ]);

  console.log('Database validation report');
  console.log(`Templates: ${templates}`);
  console.log(`Openings: ${openings}`);
  console.log(`Invitations: ${invitations}`);
}

main()
  .catch((error) => {
    console.error('Database validation failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
