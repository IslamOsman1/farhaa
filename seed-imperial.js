const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.template.upsert({
    where: { slug: 'imperial' },
    update: {},
    create: {
      name: 'Imperial',
      nameAr: 'إمبريال',
      slug: 'imperial',
      description: 'دعوة زفاف إمبراطورية فاخرة بألوان عميقة، مع شموع وزخارف فخمة تضفي طابعاً كلاسيكياً.',
      previewImage: '/imperial/goldleaf-sage-open-poster.jpg',
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
