const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.template.upsert({
    where: { slug: 'blossomoud' },
    update: {},
    create: {
      name: 'Blossom Oud',
      nameAr: 'بلوسوم عود',
      slug: 'blossomoud',
      description: 'دعوة زفاف أنيقة مستوحاة من العود والأزهار (من Webgency).',
      previewImage: '/blossomoud/assets/38_decor-line_1.png',
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
