const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.template.upsert({
    where: { slug: 'sacredgarden' },
    update: {},
    create: {
      name: 'The Sacred Garden',
      nameAr: 'الحديقة المقدسة',
      slug: 'sacredgarden',
      description: 'دعوة زفاف تتميز بالورود والحدائق (من Webgency).',
      previewImage: '/sacredgarden/assets/48_wax_seal_1.png',
      isActive: true,
    }
  });
  console.log('Template inserted/updated:', template);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
