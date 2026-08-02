const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.template.upsert({
    where: { slug: 'jathuandthanu' },
    update: {},
    create: {
      name: 'Jathu & Thanu',
      nameAr: 'جاثو وثانو',
      slug: 'jathuandthanu',
      description: 'دعوة زفاف هندية/آسيوية فاخرة (من Webgency).',
      previewImage: '/jathuandthanu/preview.png',
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
