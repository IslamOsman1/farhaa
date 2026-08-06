const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const templates = [
  { slug: 'jathuandthanu', name: 'Jathu & Thanu', nameAr: 'جاثو وثانو', previewImage: '/jathuandthanu/preview.png' },
  { slug: 'royal', name: 'Royal', nameAr: 'الملكي', previewImage: '/majestic/intro-poster-new.jpg' },
  { slug: 'majestic', name: 'Majestic', nameAr: 'ماجستيك', previewImage: '/majestic/intro-poster-new.jpg' },
  { slug: 'twilight', name: 'Twilight', nameAr: 'تويلايت', previewImage: '/twilight/preview.jpg' },
  { slug: 'imperial', name: 'Imperial', nameAr: 'إمبريال', previewImage: '/imperial/preview.jpg' },
  { slug: 'toscana', name: 'Toscana', nameAr: 'توسكانا', previewImage: '/toscana/preview.jpg' },
  { slug: 'sacredgarden', name: 'The Sacred Garden', nameAr: 'الحديقة المقدسة', previewImage: '/sacredgarden/preview.png' },
  { slug: 'blossomoud', name: 'Blossom Oud', nameAr: 'بلوسوم عود', previewImage: '/blossomoud/preview.png' },
  { slug: 'dolcevita', name: 'Dolce Vita', nameAr: 'دولتشي فيتا', previewImage: '/dolcevita/preview.png' },
  { slug: 'destinationlove', name: 'Destination Love', nameAr: 'حب السفر', previewImage: '/destinationlove/preview.jpg' },
  { slug: 'classic', name: 'Classic', nameAr: 'كلاسيك', previewImage: '/classic/assets/preloader-poster.jpg' },
  { slug: 'bab', name: 'Bab', nameAr: 'باب الفرح', previewImage: '/bab/assets/door-poster.jpg' },
  { slug: 'reverie', name: 'Reverie', nameAr: 'حُلم وردي', previewImage: '/reverie/assets/envelope-poster.jpg' },
  { slug: 'ring', name: 'Ring', nameAr: 'الخاتم', previewImage: '/ring/assets/video-poster.jpg' },
  { slug: 'letter', name: 'Letter', nameAr: 'رسالة', previewImage: '/letter/assets/letter-open.jpg' },
  { slug: 'disney', name: 'Disney', nameAr: 'ديزني', previewImage: '/disney/assets/door-poster.jpg' },
  { slug: 'rozana', name: 'Rozana', nameAr: 'روزنة', previewImage: '/rozana/assets/poster.jpg' },
  { slug: 'hadeel', name: 'Hadeel', nameAr: 'هديل', previewImage: '/hadeel/assets/poster.jpg' },
  { slug: 'wisal', name: 'Wisal', nameAr: 'وِصال', previewImage: '/wisal/assets/poster.jpg' },
  { slug: 'vangogh', name: 'Vangogh', nameAr: 'ليلة النجوم', previewImage: '/vangogh/assets/preloader-poster.jpg' },
  { slug: 'blush', name: 'Blush', nameAr: 'وردة', previewImage: '/blush/assets/share.jpg' },
];

const openings = [
  { slug: 'native-template', name: 'Native Template Opening', nameAr: 'الافتتاحية الأصلية للقالب', type: 'native-template' },
  { slug: 'minimal-fade', name: 'Minimal Fade', nameAr: 'تلاشي بسيط', type: 'shared-overlay' },
  { slug: 'no-opening', name: 'No Opening', nameAr: 'بدون افتتاحية', type: 'none' },
];

async function main() {
  console.log('Seeding FARHA templates...');

  for (const template of templates) {
    await prisma.template.upsert({
      where: { slug: template.slug },
      update: {
        name: template.name,
        nameAr: template.nameAr,
        previewImage: template.previewImage,
      },
      create: template,
    });
  }

  console.log('Seeding FARHA openings...');

  for (const opening of openings) {
    await prisma.opening.upsert({
      where: { slug: opening.slug },
      update: {
        name: opening.name,
        nameAr: opening.nameAr,
        type: opening.type,
        status: 'ACTIVE',
      },
      create: {
        ...opening,
        status: 'ACTIVE',
        isActive: true,
      },
    });
  }

  const settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    await prisma.siteSettings.create({
      data: {
        companyName: 'FARHA',
        whatsapp: '201001473345',
      },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
