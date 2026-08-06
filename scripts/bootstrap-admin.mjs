import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
  const username = process.env.ADMIN_BOOTSTRAP_USERNAME?.trim() || null;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || 'مالك FARHA';

  if (!email && !username) {
    throw new Error('Set ADMIN_BOOTSTRAP_EMAIL or ADMIN_BOOTSTRAP_USERNAME before running bootstrap:admin.');
  }

  if (!password || password.length < 8) {
    throw new Error('ADMIN_BOOTSTRAP_PASSWORD must be at least 8 characters.');
  }

  const passwordHash = await hash(password, 12);
  const existing = await prisma.adminUser.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(username ? [{ username }] : []),
      ],
    },
  });

  if (existing) {
    await prisma.adminUser.update({
      where: { id: existing.id },
      data: {
        name,
        email,
        username,
        passwordHash,
        role: 'owner',
        isActive: true,
      },
    });
    console.log(`Updated admin account: ${email || username}`);
    return;
  }

  await prisma.adminUser.create({
    data: {
      name,
      email,
      username,
      passwordHash,
      role: 'owner',
      isActive: true,
    },
  });

  console.log(`Created admin account: ${email || username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
