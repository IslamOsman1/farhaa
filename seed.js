const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
  try {
    const hp = await hash('admin123', 10);
    await prisma.admin.create({ data: { email: 'admin@farha.com', password: hp, name: 'المدير' } });
    await prisma.siteSettings.create({ data: { whatsapp: '201001473345', email: 'contact@farha.com', facebook: '#', instagram: '#' } });
    console.log('Seeded successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
seed();
