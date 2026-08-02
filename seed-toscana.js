const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.template.upsert({
    where: { slug: 'toscana' },
    update: {},
    create: {
      name: 'Toscana',
      nameAr: 'توسكانا',
      slug: 'toscana',
      description: 'دعوة زفاف دافئة بألوان التيراكوتا والطبيعة المستوحاة من الريف الإيطالي.',
      previewImage: '/toscana/goldleaf-terracotta-open-poster.jpg',
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
