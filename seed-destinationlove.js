const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.template.upsert({
    where: { slug: 'destinationlove' },
    update: {},
    create: {
      name: 'Destination Love',
      nameAr: 'حب السفر',
      slug: 'destinationlove',
      description: 'دعوة زفاف بتصميم تذكرة سفر (من Webgency).',
      previewImage: '/destinationlove/assets/36_992b0990-c265-4a14-8.png',
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
