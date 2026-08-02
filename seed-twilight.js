const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.template.upsert({
    where: { slug: 'twilight' },
    update: {},
    create: {
      name: 'Twilight',
      nameAr: 'تويلايت',
      slug: 'twilight',
      description: 'دعوة زفاف غامضة وفخمة مستوحاة من الألوان الداكنة والذهبية، مع رسوم توضيحية للأشجار وإضاءة خافتة.',
      previewImage: '/twilight/goldleaf-sage-open-poster.jpg',
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
