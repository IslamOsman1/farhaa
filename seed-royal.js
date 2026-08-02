const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.template.upsert({
    where: { slug: 'royal' },
    update: {},
    create: {
      name: 'Royal',
      nameAr: 'الملكي',
      slug: 'royal',
      description: 'تصميم فخم بمظروف متحرك مستوحى من الحفلات الملكية.',
      previewImage: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=600&auto=format&fit=crop',
      isActive: true
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
