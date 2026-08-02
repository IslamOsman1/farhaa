const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const template = await prisma.template.upsert({
    where: { slug: 'majestic' },
    update: {
      defaultConfig: JSON.stringify({
        galleryImages: [
          '/majestic/gallery1.jpg',
          '/majestic/gallery2.jpg'
        ]
      })
    },
    create: {
      name: 'Majestic',
      nameAr: 'ماجستيك',
      slug: 'majestic',
      description: 'دعوة زفاف فيديو سينمائية بمظهر المظروف المتحرك مع إضاءة ساحرة وتصميم راقي (مستوحى من Wedvite).',
      previewImage: '/majestic/intro-poster-new.jpg',
      isActive: true,
      defaultConfig: JSON.stringify({
        galleryImages: [
          '/majestic/gallery1.jpg',
          '/majestic/gallery2.jpg'
        ]
      })
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
