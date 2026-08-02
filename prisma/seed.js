const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with templates from the site...');

  // Create Templates from order/page.js
  const templates = [
    { name: 'Classic', nameAr: 'كلاسيك', slug: 'classic', previewImage: '/classic/assets/preloader-poster.jpg' },
    { name: 'Bab', nameAr: 'باب الفرح', slug: 'bab', previewImage: '/bab/assets/door-poster.jpg' },
    { name: 'Reverie', nameAr: 'حُلم وردي', slug: 'reverie', previewImage: '/reverie/assets/envelope-poster.jpg' },
    { name: 'Ring', nameAr: 'الخاتم', slug: 'ring', previewImage: '/ring/assets/video-poster.jpg' },
    { name: 'Letter', nameAr: 'رسالة', slug: 'letter', previewImage: '/letter/assets/letter-open.jpg' },
    { name: 'Disney', nameAr: 'ديزني', slug: 'disney', previewImage: '/disney/assets/door-poster.jpg' },
    { name: 'Rozana', nameAr: 'روزنة', slug: 'rozana', previewImage: '/rozana/assets/poster.jpg' },
    { name: 'Hadeel', nameAr: 'هديل', slug: 'hadeel', previewImage: '/hadeel/assets/poster.jpg' },
    { name: 'Wisal', nameAr: 'وِصال', slug: 'wisal', previewImage: '/wisal/assets/poster.jpg' },
    { name: 'Vangogh', nameAr: 'ليلة النجوم', slug: 'vangogh', previewImage: '/vangogh/assets/preloader-poster.jpg' },
    { name: 'Blush', nameAr: 'وردة', slug: 'blush', previewImage: '/blush/assets/share.jpg' }
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        nameAr: t.nameAr,
        previewImage: t.previewImage
      },
      create: {
        name: t.name,
        nameAr: t.nameAr,
        slug: t.slug,
        previewImage: t.previewImage
      },
    });
  }

  console.log('Templates seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
