const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.template.upsert({
    where: { slug: 'dolcevita' },
    update: {},
    create: {
      name: 'Dolce Vita',
      nameAr: 'دولتشي فيتا',
      slug: 'dolcevita',
      description: 'دعوة زفاف إيطالية الطابع (من Webgency).',
      previewImage: '/dolcevita/assets/36_Old_Open_Envelope_PN.png',
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
